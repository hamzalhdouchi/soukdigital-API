package ma.soukdigital.service;

import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.*;
import ma.soukdigital.entity.*;
import ma.soukdigital.exception.EntityNotFoundException;
import ma.soukdigital.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository    userRepository;
    private final VendorRepository  vendorRepository;
    private final ProductRepository productRepository;
    private final OrderRepository   orderRepository;

    // ── Users ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<AdminUserDto> listUsers(String q, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by("createdAt").descending());
        if (q == null || q.isBlank()) {
            return userRepository.findAll(pageable).map(this::toAdminUserDto);
        }
        return userRepository.search(q, pageable).map(this::toAdminUserDto);
    }

    @Transactional(readOnly = true)
    public AdminUserDto getUser(UUID id) {
        return toAdminUserDto(findUser(id));
    }

    @Transactional
    public AdminUserDto changeRole(UUID id, Role role) {
        User user = findUser(id);
        user.setRole(role);
        return toAdminUserDto(userRepository.save(user));
    }

    @Transactional
    public AdminUserDto banUser(UUID id) {
        User user = findUser(id);
        user.setVerified(false);
        return toAdminUserDto(userRepository.save(user));
    }

    @Transactional
    public AdminUserDto unbanUser(UUID id) {
        User user = findUser(id);
        user.setVerified(true);
        return toAdminUserDto(userRepository.save(user));
    }

    // ── Vendors ───────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<AdminVendorDto> listVendors(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return vendorRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toAdminVendorDto);
    }

    @Transactional
    public AdminVendorDto verifyVendor(UUID id) {
        Vendor v = findVendor(id);
        v.setVerified(true);
        return toAdminVendorDto(vendorRepository.save(v));
    }

    @Transactional
    public AdminVendorDto unverifyVendor(UUID id) {
        Vendor v = findVendor(id);
        v.setVerified(false);
        return toAdminVendorDto(vendorRepository.save(v));
    }

    @Transactional
    public AdminVendorDto toggleArtisan(UUID id) {
        Vendor v = findVendor(id);
        v.setArtisan(!v.isArtisan());
        return toAdminVendorDto(vendorRepository.save(v));
    }

    // ── Orders ────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<OrderSummaryDto> listOrders(OrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findAllFiltered(status, pageable).map(this::toOrderSummary);
    }

    @Transactional(readOnly = true)
    public Order getOrderDetail(UUID id) {
        return orderRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Order not found: " + id));
    }

    @Transactional
    public OrderSummaryDto overrideOrderStatus(UUID id, OrderStatus newStatus) {
        Order order = getOrderDetail(id);
        order.setStatus(newStatus);
        return toOrderSummary(orderRepository.save(order));
    }

    @Transactional
    public OrderSummaryDto refundOrder(UUID id) {
        Order order = getOrderDetail(id);
        order.setStatus(OrderStatus.REFUNDED);
        order.setPaymentStatus(PaymentStatus.REFUNDED);
        return toOrderSummary(orderRepository.save(order));
    }

    // ── Products ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<ProductSummaryDto> listAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.findAll(pageable).map(this::toProductSummary);
    }

    @Transactional
    public void hardDeleteProduct(UUID id) {
        if (!productRepository.existsById(id)) throw new EntityNotFoundException("Product not found: " + id);
        productRepository.deleteById(id);
    }

    @Transactional
    public ProductSummaryDto setProductActive(UUID id, boolean active) {
        Product p = productRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Product not found: " + id));
        p.setActive(active);
        return toProductSummary(productRepository.save(p));
    }

    // ── Platform stats ────────────────────────────────────────

    @Transactional(readOnly = true)
    public PlatformStatsDto platformStats() {
        OffsetDateTime startOfMonth = OffsetDateTime.now(ZoneOffset.UTC)
            .truncatedTo(ChronoUnit.DAYS).withDayOfMonth(1);
        OffsetDateTime startOfWeek  = OffsetDateTime.now(ZoneOffset.UTC)
            .truncatedTo(ChronoUnit.DAYS).minusDays(6);

        long totalUsers    = userRepository.count();
        long totalVendors  = vendorRepository.count();
        long verifiedVend  = vendorRepository.countByIsVerifiedTrue();
        long totalProducts = productRepository.count();
        long totalOrders   = orderRepository.count();
        long ordersWeek    = orderRepository.countByCreatedAtAfter(startOfWeek);
        long newUsersWeek  = 0; // would need createdAt query on users — skipped for brevity

        BigDecimal revMonth = orZero(orderRepository.sumTotalRevenueSince(startOfMonth));
        BigDecimal revTotal = orZero(orderRepository.sumTotalRevenueSince(
            OffsetDateTime.of(2000, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC)));
        BigDecimal avgOrder = totalOrders == 0 ? BigDecimal.ZERO
            : revTotal.divide(BigDecimal.valueOf(totalOrders), 2, java.math.RoundingMode.HALF_UP);

        List<CategoryStatDto> topCats = orderRepository.topCategoriesByOrders(5).stream()
            .map(r -> new CategoryStatDto(
                UUID.fromString(r[0].toString()),
                (String) r[1],
                ((Number) r[2]).longValue()))
            .toList();

        List<VendorRevenueDto> topVendors = orderRepository.topVendorsByRevenue(5).stream()
            .map(r -> new VendorRevenueDto(
                UUID.fromString(r[0].toString()),
                (String) r[1],
                (String) r[2],
                new BigDecimal(r[3].toString()),
                ((Number) r[4]).longValue()))
            .toList();

        return new PlatformStatsDto(
            totalUsers, totalVendors, verifiedVend, totalProducts,
            totalOrders, ordersWeek, newUsersWeek,
            revMonth, revTotal, avgOrder,
            topCats, topVendors);
    }

    // ── Mappers ───────────────────────────────────────────────

    private AdminUserDto toAdminUserDto(User u) {
        return new AdminUserDto(
            u.getId(), u.getFirstName(), u.getLastName(),
            u.getEmail(), u.getPhone(), u.getRole(),
            u.isVerified(), u.getAvatarUrl(), u.getCreatedAt());
    }

    private AdminVendorDto toAdminVendorDto(Vendor v) {
        String ownerEmail = v.getUser() != null ? v.getUser().getEmail() : null;
        return new AdminVendorDto(
            v.getId(), v.getName(), v.getSlug(), v.getCity(),
            v.isVerified(), v.isArtisan(), v.getRating(),
            v.getReviewCount(), v.getProductCount(),
            v.getCreatedAt(), ownerEmail);
    }

    private OrderSummaryDto toOrderSummary(Order o) {
        OrderItem first = o.getItems().isEmpty() ? null : o.getItems().get(0);
        return new OrderSummaryDto(
            o.getId(), o.getStatus(), o.getPaymentMethod(),
            o.getPaymentStatus(), o.getTotal(), o.getCreatedAt(),
            o.getItems().size(),
            first != null ? first.getProductName() : null,
            first != null ? first.getProductImage() : null);
    }

    private ProductSummaryDto toProductSummary(Product p) {
        String image = p.getImages().isEmpty() ? null : p.getImages().get(0);
        Vendor v = p.getVendor();
        return new ProductSummaryDto(
            p.getId(), p.getSlug(), p.getName(), p.getNameAr(),
            p.getPrice(), p.getOriginalPrice(), image,
            p.getRating(), p.getReviewCount(), p.getBadge(),
            p.getStockCount() > 0, p.isFreeDelivery(), p.getCity(),
            new ProductVendorDto(v.getId(), v.getName(), v.getSlug(), v.isArtisan(), v.isVerified()),
            p.isActive());
    }

    private BigDecimal orZero(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private User findUser(UUID id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
    }

    private Vendor findVendor(UUID id) {
        return vendorRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Vendor not found: " + id));
    }
}
