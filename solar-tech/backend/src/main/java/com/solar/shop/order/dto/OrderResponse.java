package com.solar.shop.order.dto;

import com.solar.shop.order.entity.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        String reference,
        String status,
        String shippingFirstName,
        String shippingLastName,
        String shippingEmail,
        String shippingAddress,
        String shippingCity,
        String shippingPostalCode,
        String shippingCountry,
        BigDecimal subtotalHt,
        BigDecimal taxAmount,
        BigDecimal shippingAmount,
        BigDecimal totalTtc,
        String currency,
        List<ItemResponse> items,
        LocalDateTime createdAt
) {
    public record ItemResponse(
            Long id,
            String productName,
            String variantLabel,
            Integer quantity,
            BigDecimal unitPriceHt,
            BigDecimal unitPriceTtc
    ) {}

    public static OrderResponse from(Order o) {
        return new OrderResponse(
                o.getId(),
                o.getReference(),
                o.getStatus(),
                o.getShippingFirstName(),
                o.getShippingLastName(),
                o.getShippingEmail(),
                o.getShippingAddress(),
                o.getShippingCity(),
                o.getShippingPostalCode(),
                o.getShippingCountry(),
                o.getSubtotalHt(),
                o.getTaxAmount(),
                o.getShippingAmount(),
                o.getTotalTtc(),
                o.getCurrency(),
                o.getItems().stream().map(i -> new ItemResponse(
                        i.getId(),
                        i.getProductName(),
                        i.getVariantLabel(),
                        i.getQuantity(),
                        i.getUnitPriceHt(),
                        i.getUnitPriceTtc()
                )).toList(),
                o.getCreatedAt()
        );
    }
}
