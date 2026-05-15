package com.solar.shop.product.specification;

import com.solar.shop.product.dto.ProductFilterRequest;
import com.solar.shop.product.entity.Product;
import com.solar.shop.product.entity.ProductVariant;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

public final class ProductSpecification {

    private ProductSpecification() {}

    public static Specification<Product> byFiltersAdmin(ProductFilterRequest f) {
        return Specification
            .where(notDeleted())
            .and(f.getCategoryId()       != null                       ? hasCategory(f.getCategoryId())           : null)
            .and(f.getBrandIds()         != null && !f.getBrandIds().isEmpty() ? hasBrands(f.getBrandIds())       : null)
            .and(f.getProductType()      != null                       ? hasProductType(f.getProductType())       : null)
            .and(f.getSearch()           != null && !f.getSearch().isBlank() ? searchText(f.getSearch())         : null);
    }

    public static Specification<Product> byFilters(ProductFilterRequest f) {
        return Specification
            .where(isActive())
            .and(notDeleted())
            .and(f.getCategoryId()       != null                       ? hasCategory(f.getCategoryId())           : null)
            .and(f.getBrandIds()         != null && !f.getBrandIds().isEmpty() ? hasBrands(f.getBrandIds())       : null)
            .and(f.getProductType()      != null                       ? hasProductType(f.getProductType())       : null)
            .and(f.getInstallationType() != null                       ? hasInstallationType(f.getInstallationType()) : null)
            .and(f.getPhaseType()        != null                       ? hasPhaseType(f.getPhaseType())           : null)
            .and(f.getInjectionType()    != null                       ? hasInjectionType(f.getInjectionType())   : null)
            .and(f.getHasBattery()       != null && f.getHasBattery()  ? hasBattery()                            : null)
            .and(f.getMinPrice()         != null                       ? priceGte(f.getMinPrice())                : null)
            .and(f.getMaxPrice()         != null                       ? priceLte(f.getMaxPrice())                : null)
            .and(f.getMinPowerKwc()      != null                       ? powerGte(f.getMinPowerKwc())             : null)
            .and(f.getMaxPowerKwc()      != null                       ? powerLte(f.getMaxPowerKwc())             : null)
            .and(f.getSearch()           != null && !f.getSearch().isBlank() ? searchText(f.getSearch())         : null);
    }

    private static Specification<Product> isActive() {
        return (root, q, cb) -> cb.isTrue(root.get("isActive"));
    }

    private static Specification<Product> notDeleted() {
        return (root, q, cb) -> cb.isNull(root.get("deletedAt"));
    }

    private static Specification<Product> hasCategory(Long categoryId) {
        return (root, q, cb) -> cb.equal(root.get("category").get("id"), categoryId);
    }

    private static Specification<Product> hasBrands(java.util.List<Long> brandIds) {
        return (root, q, cb) -> root.get("brand").get("id").in(brandIds);
    }

    private static Specification<Product> hasProductType(String productType) {
        return (root, q, cb) -> cb.equal(root.get("productType"), productType);
    }

    private static Specification<Product> hasInstallationType(String type) {
        return (root, q, cb) -> cb.equal(root.get("installationType"), type);
    }

    private static Specification<Product> hasPhaseType(String phase) {
        return (root, q, cb) -> cb.equal(root.get("phaseType"), phase);
    }

    private static Specification<Product> hasInjectionType(String injection) {
        return (root, q, cb) -> cb.equal(root.get("injectionType"), injection);
    }

    private static Specification<Product> hasBattery() {
        return (root, q, cb) -> cb.isNotNull(root.get("batteryCapacityKwh"));
    }

    private static Specification<Product> priceGte(java.math.BigDecimal minPrice) {
        return (root, q, cb) -> {
            Join<Product, ProductVariant> v = root.join("variants", JoinType.INNER);
            return cb.and(
                cb.isTrue(v.get("isDefault")),
                cb.greaterThanOrEqualTo(v.get("priceTtc"), minPrice)
            );
        };
    }

    private static Specification<Product> priceLte(java.math.BigDecimal maxPrice) {
        return (root, q, cb) -> {
            Join<Product, ProductVariant> v = root.join("variants", JoinType.INNER);
            return cb.and(
                cb.isTrue(v.get("isDefault")),
                cb.lessThanOrEqualTo(v.get("priceTtc"), maxPrice)
            );
        };
    }

    private static Specification<Product> powerGte(java.math.BigDecimal minKwc) {
        return (root, q, cb) -> cb.greaterThanOrEqualTo(root.get("basePowerKwc"), minKwc);
    }

    private static Specification<Product> powerLte(java.math.BigDecimal maxKwc) {
        return (root, q, cb) -> cb.lessThanOrEqualTo(root.get("basePowerKwc"), maxKwc);
    }

    private static Specification<Product> searchText(String search) {
        String pattern = "%" + search.toLowerCase() + "%";
        return (root, q, cb) -> cb.or(
            cb.like(cb.lower(root.get("name")), pattern),
            cb.like(cb.lower(root.get("shortDescription")), pattern),
            cb.like(cb.lower(root.get("sku")), pattern)
        );
    }
}
