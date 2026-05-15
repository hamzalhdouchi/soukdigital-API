package ma.soukdigital.controller;

import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.ProductSummaryDto;
import ma.soukdigital.security.JwtService;
import ma.soukdigital.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    private final JwtService      jwtService;

    @GetMapping
    public List<ProductSummaryDto> getWishlist(@AuthenticationPrincipal UserDetails user) {
        return wishlistService.getWishlist(userId(user));
    }

    @GetMapping("/ids")
    public List<UUID> getWishedIds(@AuthenticationPrincipal UserDetails user) {
        return wishlistService.getWishedProductIds(userId(user));
    }

    @PostMapping("/{productId}/toggle")
    public ResponseEntity<Map<String, Boolean>> toggle(
            @PathVariable UUID productId,
            @AuthenticationPrincipal UserDetails user) {
        boolean wished = wishlistService.toggle(userId(user), productId);
        return ResponseEntity.ok(Map.of("wished", wished));
    }

    private UUID userId(UserDetails user) {
        return UUID.fromString(user.getUsername());
    }
}
