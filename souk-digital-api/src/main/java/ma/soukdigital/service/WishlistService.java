package ma.soukdigital.service;

import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.ProductSummaryDto;
import ma.soukdigital.dto.ProductVendorDto;
import ma.soukdigital.entity.Product;
import ma.soukdigital.entity.User;
import ma.soukdigital.entity.Wishlist;
import ma.soukdigital.exception.EntityNotFoundException;
import ma.soukdigital.repository.ProductRepository;
import ma.soukdigital.repository.UserRepository;
import ma.soukdigital.repository.WishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository  productRepository;
    private final UserRepository     userRepository;

    public List<ProductSummaryDto> getWishlist(UUID userId) {
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(w -> toSummary(w.getProduct()))
            .toList();
    }

    public List<UUID> getWishedProductIds(UUID userId) {
        return wishlistRepository.findProductIdsByUserId(userId);
    }

    public boolean isWished(UUID userId, UUID productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }

    @Transactional
    public boolean toggle(UUID userId, UUID productId) {
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            wishlistRepository.deleteByUserIdAndProductId(userId, productId);
            return false;
        }
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable."));
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new EntityNotFoundException("Produit introuvable."));
        wishlistRepository.save(Wishlist.builder().user(user).product(product).build());
        return true;
    }

    private ProductSummaryDto toSummary(Product p) {
        String image = p.getImages().isEmpty() ? null : p.getImages().get(0);
        return new ProductSummaryDto(
            p.getId(), p.getSlug(), p.getName(), p.getNameAr(),
            p.getPrice(), p.getOriginalPrice(), image,
            p.getRating(), p.getReviewCount(), p.getBadge(),
            p.getStockCount() > 0, p.isFreeDelivery(), p.getCity(),
            new ProductVendorDto(
                p.getVendor().getId(), p.getVendor().getName(), p.getVendor().getSlug(),
                p.getVendor().isArtisan(), p.getVendor().isVerified()
            ),
            p.isActive()
        );
    }
}
