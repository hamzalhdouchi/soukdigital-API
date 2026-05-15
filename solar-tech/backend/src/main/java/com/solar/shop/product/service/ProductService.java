package com.solar.shop.product.service;

import com.solar.shop.common.dto.PageResponse;
import com.solar.shop.common.exception.ResourceNotFoundException;
import com.solar.shop.product.dto.ProductDetailResponse;
import com.solar.shop.product.dto.ProductFilterRequest;
import com.solar.shop.product.dto.ProductSummaryResponse;
import com.solar.shop.product.entity.Product;
import com.solar.shop.product.entity.ProductImage;
import com.solar.shop.product.entity.ProductVariant;
import com.solar.shop.product.repository.ProductRepository;
import com.solar.shop.product.specification.ProductSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public PageResponse<ProductSummaryResponse> findAll(ProductFilterRequest filter, Pageable pageable) {
        Page<Product> page = productRepository.findAll(
            ProductSpecification.byFilters(filter), pageable
        );
        return PageResponse.from(page.map(this::toSummary));
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "#slug")
    public ProductDetailResponse findBySlug(String slug) {
        Product product = productRepository.findBySlugAndIsActiveTrueAndDeletedAtIsNull(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", slug));
        return toDetail(product);
    }

    private ProductSummaryResponse toSummary(Product p) {
        ProductVariant defaultVariant = p.getVariants().stream()
            .filter(ProductVariant::isDefault)
            .findFirst()
            .orElse(p.getVariants().isEmpty() ? null : p.getVariants().get(0));

        ProductImage primaryImage = p.getImages().stream()
            .filter(ProductImage::isPrimary)
            .findFirst()
            .orElse(p.getImages().isEmpty() ? null : p.getImages().get(0));

        return new ProductSummaryResponse(
            p.getId(),
            p.getSlug(),
            p.getName(),
            p.getShortDescription(),
            primaryImage != null ? primaryImage.getUrl() : null,
            p.getProductType(),
            p.getInstallationType(),
            p.getPhaseType(),
            p.getBasePowerKwc(),
            p.isFeatured(),
            p.getCategory() != null ? p.getCategory().getId() : null,
            p.getCategory() != null ? p.getCategory().getSlug() : null,
            p.getCategory() != null ? p.getCategory().getName() : null,
            p.getBrand() != null ? p.getBrand().getId() : null,
            p.getBrand() != null ? p.getBrand().getName() : null,
            p.getBrand() != null ? p.getBrand().getLogoUrl() : null,
            defaultVariant != null ? defaultVariant.getId() : null,
            defaultVariant != null ? defaultVariant.getPriceHt() : null,
            defaultVariant != null ? defaultVariant.getPriceTtc() : null,
            defaultVariant != null ? defaultVariant.getCurrency() : "EUR",
            null
        );
    }

    private ProductDetailResponse toDetail(Product p) {
        var category = p.getCategory() != null
            ? new ProductDetailResponse.CategoryInfo(p.getCategory().getId(), p.getCategory().getSlug(), p.getCategory().getName())
            : null;

        var brand = p.getBrand() != null
            ? new ProductDetailResponse.BrandInfo(p.getBrand().getId(), p.getBrand().getSlug(), p.getBrand().getName(), p.getBrand().getLogoUrl())
            : null;

        List<ProductDetailResponse.ImageInfo> images = p.getImages().stream()
            .map(i -> new ProductDetailResponse.ImageInfo(i.getId(), i.getUrl(), i.getAltText(), i.isPrimary()))
            .toList();

        List<ProductDetailResponse.VariantInfo> variants = p.getVariants().stream()
            .filter(ProductVariant::isActive)
            .map(v -> new ProductDetailResponse.VariantInfo(
                v.getId(), v.getReference(), v.getLabel(),
                v.getPriceHt(), v.getPriceTtc(), v.getCurrency(),
                v.isDefault(), v.isActive()
            ))
            .toList();

        return new ProductDetailResponse(
            p.getId(), p.getSku(), p.getSlug(), p.getName(),
            p.getShortDescription(), p.getLongDescription(),
            p.getProductType(), p.getInstallationType(), p.getPhaseType(), p.getInjectionType(),
            p.getBasePowerKwc(), p.getInverterPowerVa(), p.getBatteryCapacityKwh(),
            p.getVoltageOutput(), p.getPanelCount(), p.getWarrantyYears(),
            p.getWeight(), p.getDimensions(), p.isFeatured(),
            p.getMetaTitle(), p.getMetaDescription(),
            category, brand, images, variants
        );
    }
}
