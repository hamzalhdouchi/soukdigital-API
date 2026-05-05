package ma.soukdigital.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.CreatePromoRequest;
import ma.soukdigital.dto.PromoCodeDto;
import ma.soukdigital.dto.PromoValidationResponse;
import ma.soukdigital.service.PromoService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Promo Codes", description = "Discount code validation and management")
public class PromoController {

    private final PromoService promoService;

    @PostMapping("/promo/validate")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Validate a promo code before checkout")
    public PromoValidationResponse validate(@RequestBody Map<String, String> body) {
        return promoService.validate(body.getOrDefault("code", ""));
    }

    @PostMapping("/admin/promo")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Create promo code (admin)")
    public PromoCodeDto create(@Valid @RequestBody CreatePromoRequest req) {
        return promoService.create(req);
    }

    @GetMapping("/admin/promo")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "List all promo codes (admin)")
    public Page<PromoCodeDto> findAll(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return promoService.findAll(page, size);
    }

    @PatchMapping("/admin/promo/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Toggle promo code active/inactive (admin)")
    public PromoCodeDto toggle(@PathVariable UUID id) {
        return promoService.toggleActive(id);
    }
}
