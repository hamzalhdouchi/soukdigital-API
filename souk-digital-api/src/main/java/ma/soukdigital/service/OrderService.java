package ma.soukdigital.service;

import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.*;
import ma.soukdigital.entity.*;
import ma.soukdigital.exception.EntityNotFoundException;
import ma.soukdigital.exception.InsufficientStockException;
import ma.soukdigital.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final BigDecimal FREE_DELIVERY_THRESHOLD = BigDecimal.valueOf(300);
    private static final BigDecimal DELIVERY_FEE            = BigDecimal.valueOf(35);

    private final OrderRepository     orderRepository;
    private final ProductRepository   productRepository;
    private final PromoCodeRepository promoCodeRepository;
    private final UserRepository      userRepository;
    private final VendorRepository    vendorRepository;
    private final EmailService        emailService;

    @Transactional
    public OrderDetailDto placeOrder(PlaceOrderRequest req, UUID buyerId) {
        User buyer = userRepository.findById(buyerId)
            .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable."));

        // 1. Validate stock & build items
        List<OrderItem> items = req.items().stream().map(itemReq -> {
            Product product = productRepository.findById(itemReq.productId())
                .orElseThrow(() -> new EntityNotFoundException("Produit introuvable : " + itemReq.productId()));
            if (!product.isActive()) {
                throw new EntityNotFoundException("Produit non disponible : " + product.getName());
            }
            if (product.getStockCount() < itemReq.quantity()) {
                throw new InsufficientStockException(product.getName(), product.getStockCount());
            }
            String image = product.getImages().isEmpty() ? null : product.getImages().get(0);
            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.quantity()));
            return OrderItem.builder()
                .product(product)
                .vendor(product.getVendor())
                .productName(product.getName())
                .productImage(image)
                .price(product.getPrice())
                .quantity(itemReq.quantity())
                .subtotal(subtotal)
                .build();
        }).toList();

        // 2. Subtotal
        BigDecimal subtotal = items.stream()
            .map(OrderItem::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Promo code
        BigDecimal discountAmount = BigDecimal.ZERO;
        String appliedPromo = null;
        if (req.promoCode() != null && !req.promoCode().isBlank()) {
            PromoCode promo = promoCodeRepository
                .findByCodeIgnoreCaseAndIsActiveTrue(req.promoCode())
                .orElseThrow(() -> new EntityNotFoundException("Code promo invalide ou expiré."));
            if (promo.getExpiresAt() != null && promo.getExpiresAt().isBefore(OffsetDateTime.now())) {
                throw new EntityNotFoundException("Code promo expiré.");
            }
            if (promo.getMaxUses() != null && promo.getUsedCount() >= promo.getMaxUses()) {
                throw new EntityNotFoundException("Code promo épuisé.");
            }
            discountAmount = subtotal
                .multiply(promo.getDiscountPercent())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            promo.setUsedCount(promo.getUsedCount() + 1);
            promoCodeRepository.save(promo);
            appliedPromo = promo.getCode();
        }

        // 4. Delivery fee
        BigDecimal afterDiscount = subtotal.subtract(discountAmount);
        BigDecimal deliveryFee = afterDiscount.compareTo(FREE_DELIVERY_THRESHOLD) >= 0
            ? BigDecimal.ZERO : DELIVERY_FEE;

        // 5. Total
        BigDecimal total = afterDiscount.add(deliveryFee);

        // 6. Build order
        DeliveryAddressRequest addr = req.address();
        Order order = Order.builder()
            .buyer(buyer)
            .status(OrderStatus.PENDING)
            .paymentMethod(req.paymentMethod())
            .paymentStatus(PaymentStatus.PENDING)
            .subtotal(subtotal)
            .discountAmount(discountAmount)
            .deliveryFee(deliveryFee)
            .total(total)
            .promoCode(appliedPromo)
            .deliveryAddress(new DeliveryAddress(
                addr.firstName(), addr.lastName(),
                addr.phone(), addr.street(), addr.city(), addr.zipCode()))
            .build();

        // 7. Link items to order & decrement stock
        items.forEach(item -> {
            item.setOrder(order);
            order.getItems().add(item);
            Product p = item.getProduct();
            int newStock = p.getStockCount() - item.getQuantity();
            p.setStockCount(newStock);
            if (newStock == 0) p.setActive(false);
            productRepository.save(p);
        });

        // 8. COD orders auto-confirm
        if (req.paymentMethod() == PaymentMethod.COD) {
            order.setStatus(OrderStatus.CONFIRMED);
            order.setPaymentStatus(PaymentStatus.PENDING);
        }

        Order saved = orderRepository.save(order);
        emailService.sendOrderConfirmation(saved);
        return toDetail(saved);
    }

    @Transactional(readOnly = true)
    public Page<OrderSummaryDto> getMyOrders(UUID buyerId, int page, int size) {
        return orderRepository
            .findByBuyerIdOrderByCreatedAtDesc(buyerId, PageRequest.of(page, size))
            .map(this::toSummary);
    }

    @Transactional(readOnly = true)
    public OrderDetailDto getOrderById(UUID orderId, UUID userId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new EntityNotFoundException("Commande introuvable."));

        boolean isBuyer  = order.getBuyer().getId().equals(userId);
        boolean isVendor = order.getItems().stream()
            .anyMatch(i -> i.getVendor().getUser().getId().equals(userId));

        if (!isBuyer && !isVendor) {
            throw new AccessDeniedException("Accès refusé.");
        }
        return toDetail(order);
    }

    @Transactional
    public OrderDetailDto updateStatus(UUID orderId, OrderStatus newStatus, UUID userId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new EntityNotFoundException("Commande introuvable."));

        boolean isVendor = order.getItems().stream()
            .anyMatch(i -> i.getVendor().getUser().getId().equals(userId));
        if (!isVendor) {
            throw new AccessDeniedException("Accès refusé.");
        }
        validateTransition(order.getStatus(), newStatus);
        order.setStatus(newStatus);
        return toDetail(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public Page<OrderSummaryDto> getVendorOrders(UUID userId, OrderStatus status, int page, int size) {
        Vendor vendor = vendorRepository.findByUserId(userId)
            .orElseThrow(() -> new EntityNotFoundException("Profil vendeur introuvable."));
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (status != null) {
            return orderRepository.findByVendorIdAndStatus(vendor.getId(), status, pageable).map(this::toSummary);
        }
        return orderRepository.findByVendorId(vendor.getId(), pageable).map(this::toSummary);
    }

    @Transactional(readOnly = true)
    public OrderDetailDto getOrderDetailAdmin(UUID orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new EntityNotFoundException("Commande introuvable."));
        return toDetail(order);
    }

    // ── Helpers ───────────────────────────────────────────────

    private void validateTransition(OrderStatus current, OrderStatus next) {
        boolean valid = switch (current) {
            case PENDING    -> next == OrderStatus.CONFIRMED  || next == OrderStatus.CANCELLED;
            case CONFIRMED  -> next == OrderStatus.PROCESSING || next == OrderStatus.CANCELLED;
            case PROCESSING -> next == OrderStatus.SHIPPED;
            case SHIPPED    -> next == OrderStatus.DELIVERED;
            default         -> false;
        };
        if (!valid) {
            throw new IllegalArgumentException(
                "Transition invalide : " + current + " → " + next);
        }
    }

    private OrderSummaryDto toSummary(Order o) {
        OrderItem first = o.getItems().isEmpty() ? null : o.getItems().get(0);
        return new OrderSummaryDto(
            o.getId(), o.getStatus(), o.getPaymentMethod(), o.getPaymentStatus(),
            o.getTotal(), o.getCreatedAt(),
            o.getItems().size(),
            first != null ? first.getProductName() : null,
            first != null ? first.getProductImage() : null
        );
    }

    private OrderDetailDto toDetail(Order o) {
        DeliveryAddress a = o.getDeliveryAddress();
        DeliveryAddressRequest addr = a == null ? null :
            new DeliveryAddressRequest(a.getFirstName(), a.getLastName(),
                a.getPhone(), a.getStreet(), a.getCity(), a.getZipCode());

        List<OrderItemDto> items = o.getItems().stream().map(i ->
            new OrderItemDto(
                i.getProduct().getId(), i.getProductName(), i.getProductImage(),
                i.getVendor().getId(), i.getVendor().getName(),
                i.getPrice(), i.getQuantity(), i.getSubtotal()
            )).toList();

        BuyerDto buyer = new BuyerDto(
            o.getBuyer().getId(), o.getBuyer().getFirstName(),
            o.getBuyer().getLastName(), o.getBuyer().getPhone());

        return new OrderDetailDto(
            o.getId(), o.getStatus(), o.getPaymentMethod(), o.getPaymentStatus(),
            o.getSubtotal(), o.getDiscountAmount(), o.getDeliveryFee(), o.getTotal(),
            o.getPromoCode(), o.getTrackingNumber(), o.getCreatedAt(),
            addr, items, buyer
        );
    }
}
