package ma.soukdigital.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.AdminVendorDto;
import ma.soukdigital.service.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin/vendors")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin — Vendors", description = "Vendor verification and moderation")
@SecurityRequirement(name = "bearerAuth")
public class AdminVendorController {

    private final AdminService adminService;

    @GetMapping
    @Operation(summary = "List all vendors")
    public Page<AdminVendorDto> list(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return adminService.listVendors(page, size);
    }

    @PatchMapping("/{id}/verify")
    @Operation(summary = "Verify a vendor")
    public AdminVendorDto verify(@PathVariable UUID id) {
        return adminService.verifyVendor(id);
    }

    @PatchMapping("/{id}/unverify")
    @Operation(summary = "Remove vendor verification")
    public AdminVendorDto unverify(@PathVariable UUID id) {
        return adminService.unverifyVendor(id);
    }

    @PatchMapping("/{id}/artisan")
    @Operation(summary = "Toggle artisan badge")
    public AdminVendorDto toggleArtisan(@PathVariable UUID id) {
        return adminService.toggleArtisan(id);
    }
}
