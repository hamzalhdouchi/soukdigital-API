package ma.soukdigital.dto;

import java.util.UUID;

public record ProductVendorDto(
    UUID id,
    String name,
    String slug,
    boolean artisan,
    boolean verified
) {}
