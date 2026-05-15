package com.solar.shop.user.controller;

import com.solar.shop.common.dto.ApiResponse;
import com.solar.shop.user.dto.UpdateProfileRequest;
import com.solar.shop.user.dto.UserResponse;
import com.solar.shop.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserResponse> me(Principal principal) {
        return ApiResponse.ok(userService.getByEmail(principal.getName()));
    }

    @PatchMapping("/me")
    public ApiResponse<UserResponse> updateMe(
            Principal principal,
            @Valid @RequestBody UpdateProfileRequest req
    ) {
        return ApiResponse.ok(userService.updateProfile(principal.getName(), req));
    }
}
