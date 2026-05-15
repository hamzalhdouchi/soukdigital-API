package com.solar.shop.quote.dto;

import com.solar.shop.quote.entity.Quote;
import com.solar.shop.quote.entity.QuoteItem;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record QuoteResponse(
        Long id,
        String reference,
        String firstName,
        String lastName,
        String email,
        String phone,
        String company,
        String installationType,
        BigDecimal consumptionKwh,
        String location,
        BigDecimal budget,
        String message,
        String status,
        String adminNotes,
        List<ItemResponse> items,
        LocalDateTime createdAt
) {
    public record ItemResponse(
            Long id,
            Long productId,
            Long variantId,
            String productName,
            String variantLabel,
            Integer quantity,
            BigDecimal unitPriceHt
    ) {}

    public static QuoteResponse from(Quote q) {
        return new QuoteResponse(
                q.getId(),
                q.getReference(),
                q.getFirstName(),
                q.getLastName(),
                q.getEmail(),
                q.getPhone(),
                q.getCompany(),
                q.getInstallationType(),
                q.getConsumptionKwh(),
                q.getLocation(),
                q.getBudget(),
                q.getMessage(),
                q.getStatus(),
                q.getAdminNotes(),
                q.getItems().stream().map(QuoteResponse::mapItem).toList(),
                q.getCreatedAt()
        );
    }

    private static ItemResponse mapItem(QuoteItem i) {
        return new ItemResponse(
                i.getId(),
                i.getProductId(),
                i.getVariantId(),
                i.getProductName(),
                i.getVariantLabel(),
                i.getQuantity(),
                i.getUnitPriceHt()
        );
    }
}
