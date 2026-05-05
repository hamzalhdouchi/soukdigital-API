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

    @Query("""
        SELECT p.name FROM Product p
        WHERE p.isActive = true
        AND LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%'))
        ORDER BY p.reviewCount DESC
        """)
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




