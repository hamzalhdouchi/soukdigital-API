package ma.soukdigital.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import ma.soukdigital.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findBySlug(String slug);

    Page<Product> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);

    Page<Product> findByVendorIdAndIsActiveTrue(UUID vendorId, Pageable pageable);

    Page<Product> findByVendorId(UUID vendorId, Pageable pageable);

    @Query("SELECT p FROM Product p JOIN p.category c WHERE c.slug = :slug AND p.isActive = true")
    Page<Product> findByCategorySlug(@Param("slug") String slug, Pageable pageable);

    @Query(value = """
        SELECT * FROM products
        WHERE is_active = true
          AND (name ILIKE '%' || :keyword || '%' OR name_ar ILIKE '%' || :keyword || '%')
        """,
        countQuery = """
        SELECT COUNT(*) FROM products
        WHERE is_active = true
          AND (name ILIKE '%' || :keyword || '%' OR name_ar ILIKE '%' || :keyword || '%')
        """, nativeQuery = true)
    Page<Product> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query(value = """
        SELECT p.* FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN vendors v    ON p.vendor_id   = v.id
        WHERE p.is_active = true
          AND (:keyword    IS NULL OR p.name ILIKE '%' || :keyword || '%' OR p.name_ar ILIKE '%' || :keyword || '%')
          AND (:categorySlug IS NULL OR c.slug = :categorySlug)
          AND (:city       IS NULL OR p.city = :city)
          AND (:freeDelivery = false OR p.free_delivery = true)
          AND (:artisanOnly  = false OR v.is_artisan = true)
          AND (:minPrice   IS NULL OR p.price >= CAST(:minPrice AS numeric))
          AND (:maxPrice   IS NULL OR p.price <= CAST(:maxPrice AS numeric))
        """,
        countQuery = """
        SELECT COUNT(*) FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN vendors v    ON p.vendor_id   = v.id
        WHERE p.is_active = true
          AND (:keyword    IS NULL OR p.name ILIKE '%' || :keyword || '%' OR p.name_ar ILIKE '%' || :keyword || '%')
          AND (:categorySlug IS NULL OR c.slug = :categorySlug)
          AND (:city       IS NULL OR p.city = :city)
          AND (:freeDelivery = false OR p.free_delivery = true)
          AND (:artisanOnly  = false OR v.is_artisan = true)
          AND (:minPrice   IS NULL OR p.price >= CAST(:minPrice AS numeric))
          AND (:maxPrice   IS NULL OR p.price <= CAST(:maxPrice AS numeric))
        """, nativeQuery = true)
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

    @Query(value = """
        SELECT name FROM products
        WHERE is_active = true AND name ILIKE '%' || :q || '%'
        ORDER BY review_count DESC
        """, nativeQuery = true)
    List<String> findSuggestions(@Param("q") String q, Pageable pageable);

    long countByVendorIdAndIsActiveTrue(UUID vendorId);

    @Query("""
        SELECT i.product.id    AS productId,
               i.product.name  AS name,
               SUM(i.quantity) AS totalSold,
               SUM(i.price * i.quantity) AS revenue,
               i.product.rating AS rating,
               i.productImage  AS image
        FROM OrderItem i
        WHERE i.vendor.id = :vendorId
        AND i.order.status = ma.soukdigital.entity.OrderStatus.DELIVERED
        GROUP BY i.product.id, i.product.name, i.product.rating, i.productImage
        ORDER BY totalSold DESC
        """)
    List<Object[]> findTopProductsByVendor(@Param("vendorId") UUID vendorId, Pageable pageable);
}




