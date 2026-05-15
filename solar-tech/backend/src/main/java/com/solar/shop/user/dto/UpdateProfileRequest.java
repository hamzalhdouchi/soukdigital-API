package com.solar.shop.user.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(min = 1, max = 100) String firstName,
        @Size(min = 1, max = 100) String lastName,
        @Size(max = 30) String phone
) {}
