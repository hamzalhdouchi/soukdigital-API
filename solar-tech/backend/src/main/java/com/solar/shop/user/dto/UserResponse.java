package com.solar.shop.user.dto;

import com.solar.shop.user.entity.User;

import java.util.List;

public record UserResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        String phone,
        boolean isActive,
        boolean emailVerified,
        List<String> roles
) {
    public static UserResponse from(User u) {
        return new UserResponse(
                u.getId(),
                u.getEmail(),
                u.getFirstName(),
                u.getLastName(),
                u.getPhone(),
                u.isActive(),
                u.isEmailVerified(),
                u.getRoles().stream().map(r -> r.getName()).toList()
        );
    }
}
