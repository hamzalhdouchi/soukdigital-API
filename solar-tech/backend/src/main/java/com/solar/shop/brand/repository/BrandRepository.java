package com.solar.shop.brand.repository;

import com.solar.shop.brand.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, Long> {

    Optional<Brand> findBySlugAndIsActiveTrue(String slug);

    List<Brand> findByIsActiveTrueOrderByNameAsc();
}
