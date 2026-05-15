package com.solar.shop.category.repository;

import com.solar.shop.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findBySlugAndIsActiveTrue(String slug);

    @Query("SELECT c FROM Category c WHERE c.parent IS NULL AND c.isActive = true ORDER BY c.position ASC")
    List<Category> findRootCategories();

    List<Category> findByParentIdAndIsActiveTrueOrderByPositionAsc(Long parentId);
}
