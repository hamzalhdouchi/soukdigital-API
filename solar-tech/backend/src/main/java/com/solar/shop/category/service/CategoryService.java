package com.solar.shop.category.service;

import com.solar.shop.category.dto.CategoryResponse;
import com.solar.shop.category.entity.Category;
import com.solar.shop.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'tree'")
    public List<CategoryResponse> getCategoryTree() {
        List<Category> roots = categoryRepository.findRootCategories();
        return roots.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'all'")
    public List<CategoryResponse> getAllActive() {
        return categoryRepository.findAll().stream()
            .filter(Category::isActive)
            .map(c -> toResponse(c, false))
            .toList();
    }

    private CategoryResponse toResponse(Category c) {
        return toResponse(c, true);
    }

    private CategoryResponse toResponse(Category c, boolean includeChildren) {
        List<CategoryResponse> children = includeChildren
            ? c.getChildren().stream().filter(Category::isActive).map(this::toResponse).toList()
            : List.of();

        return new CategoryResponse(
            c.getId(),
            c.getSlug(),
            c.getName(),
            c.getDescription(),
            c.getImageUrl(),
            c.getParent() != null ? c.getParent().getId() : null,
            c.getPosition(),
            children
        );
    }
}
