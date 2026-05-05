package ma.soukdigital.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.*;
import ma.soukdigital.service.ProductService;
import ma.soukdigital.service.VendorService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/vendors")
@RequiredArgsConstructor
@Tag(name = "Vendors", description = "Vendor storefronts and profiles")
public class VendorController {

    private final VendorService  vendorService;
    private final ProductService productService;

    @GetMapping
    @Operation(summary = "List all vendors")
    public Page<VendorSummaryDto> findAll(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false)    String city) {
        return vendorService.findAll(page, size, city);
    }

    @GetMapping("/{slug}/storefront")
    @Operation(summary = "Get vendor storefront by slug")
    public VendorDetailDto findBySlug(@PathVariable String slug) {
        return vendorService.findBySlug(slug);
    }

    @GetMapping("/{slug}/products")
    @Operation(summary = "Get vendor products")
    public Page<ProductSummaryDto> findProducts(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        VendorDetailDto vendor = vendorService.findBySlug(slug);
        return productService.findByVendor(vendor.id(), PageRequest.of(page, size));
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Become a vendor (BUYER → VENDOR)")
    public VendorRegisterResponse register(
            @Valid @RequestBody CreateVendorRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return vendorService.createVendorProfile(req, UUID.fromString(user.getUsername()));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('VENDOR')")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Get own vendor profile")
    public VendorDetailDto getMyProfile(@AuthenticationPrincipal UserDetails user) {
        return vendorService.findByCurrentUser(UUID.fromString(user.getUsername()));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('VENDOR')")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Update own vendor profile")
    public VendorDetailDto updateMyProfile(
            @RequestBody UpdateVendorRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return vendorService.updateProfile(req, UUID.fromString(user.getUsername()));
    }

    @PostMapping("/{id}/follow")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Follow a vendor")
    public void follow(@PathVariable UUID id,
                       @AuthenticationPrincipal UserDetails user) {
        vendorService.follow(id, UUID.fromString(user.getUsername()));
    }

    @DeleteMapping("/{id}/follow")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Unfollow a vendor")
    public void unfollow(@PathVariable UUID id,
                         @AuthenticationPrincipal UserDetails user) {
        vendorService.unfollow(id, UUID.fromString(user.getUsername()));
    }
}
