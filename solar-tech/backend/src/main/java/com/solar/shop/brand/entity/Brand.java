package com.solar.shop.brand.entity;

import com.solar.shop.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "brands")
public class Brand extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String name;

    private String description;
    private String logoUrl;
    private String websiteUrl;
    private String metaTitle;
    private String metaDescription;

    @Column(nullable = false)
    private boolean isActive = true;
}
