package ma.soukdigital.dto;

import java.util.List;
import java.util.UUID;

public record CategoryResponse(
    UUID id,
    String name,
    String nameAr,
    String slug,
    String emoji,
    String imageUrl,
    int sortOrder,
    List<CategoryResponse> children
) {}
