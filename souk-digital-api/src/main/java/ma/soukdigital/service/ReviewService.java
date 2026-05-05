package ma.soukdigital.service;

import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.*;
import ma.soukdigital.entity.*;
import ma.soukdigital.exception.DuplicateReviewException;
import ma.soukdigital.exception.EntityNotFoundException;
import ma.soukdigital.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository  reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository    userRepository;
    private final OrderRepository   orderRepository;

    @Transactional
    public ReviewDetailDto addReview(UUID productId, CreateReviewRequest req, UUID userId) {
        if (reviewRepository.existsByProductIdAndUserId(productId, userId)) {
            throw new DuplicateReviewException();
        }

        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new EntityNotFoundException("Produit introuvable."));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable."));

        // Check verified purchase
        List<Order> deliveredOrders = orderRepository
            .findDeliveredOrderByBuyerAndProduct(userId, productId);
        boolean verified = !deliveredOrders.isEmpty();
        Order linkedOrder = verified ? deliveredOrders.get(0) : null;

        Review review = Review.builder()
            .product(product)
            .user(user)
            .order(linkedOrder)
            .rating((short) req.rating().intValue())
            .comment(req.comment())
            .isVerifiedPurchase(verified)
            .build();

        reviewRepository.save(review);
        recalculateProductStats(product);

        return toDto(review);
    }

    @Transactional(readOnly = true)
    public Page<ReviewDetailDto> findByProduct(UUID productId, int page, int size) {
        return reviewRepository
            .findByProductIdVerifiedFirst(productId, PageRequest.of(page, size))
            .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public ReviewStatsDto getStats(UUID productId) {
        long total = reviewRepository.countByProductId(productId);
        double avg = reviewRepository.findAverageRatingByProductId(productId).orElse(0.0);

        List<Object[]> raw = reviewRepository.countByProductIdGroupByRating(productId);
        Map<Integer, Long> countByStar = raw.stream()
            .collect(Collectors.toMap(
                r -> ((Number) r[0]).intValue(),
                r -> ((Number) r[1]).longValue()
            ));

        List<RatingDistributionDto> distribution = new ArrayList<>();
        for (int star = 5; star >= 1; star--) {
            long count = countByStar.getOrDefault(star, 0L);
            double percent = total > 0
                ? BigDecimal.valueOf(count * 100.0 / total)
                    .setScale(1, RoundingMode.HALF_UP).doubleValue()
                : 0.0;
            distribution.add(new RatingDistributionDto(star, count, percent));
        }

        return new ReviewStatsDto(
            BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP).doubleValue(),
            total,
            distribution
        );
    }

    @Transactional
    public void deleteReview(UUID reviewId, UUID userId, boolean isAdmin) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new EntityNotFoundException("Avis introuvable."));
        if (!isAdmin && !review.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Vous ne pouvez pas supprimer cet avis.");
        }
        Product product = review.getProduct();
        reviewRepository.delete(review);
        recalculateProductStats(product);
    }

    // ── Helpers ───────────────────────────────────────────────

    private void recalculateProductStats(Product product) {
        long count = reviewRepository.countByProductId(product.getId());
        double avg = reviewRepository.findAverageRatingByProductId(product.getId()).orElse(0.0);
        product.setReviewCount((int) count);
        product.setRating(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
        productRepository.save(product);
    }

    private ReviewDetailDto toDto(Review r) {
        User u = r.getUser();
        String lastName = u.getLastName();
        String authorName = u.getFirstName() + " "
            + (lastName != null && !lastName.isEmpty() ? lastName.charAt(0) + "." : "");
        return new ReviewDetailDto(
            r.getId(), r.getRating(), r.getComment(),
            r.isVerifiedPurchase(), r.getCreatedAt(),
            authorName, u.getAvatarUrl()
        );
    }
}
