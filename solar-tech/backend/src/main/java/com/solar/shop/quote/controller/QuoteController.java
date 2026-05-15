package com.solar.shop.quote.controller;

import com.solar.shop.common.dto.ApiResponse;
import com.solar.shop.common.dto.PageResponse;
import com.solar.shop.quote.dto.QuoteCreateRequest;
import com.solar.shop.quote.dto.QuoteResponse;
import com.solar.shop.quote.dto.QuoteStatusUpdateRequest;
import com.solar.shop.quote.service.QuoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class QuoteController {

    private final QuoteService quoteService;

    @PostMapping("/api/quotes")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<QuoteResponse> create(@Valid @RequestBody QuoteCreateRequest req) {
        return ApiResponse.ok(quoteService.create(req), "Devis soumis avec succès");
    }

    @GetMapping("/api/admin/quotes")
    public ApiResponse<PageResponse<QuoteResponse>> list(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ApiResponse.ok(quoteService.findAll(status, pageable));
    }

    @GetMapping("/api/admin/quotes/{id}")
    public ApiResponse<QuoteResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(quoteService.findById(id));
    }

    @PatchMapping("/api/admin/quotes/{id}/status")
    public ApiResponse<QuoteResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody QuoteStatusUpdateRequest req
    ) {
        return ApiResponse.ok(quoteService.updateStatus(id, req));
    }
}
