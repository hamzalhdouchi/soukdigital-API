package ma.soukdigital.dto;

public record UpdateVendorRequest(
    String name,
    String nameAr,
    String city,
    String description,
    String descriptionAr,
    String avatarUrl,
    String bannerUrl
) {}
