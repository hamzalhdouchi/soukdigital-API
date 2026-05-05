package ma.soukdigital.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.AdminUserDto;
import ma.soukdigital.entity.Role;
import ma.soukdigital.service.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin — Users", description = "User management for admins")
@SecurityRequirement(name = "bearerAuth")
public class AdminUserController {

    private final AdminService adminService;

    @GetMapping
    @Operation(summary = "List all users with optional search")
    public Page<AdminUserDto> list(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return adminService.listUsers(q, page, size);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user detail")
    public AdminUserDto get(@PathVariable UUID id) {
        return adminService.getUser(id);
    }

    @PatchMapping("/{id}/role")
    @Operation(summary = "Change user role")
    public AdminUserDto changeRole(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        Role role = Role.valueOf(body.get("role").toUpperCase());
        return adminService.changeRole(id, role);
    }

    @PatchMapping("/{id}/ban")
    @Operation(summary = "Ban user (sets verified=false)")
    public AdminUserDto ban(@PathVariable UUID id) {
        return adminService.banUser(id);
    }

    @PatchMapping("/{id}/unban")
    @Operation(summary = "Unban user (sets verified=true)")
    public AdminUserDto unban(@PathVariable UUID id) {
        return adminService.unbanUser(id);
    }
}
