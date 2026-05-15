package com.solar.shop.order.service;

import com.solar.shop.common.dto.PageResponse;
import com.solar.shop.common.exception.ResourceNotFoundException;
import com.solar.shop.order.dto.OrderCreateRequest;
import com.solar.shop.order.dto.OrderResponse;
import com.solar.shop.order.entity.Order;
import com.solar.shop.order.entity.OrderItem;
import com.solar.shop.order.repository.OrderRepository;
import com.solar.shop.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final BigDecimal TAX_RATE = new BigDecimal("0.20");

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderResponse create(OrderCreateRequest req, String userEmail) {
        BigDecimal subtotalHt = req.items().stream()
                .map(i -> i.unitPriceHt().multiply(BigDecimal.valueOf(i.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal subtotalTtc = req.items().stream()
                .map(i -> i.unitPriceTtc().multiply(BigDecimal.valueOf(i.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal taxAmount = subtotalTtc.subtract(subtotalHt);

        Order order = Order.builder()
                .reference(generateReference())
                .shippingFirstName(req.firstName())
                .shippingLastName(req.lastName())
                .shippingEmail(req.email())
                .shippingPhone(req.phone())
                .shippingAddress(req.address())
                .shippingCity(req.city())
                .shippingPostalCode(req.postalCode())
                .shippingCountry(req.country() != null ? req.country() : "FR")
                .notes(req.notes())
                .subtotalHt(subtotalHt)
                .taxAmount(taxAmount)
                .totalTtc(subtotalTtc)
                .build();

        if (userEmail != null) {
            userRepository.findByEmailAndDeletedAtIsNull(userEmail)
                    .ifPresent(order::setUser);
        }

        req.items().forEach(item -> {
            OrderItem oi = OrderItem.builder()
                    .order(order)
                    .productVariantId(item.variantId())
                    .productName(item.productName())
                    .variantLabel(item.variantLabel())
                    .quantity(item.quantity())
                    .unitPriceHt(item.unitPriceHt())
                    .unitPriceTtc(item.unitPriceTtc())
                    .build();
            order.getItems().add(oi);
        });

        return OrderResponse.from(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> findByUser(String email, Pageable pageable) {
        return PageResponse.from(orderRepository.findByUserEmail(email, pageable).map(OrderResponse::from));
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> findAll(String status, Pageable pageable) {
        var page = (status != null && !status.isBlank())
                ? orderRepository.findByStatus(status, pageable)
                : orderRepository.findAll(pageable);
        return PageResponse.from(page.map(OrderResponse::from));
    }

    @Transactional(readOnly = true)
    public OrderResponse findById(Long id) {
        return OrderResponse.from(orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id)));
    }

    @Transactional
    public OrderResponse updateStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        order.setStatus(status);
        return OrderResponse.from(orderRepository.save(order));
    }

    private String generateReference() {
        String month = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        int suffix = ThreadLocalRandom.current().nextInt(1000, 9999);
        String ref = "CMD-" + month + "-" + suffix;
        while (orderRepository.findByReference(ref).isPresent()) {
            suffix = ThreadLocalRandom.current().nextInt(1000, 9999);
            ref = "CMD-" + month + "-" + suffix;
        }
        return ref;
    }
}
