package com.solar.shop.product.entity;

import com.solar.shop.brand.entity.Brand;
import com.solar.shop.category.entity.Category;
import com.solar.shop.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "products")
public class Product extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String sku;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false, length = 500)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String shortDescription;

    @Column(columnDefinition = "TEXT")
    private String longDescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @Column(nullable = false, length = 50)
    private String productType;

    @Column(length = 50)
    private String installationType;

    @Column(length = 20)
    private String phaseType;

    @Column(precision = 10, scale = 2)
    private BigDecimal basePowerKwc;

    @Column(precision = 10, scale = 2)
    private BigDecimal inverterPowerVa;

    @Column(precision = 10, scale = 2)
    private BigDecimal batteryCapacityKwh;

    @Column(length = 50)
    private String voltageOutput;

    @Column(length = 30)
    private String injectionType;

    private Integer panelCount;
    private Integer warrantyYears;

    @Column(precision = 10, scale = 2)
    private BigDecimal weight;

    @Column(length = 100)
    private String dimensions;

    private String metaTitle;

    @Column(columnDefinition = "TEXT")
    private String metaDescription;

    @Column(nullable = false)
    private boolean isActive = false;

    @Column(nullable = false)
    private boolean isFeatured = false;

    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("position ASC")
    private List<ProductImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProductVariant> variants = new ArrayList<>();
}
