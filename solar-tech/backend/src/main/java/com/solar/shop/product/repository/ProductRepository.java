package com.solar.shop.product.repository;

import com.solar.shop.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    @EntityGraph(attributePaths = {"images", "variants", "category", "brand"})
    Optional<Product> findBySlugAndIsActiveTrueAndDeletedAtIsNull(String slug);

    @Query("SELECT p FROM Product p JOIN FETCH p.variants v JOIN FETCH p.images i " +
           "WHERE p.isActive = true AND p.deletedAt IS NULL AND v.isDefault = true AND i.isPrimary = true")
    Page<Product> findFeaturedProducts(Pageable pageable);
}
