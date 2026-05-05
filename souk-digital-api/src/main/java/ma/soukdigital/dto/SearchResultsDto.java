package ma.soukdigital.dto;

import org.springframework.data.domain.Page;

import java.util.List;

public record SearchResultsDto(
    String query,
    long totalProducts,
    Page<ProductSummaryDto> products,
    List<VendorSummaryDto> vendors
) {}
