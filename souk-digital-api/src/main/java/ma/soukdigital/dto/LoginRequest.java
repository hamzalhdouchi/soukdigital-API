package ma.soukdigital.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank String identifier,   // email or phone
    @NotBlank String password
) {}
