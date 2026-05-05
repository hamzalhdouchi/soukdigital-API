package ma.soukdigital.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import ma.soukdigital.entity.Order;
import ma.soukdigital.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    Page<Order> findByBuyerIdOrderByCreatedAtDesc(UUID buyerId, Pageable pageable);

    List<Order> findByStatus(OrderStatus status);

    long countByBuyerId(UUID buyerId);

    @Query("""
        SELECT o FROM Order o
        JOIN o.items i
        WHERE o.buyer.id = :buyerId
        AND i.product.id = :productId
        AND o.status = ma.soukdigital.entity.OrderStatus.DELIVERED
        ORDER BY o.createdAt DESC
        """)
    List<Order> findDeliveredOrderByBuyerAndProduct(
        @Param("buyerId") UUID buyerId,
        @Param("productId") UUID productId);

    @Query("""
        SELECT DISTINCT o FROM Order o
        JOIN o.items i
        WHERE i.vendor.id = :vendorId
        ORDER BY o.createdAt DESC
        """)
    Page<Order> findByVendorId(@Param("vendorId") UUID vendorId, Pageable pageable);

    @Query("""
        SELECT DISTINCT o FROM Order o
        JOIN o.items i
        WHERE i.vendor.id = :vendorId
        AND o.status = :status
        ORDER BY o.createdAt DESC
        """)
    Page<Order> findByVendorIdAndStatus(
        @Param("vendorId") UUID vendorId,
        @Param("status") OrderStatus status,
        Pageable pageable);

    // ── Dashboard queries ─────────────────────────────────────

    @Query("""
        SELECT COALESCE(SUM(i.price * i.quantity), 0)
        FROM OrderItem i
        WHERE i.vendor.id = :vendorId
        AND i.order.status = ma.soukdigital.entity.OrderStatus.DELIVERED
        AND i.order.createdAt >= :from
        """)
    BigDecimal sumRevenueByVendorSince(@Param("vendorId") UUID vendorId, @Param("from") OffsetDateTime from);

    @Query("""
        SELECT COUNT(DISTINCT o.id)
        FROM Order o JOIN o.items i
        WHERE i.vendor.id = :vendorId
        AND o.status = ma.soukdigital.entity.OrderStatus.DELIVERED
        AND o.createdAt >= :from
        """)
    long countDeliveredOrdersByVendorSince(@Param("vendorId") UUID vendorId, @Param("from") OffsetDateTime from);

    @Query("""
        SELECT o.status AS status, COUNT(DISTINCT o.id) AS cnt
        FROM Order o JOIN o.items i
        WHERE i.vendor.id = :vendorId
        GROUP BY o.status
        """)
    List<Object[]> countOrdersByStatusForVendor(@Param("vendorId") UUID vendorId);

    @Query(value = """
        SELECT TO_CHAR(DATE_TRUNC('month', o.created_at), 'YYYY-MM') AS month,
               COALESCE(SUM(i.price * i.quantity), 0)               AS revenue,
               COUNT(DISTINCT o.id)                                  AS order_count
        FROM orders o
        JOIN order_items i ON i.order_id = o.id
        WHERE i.vendor_id = :vendorId
          AND o.status = 'DELIVERED'
          AND o.created_at >= :from
        GROUP BY DATE_TRUNC('month', o.created_at)
        ORDER BY DATE_TRUNC('month', o.created_at)
        """, nativeQuery = true)
    List<Object[]> monthlyRevenueByVendor(
        @Param("vendorId") UUID vendorId,
        @Param("from") OffsetDateTime from);

    // ── Admin queries ─────────────────────────────────────────

    @Query("""
        SELECT o FROM Order o
        WHERE (:status IS NULL OR o.status = :status)
        ORDER BY o.createdAt DESC
        """)
    Page<Order> findAllFiltered(@Param("status") OrderStatus status, Pageable pageable);

    @Query("""
        SELECT COALESCE(SUM(o.total), 0) FROM Order o
        WHERE o.status = ma.soukdigital.entity.OrderStatus.DELIVERED
        AND o.createdAt >= :from
        """)
    java.math.BigDecimal sumTotalRevenueSince(@Param("from") OffsetDateTime from);

    long countByCreatedAtAfter(OffsetDateTime from);

    @Query(value = """
        SELECT c.id, c.name, COUNT(DISTINCT o.id) AS order_count
        FROM orders o
        JOIN order_items i ON i.order_id = o.id
        JOIN products p    ON p.id = i.product_id
        JOIN categories c  ON c.id = p.category_id
        WHERE o.status = 'DELIVERED'
        GROUP BY c.id, c.name
        ORDER BY order_count DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> topCategoriesByOrders(@Param("limit") int limit);

    @Query(value = """
        SELECT v.id, v.name, v.slug,
               COALESCE(SUM(i.price * i.quantity), 0) AS revenue,
               COUNT(DISTINCT o.id) AS order_count
        FROM orders o
        JOIN order_items i ON i.order_id = o.id
        JOIN vendors v     ON v.id = i.vendor_id
        WHERE o.status = 'DELIVERED'
        GROUP BY v.id, v.name, v.slug
        ORDER BY revenue DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> topVendorsByRevenue(@Param("limit") int limit);
}




