package ma.soukdigital.dto;

import java.util.List;

public record ReviewStatsDto(
    double averageRating,
    long totalCount,
    List<RatingDistributionDto> distribution
) {}
