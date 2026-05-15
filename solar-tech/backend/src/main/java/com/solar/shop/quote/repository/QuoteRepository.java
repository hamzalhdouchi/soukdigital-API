package com.solar.shop.quote.repository;

import com.solar.shop.quote.entity.Quote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QuoteRepository extends JpaRepository<Quote, Long> {

    Optional<Quote> findByReference(String reference);

    Page<Quote> findByStatus(String status, Pageable pageable);

    Page<Quote> findByUserEmail(String email, Pageable pageable);

    long countByStatus(String status);
}
