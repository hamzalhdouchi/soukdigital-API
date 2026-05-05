package ma.soukdigital.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateVendorRequest(
    @NotBlank String name,
    String nameAr,
    @NotBlank String city,
    String description,
    String descriptionAr,
    String avatarUrl,
    String bannerUrl,
    boolean artisan
) {}
