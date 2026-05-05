package ma.soukdigital.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import ma.soukdigital.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    @Query("""
        SELECT r FROM Review r
        WHERE r.product.id = :productId
        ORDER BY r.isVerifiedPurchase DESC, r.createdAt DESC
        """)
    Page<Review> findByProductIdVerifiedFirst(@Param("productId") UUID productId, Pageable pageable);

    boolean existsByProductIdAndUserId(UUID productId, UUID userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Optional<Double> findAverageRatingByProductId(@Param("productId") UUID productId);

    long countByProductId(UUID productId);

    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.product.id = :productId GROUP BY r.rating")
    List<Object[]> countByProductIdGroupByRating(@Param("productId") UUID productId);
}




