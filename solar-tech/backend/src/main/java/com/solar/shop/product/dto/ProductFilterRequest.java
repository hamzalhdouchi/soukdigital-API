package com.solar.shop.product.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ProductFilterRequest {
    private Long categoryId;
    private List<Long> brandIds;
    private String productType;
    private String installationType;
    private String phaseType;
    private String injectionType;
    private Boolean hasBattery;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private BigDecimal minPowerKwc;
    private BigDecimal maxPowerKwc;
    private String search;
}
