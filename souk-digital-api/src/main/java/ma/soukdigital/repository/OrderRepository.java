package ma.soukdigital.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    Page<Order> findByBuyerIdOrderByCreatedAtDesc(UUID buyerId, Pageable pageable);

    List<Order> findByStatus(OrderStatus status);

    long countByBuyerId(UUID buyerId);
}



