package ma.soukdigital.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank String firstName,
    @NotBlank String lastName,
    String email,
    @NotBlank String phone,
    @NotBlank @Size(min = 6) String password
) {}
