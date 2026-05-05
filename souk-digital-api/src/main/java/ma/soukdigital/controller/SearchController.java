package ma.soukdigital.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.SearchResultsDto;
import ma.soukdigital.service.SearchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
@Tag(name = "Search", description = "Full-text product and vendor search")
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    @Operation(summary = "Search products and vendors")
    public SearchResultsDto search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "false") boolean freeDelivery,
            @RequestParam(defaultValue = "false") boolean artisanOnly,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return searchService.search(
            q, category, minPrice, maxPrice, city,
            freeDelivery, artisanOnly, minRating, sort, page, size);
    }

    @GetMapping("/suggestions")
    @Operation(summary = "Autocomplete suggestions for search bar")
    public List<String> suggestions(@RequestParam(defaultValue = "") String q) {
        return searchService.suggestions(q);
    }
}
