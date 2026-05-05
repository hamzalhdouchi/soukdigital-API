package ma.soukdigital.service;

import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.CategoryResponse;
import ma.soukdigital.entity.Category;
import ma.soukdigital.exception.EntityNotFoundException;
import ma.soukdigital.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> findAll() {
        return categoryRepository.findAllByIsActiveTrueOrderBySortOrderAsc()
            .stream()
            .filter(c -> c.getParent() == null)
            .map(this::toResponse)
            .toList();
    }

    public CategoryResponse findBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
            .map(this::toResponse)
            .orElseThrow(() -> new EntityNotFoundException("Catégorie introuvable : " + slug));
    }

    public List<CategoryResponse> findRootCategories() {
        return categoryRepository.findAllByParentIsNullOrderBySortOrderAsc()
            .stream().map(this::toResponse).toList();
    }

    private CategoryResponse toResponse(Category c) {
        List<CategoryResponse> children = c.getChildren() == null ? List.of() :
            c.getChildren().stream().map(this::toResponse).toList();
        return new CategoryResponse(
            c.getId(), c.getName(), c.getNameAr(), c.getSlug(),
            c.getEmoji(), c.getImageUrl(), c.getSortOrder(), children
        );
    }
}
