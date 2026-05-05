package ma.soukdigital.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import ma.soukdigital.entity.Order;
import ma.soukdigital.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    Page<Order> findByBuyerIdOrderByCreatedAtDesc(UUID buyerId, Pageable pageable);

    List<Order> findByStatus(OrderStatus status);

    long countByBuyerId(UUID buyerId);

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
}




