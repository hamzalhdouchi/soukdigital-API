package ma.soukdigital.repository;

import ma.soukdigital.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WishlistRepository extends JpaRepository<Wishlist, UUID> {

    List<Wishlist> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Wishlist> findByUserIdAndProductId(UUID userId, UUID productId);

    boolean existsByUserIdAndProductId(UUID userId, UUID productId);

    void deleteByUserIdAndProductId(UUID userId, UUID productId);

    @Query("SELECT w.product.id FROM Wishlist w WHERE w.user.id = :userId")
    List<UUID> findProductIdsByUserId(@Param("userId") UUID userId);
}
