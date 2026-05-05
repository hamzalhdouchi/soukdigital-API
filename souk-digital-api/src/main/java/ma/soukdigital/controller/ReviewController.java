package ma.soukdigital.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.*;
import ma.soukdigital.service.ReviewService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Product reviews and ratings")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/products/{productId}/reviews")
    @Operation(summary = "Get reviews for a product")
    public Page<ReviewDetailDto> findByProduct(
            @PathVariable UUID productId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {
        return reviewService.findByProduct(productId, page, size);
    }

    @GetMapping("/products/{productId}/reviews/stats")
    @Operation(summary = "Get rating stats for a product")
    public ReviewStatsDto getStats(@PathVariable UUID productId) {
        return reviewService.getStats(productId);
    }

    @PostMapping("/products/{productId}/reviews")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Add a review")
    public ReviewDetailDto addReview(
            @PathVariable UUID productId,
            @Valid @RequestBody CreateReviewRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return reviewService.addReview(productId, req, UUID.fromString(user.getUsername()));
    }

    @DeleteMapping("/reviews/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Delete a review (own or admin)")
    public void deleteReview(@PathVariable UUID id,
                             @AuthenticationPrincipal UserDetails user) {
        boolean isAdmin = user.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        reviewService.deleteReview(id, UUID.fromString(user.getUsername()), isAdmin);
    }
}
