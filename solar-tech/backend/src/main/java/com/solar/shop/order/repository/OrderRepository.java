package com.solar.shop.order.repository;

import com.solar.shop.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByReference(String reference);

    Page<Order> findByUserEmail(String email, Pageable pageable);

    Page<Order> findByStatus(String status, Pageable pageable);
}
