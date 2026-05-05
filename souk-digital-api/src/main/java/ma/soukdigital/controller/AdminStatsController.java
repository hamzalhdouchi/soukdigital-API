package ma.soukdigital.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.PlatformStatsDto;
import ma.soukdigital.service.AdminService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/stats")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin — Stats", description = "Platform-wide KPIs")
@SecurityRequirement(name = "bearerAuth")
public class AdminStatsController {

    private final AdminService adminService;

    @GetMapping
    @Operation(summary = "Platform KPIs — users, vendors, revenue, top categories & vendors")
    public PlatformStatsDto stats() {
        return adminService.platformStats();
    }
}
