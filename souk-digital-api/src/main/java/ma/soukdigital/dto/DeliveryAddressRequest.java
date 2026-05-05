package ma.soukdigital.dto;

import jakarta.validation.constraints.NotBlank;

public record DeliveryAddressRequest(
    @NotBlank String firstName,
    @NotBlank String lastName,
    @NotBlank String phone,
    @NotBlank String street,
    @NotBlank String city,
    String zipCode
) {}
