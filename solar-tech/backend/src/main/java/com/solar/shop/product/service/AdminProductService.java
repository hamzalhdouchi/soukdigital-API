package com.solar.shop.product.service;

import com.solar.shop.brand.entity.Brand;
import com.solar.shop.brand.repository.BrandRepository;
import com.solar.shop.category.entity.Category;
import com.solar.shop.category.repository.CategoryRepository;
import com.solar.shop.common.dto.PageResponse;
import com.solar.shop.common.exception.BusinessException;
import com.solar.shop.common.exception.ResourceNotFoundException;
import com.solar.shop.product.dto.ProductCreateRequest;
import com.solar.shop.product.dto.ProductDetailResponse;
import com.solar.shop.product.dto.ProductFilterRequest;
import com.solar.shop.product.dto.ProductUpdateRequest;
import com.solar.shop.product.entity.Product;
import com.solar.shop.product.entity.ProductImage;
import com.solar.shop.product.entity.ProductVariant;
import com.solar.shop.product.repository.ProductImageRepository;
import com.solar.shop.product.repository.ProductRepository;
import com.solar.shop.product.specification.ProductSpecification;
import com.solar.shop.storage.MinioStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.text.Normalizer;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductService productService;
    private final MinioStorageService minioStorageService;

    @Transactional(readOnly = true)
    public PageResponse<ProductDetailResponse> findAll(ProductFilterRequest filter, Pageable pageable) {
        var page = productRepository.findAll(ProductSpecification.byFiltersAdmin(filter), pageable);
        return PageResponse.from(page.map(this::toDetail));
    }

    @Transactional
    public ProductDetailResponse create(ProductCreateRequest req) {
        Product product = new Product();
        product.setSku(req.sku());
        product.setSlug(slugify(req.name()) + "-" + System.currentTimeMillis() % 100000);
        product.setName(req.name());
        applyCommonFields(product, req);

        if (req.variants() != null) {
            req.variants().forEach(vr -> {
                ProductVariant v = new ProductVariant();
                v.setProduct(product);
                v.setReference(vr.reference());
                v.setLabel(vr.label());
                v.setPriceHt(vr.priceHt());
                v.setPriceTtc(vr.priceTtc());
                v.setCurrency(vr.currency() != null ? vr.currency() : "EUR");
                v.setDefault(vr.isDefault());
                v.setActive(vr.isActive());
                product.getVariants().add(v);
            });
        }

        return toDetail(productRepository.save(product));
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductDetailResponse update(Long id, ProductUpdateRequest req) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (req.name() != null) product.setName(req.name());
        if (req.shortDescription() != null) product.setShortDescription(req.shortDescription());
        if (req.longDescription() != null) product.setLongDescription(req.longDescription());
        if (req.productType() != null) product.setProductType(req.productType());
        if (req.installationType() != null) product.setInstallationType(req.installationType());
        if (req.phaseType() != null) product.setPhaseType(req.phaseType());
        if (req.injectionType() != null) product.setInjectionType(req.injectionType());
        if (req.basePowerKwc() != null) product.setBasePowerKwc(req.basePowerKwc());
        if (req.inverterPowerVa() != null) product.setInverterPowerVa(req.inverterPowerVa());
        if (req.batteryCapacityKwh() != null) product.setBatteryCapacityKwh(req.batteryCapacityKwh());
        if (req.voltageOutput() != null) product.setVoltageOutput(req.voltageOutput());
        if (req.panelCount() != null) product.setPanelCount(req.panelCount());
        if (req.warrantyYears() != null) product.setWarrantyYears(req.warrantyYears());
        if (req.weight() != null) product.setWeight(req.weight());
        if (req.dimensions() != null) product.setDimensions(req.dimensions());
        if (req.metaTitle() != null) product.setMetaTitle(req.metaTitle());
        if (req.metaDescription() != null) product.setMetaDescription(req.metaDescription());
        if (req.isFeatured() != null) product.setFeatured(req.isFeatured());
        if (req.isActive() != null) product.setActive(req.isActive());

        if (req.categoryId() != null) {
            product.setCategory(categoryRepository.findById(req.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", req.categoryId())));
        }
        if (req.brandId() != null) {
            product.setBrand(brandRepository.findById(req.brandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", req.brandId())));
        }

        return toDetail(productRepository.save(product));
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void softDelete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setDeletedAt(LocalDateTime.now());
        product.setActive(false);
        productRepository.save(product);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductDetailResponse addImage(Long productId, MultipartFile file) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        try {
            String url = minioStorageService.upload(file);
            ProductImage image = new ProductImage();
            image.setProduct(product);
            image.setUrl(url);
            image.setAltText(product.getName());
            image.setPrimary(product.getImages().isEmpty());
            image.setPosition(product.getImages().size());
            productImageRepository.save(image);
            product.getImages().add(image);
            return toDetail(product);
        } catch (Exception e) {
            throw new BusinessException("Erreur lors de l'upload de l'image : " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductDetailResponse deleteImage(Long productId, Long imageId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        ProductImage image = productImageRepository.findById(imageId)
            .orElseThrow(() -> new ResourceNotFoundException("ProductImage", "id", imageId));

        boolean wasPrimary = image.isPrimary();
        minioStorageService.delete(image.getUrl());
        product.getImages().remove(image);
        productImageRepository.delete(image);

        if (wasPrimary && !product.getImages().isEmpty()) {
            product.getImages().get(0).setPrimary(true);
            productRepository.save(product);
        }
        return toDetail(productRepository.findById(productId).orElseThrow());
    }

    private void applyCommonFields(Product p, ProductCreateRequest req) {
        p.setShortDescription(req.shortDescription());
        p.setLongDescription(req.longDescription());
        p.setProductType(req.productType());
        p.setInstallationType(req.installationType());
        p.setPhaseType(req.phaseType());
        p.setInjectionType(req.injectionType());
        p.setBasePowerKwc(req.basePowerKwc());
        p.setInverterPowerVa(req.inverterPowerVa());
        p.setBatteryCapacityKwh(req.batteryCapacityKwh());
        p.setVoltageOutput(req.voltageOutput());
        p.setPanelCount(req.panelCount());
        p.setWarrantyYears(req.warrantyYears());
        p.setWeight(req.weight());
        p.setDimensions(req.dimensions());
        p.setMetaTitle(req.metaTitle());
        p.setMetaDescription(req.metaDescription());
        p.setFeatured(req.isFeatured());
        p.setActive(req.isActive());

        if (req.categoryId() != null) {
            p.setCategory(categoryRepository.findById(req.categoryId()).orElse(null));
        }
        if (req.brandId() != null) {
            p.setBrand(brandRepository.findById(req.brandId()).orElse(null));
        }
    }

    private ProductDetailResponse toDetail(Product p) {
        var category = p.getCategory() != null
                ? new ProductDetailResponse.CategoryInfo(p.getCategory().getId(), p.getCategory().getSlug(), p.getCategory().getName())
                : null;
        var brand = p.getBrand() != null
                ? new ProductDetailResponse.BrandInfo(p.getBrand().getId(), p.getBrand().getSlug(), p.getBrand().getName(), p.getBrand().getLogoUrl())
                : null;
        var images = p.getImages().stream()
                .map(i -> new ProductDetailResponse.ImageInfo(i.getId(), i.getUrl(), i.getAltText(), i.isPrimary()))
                .toList();
        var variants = p.getVariants().stream()
                .map(v -> new ProductDetailResponse.VariantInfo(
                        v.getId(), v.getReference(), v.getLabel(),
                        v.getPriceHt(), v.getPriceTtc(), v.getCurrency(),
                        v.isDefault(), v.isActive()))
                .toList();
        return new ProductDetailResponse(
                p.getId(), p.getSku(), p.getSlug(), p.getName(),
                p.getShortDescription(), p.getLongDescription(),
                p.getProductType(), p.getInstallationType(), p.getPhaseType(), p.getInjectionType(),
                p.getBasePowerKwc(), p.getInverterPowerVa(), p.getBatteryCapacityKwh(),
                p.getVoltageOutput(), p.getPanelCount(), p.getWarrantyYears(),
                p.getWeight(), p.getDimensions(), p.isFeatured(), p.isActive(),
                p.getMetaTitle(), p.getMetaDescription(),
                category, brand, images, variants
        );
    }

    private static String slugify(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return normalized.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-");
    }
}
