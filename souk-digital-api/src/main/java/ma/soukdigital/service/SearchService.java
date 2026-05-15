package ma.soukdigital.service;

import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.*;
import ma.soukdigital.entity.Product;
import ma.soukdigital.entity.Vendor;
import ma.soukdigital.repository.ProductRepository;
import ma.soukdigital.repository.VendorRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SearchService {

    private final ProductRepository productRepository;
    private final VendorRepository  vendorRepository;

    public SearchResultsDto search(
            String q,
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String city,
            boolean freeDelivery,
            boolean artisanOnly,
            BigDecimal minRating,
            String sort,
            int page,
            int size) {

        Pageable pageable = buildPageable(sort, page, size);

        Page<ProductSummaryDto> products = productRepository
            .filter(q, category, city, freeDelivery, artisanOnly, minPrice, maxPrice, pageable)
            .map(this::toSummary);

        // Apply minRating filter post-query (simple, avoids extra JPQL complexity)
        if (minRating != null) {
            List<ProductSummaryDto> filtered = products.getContent().stream()
                .filter(p -> p.rating() != null && p.rating().compareTo(minRating) >= 0)
                .toList();
            products = new PageImpl<>(filtered, pageable, filtered.size());
        }

        // Vendor suggestions — only when keyword is provided
        List<VendorSummaryDto> vendors = List.of();
        if (q != null && !q.isBlank()) {
            vendors = vendorRepository
                .searchByName(q, PageRequest.of(0, 4))
                .stream().map(this::toVendorSummary).toList();
        }

        return new SearchResultsDto(q, products.getTotalElements(), products, vendors);
    }

    public List<String> suggestions(String q) {
        if (q == null || q.isBlank()) return List.of();
        return productRepository.findSuggestions(q, PageRequest.of(0, 5));
    }

    // ── Helpers ───────────────────────────────────────────────

    private Pageable buildPageable(String sort, int page, int size) {
        Sort s = switch (sort != null ? sort : "newest") {
            case "price_asc"  -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "rating"     -> Sort.by("rating").descending();
            default           -> Sort.by("created_at").descending();
        };
        return PageRequest.of(page, size, s);
    }

    private ProductSummaryDto toSummary(Product p) {
        String image = p.getImages().isEmpty() ? null : p.getImages().get(0);
        Vendor v = p.getVendor();
        return new ProductSummaryDto(
            p.getId(), p.getSlug(), p.getName(), p.getNameAr(),
            p.getPrice(), p.getOriginalPrice(), image,
            p.getRating(), p.getReviewCount(), p.getBadge(),
            p.getStockCount() > 0, p.isFreeDelivery(), p.getCity(),
            new ProductVendorDto(v.getId(), v.getName(), v.getSlug(), v.isArtisan(), v.isVerified()),
            p.isActive()
        );
    }

    private VendorSummaryDto toVendorSummary(Vendor v) {
        return new VendorSummaryDto(
            v.getId(), v.getSlug(), v.getName(), v.getNameAr(),
            v.getCity(), v.getRating(), v.getReviewCount(), v.getProductCount(),
            v.isArtisan(), v.isVerified(), v.getAvatarUrl(), v.getBannerUrl()
        );
    }
}
