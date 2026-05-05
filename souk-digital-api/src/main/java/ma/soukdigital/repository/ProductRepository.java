package ma.soukdigital.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findBySlug(String slug);

    Page<Product> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);

    Page<Product> findByVendorIdAndIsActiveTrue(UUID vendorId, Pageable pageable);

    @Query("SELECT p FROM Product p JOIN p.category c WHERE c.slug = :slug AND p.isActive = true")
    Page<Product> findByCategorySlug(@Param("slug") String slug, Pageable pageable);

    @Query("""
        SELECT p FROM Product p
        WHERE p.isActive = true
        AND (
            LOWER(p.name)   LIKE LOWER(CONCAT('%', :keyword, '%'))
         OR LOWER(p.nameAr) LIKE LOWER(CONCAT('%', :keyword, '%'))
        )
        """)
    Page<Product> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("""
        SELECT p FROM Product p
        WHERE p.isActive = true
        AND (:keyword IS NULL OR
             LOWER(p.name)   LIKE LOWER(CONCAT('%', :keyword, '%'))
          OR LOWER(p.nameAr) LIKE LOWER(CONCAT('%', :keyword, '%')))
        AND (:categorySlug IS NULL OR p.category.slug = :categorySlug)
        AND (:city IS NULL OR p.city = :city)
        AND (:freeDelivery = false OR p.freeDelivery = true)
        AND (:artisanOnly = false OR p.vendor.isArtisan = true)
        AND (:minPrice IS NULL OR p.price >= :minPrice)
        AND (:maxPrice IS NULL OR p.price <= :maxPrice)
        """)
    Page<Product> filter(
        @Param("keyword") String keyword,
        @Param("categorySlug") String categorySlug,
        @Param("city") String city,
        @Param("freeDelivery") boolean freeDelivery,
        @Param("artisanOnly") boolean artisanOnly,
        @Param("minPrice") java.math.BigDecimal minPrice,
        @Param("maxPrice") java.math.BigDecimal maxPrice,
        Pageable pageable
    );

    long countByVendorId(UUID vendorId);
}



