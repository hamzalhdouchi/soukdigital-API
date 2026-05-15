package com.solar.shop.product.entity;

import com.solar.shop.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "product_variants")
public class ProductVariant extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, unique = true, length = 100)
    private String reference;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal priceHt;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal priceTtc;

    @Column(nullable = false, length = 3)
    private String currency = "EUR";

    @Column(precision = 10, scale = 2)
    private BigDecimal weight;

    @Column(length = 100)
    private String dimensions;

    @Column(nullable = false)
    private boolean isDefault = false;

    @Column(nullable = false)
    private boolean isActive = true;
}
