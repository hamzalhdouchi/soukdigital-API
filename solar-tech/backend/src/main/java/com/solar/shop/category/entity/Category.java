package com.solar.shop.category.entity;

import com.solar.shop.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "categories")
public class Category extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    @OneToMany(mappedBy = "parent", fetch = FetchType.LAZY)
    @OrderBy("position ASC")
    private List<Category> children = new ArrayList<>();

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String name;

    private String description;
    private String imageUrl;
    private String metaTitle;
    private String metaDescription;

    @Column(nullable = false)
    private int position = 0;

    @Column(nullable = false)
    private boolean isActive = true;
}
