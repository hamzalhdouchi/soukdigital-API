package com.solar.shop.auth.dto;

import java.util.List;

public record AuthResponse(
    Long id,
    String email,
    String firstName,
    String lastName,
    List<String> roles,
    String accessToken,
    String refreshToken,
    String tokenType
) {
    public static AuthResponse of(
        Long id, String email, String firstName, String lastName,
        List<String> roles, String accessToken, String refreshToken
    ) {
        return new AuthResponse(id, email, firstName, lastName, roles, accessToken, refreshToken, "Bearer");
    }
}
