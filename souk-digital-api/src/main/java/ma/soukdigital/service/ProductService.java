package ma.soukdigital.service;

import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.*;
import ma.soukdigital.entity.Category;
import ma.soukdigital.entity.Product;
import ma.soukdigital.entity.Vendor;
import ma.soukdigital.exception.EntityNotFoundException;
import ma.soukdigital.repository.CategoryRepository;
import ma.soukdigital.repository.ProductRepository;
import ma.soukdigital.repository.VendorRepository;
import org.springframework.data.domain.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository  productRepository;
    private final CategoryRepository categoryRepository;
    private final VendorRepository   vendorRepository;

    public Page<ProductSummaryDto> findAll(ProductFilterRequest filter) {
        Pageable pageable = buildPageable(filter.sort(), filter.page(), filter.size());
        return productRepository.filter(
            filter.keyword(),
            filter.category(),
            filter.city(),
            filter.freeDelivery(),
            filter.artisanOnly(),
            filter.minPrice(),
            filter.maxPrice(),
            pageable
        ).map(this::toSummary);
    }

    public ProductDetailDto findBySlug(String slug) {
        Product p = productRepository.findBySlug(slug)
            .orElseThrow(() -> new EntityNotFoundException("Produit introuvable : " + slug));
        return toDetail(p);
    }

    public List<ProductSummaryDto> findRelated(UUID productId, int limit) {
        Product p = productRepository.findById(productId)
            .orElseThrow(() -> new EntityNotFoundException("Produit introuvable."));
        String categorySlug = p.getCategory() != null ? p.getCategory().getSlug() : null;
        Pageable pageable = PageRequest.of(0, limit + 1);
        return productRepository.findByCategorySlug(categorySlug, pageable)
            .stream()
            .filter(r -> !r.getId().equals(productId))
            .limit(limit)
            .map(this::toSummary)
            .toList();
    }

    public Page<ProductSummaryDto> findByVendor(UUID vendorId, Pageable pageable) {
        return productRepository.findByVendorIdAndIsActiveTrue(vendorId, pageable)
            .map(this::toSummary);
    }

    @Transactional
    public ProductDetailDto create(CreateProductRequest req, UUID userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
            .orElseThrow(() -> new EntityNotFoundException("Profil vendeur introuvable."));
        Category category = categoryRepository.findById(req.categoryId())
            .orElseThrow(() -> new EntityNotFoundException("Catégorie introuvable."));

        String slug = uniqueSlug(SlugUtils.slugify(req.name()));

        Product product = Product.builder()
            .vendor(vendor)
            .category(category)
            .name(req.name())
            .nameAr(req.nameAr())
            .slug(slug)
            .description(req.description())
            .descriptionAr(req.descriptionAr())
            .price(req.price())
            .originalPrice(req.originalPrice())
            .stockCount(req.stockCount())
            .badge(req.badge())
            .city(req.city())
            .freeDelivery(req.freeDelivery())
            .isActive(true)
            .build();

        if (req.imageUrls() != null) {
            product.getImages().addAll(req.imageUrls());
        }

        return toDetail(productRepository.save(product));
    }

    @Transactional
    public ProductDetailDto update(UUID productId, UpdateProductRequest req, UUID userId) {
        Product product = getOwnedProduct(productId, userId);

        if (req.name()          != null) product.setName(req.name());
        if (req.nameAr()        != null) product.setNameAr(req.nameAr());
        if (req.description()   != null) product.setDescription(req.description());
        if (req.descriptionAr() != null) product.setDescriptionAr(req.descriptionAr());
        if (req.price()         != null) product.setPrice(req.price());
        if (req.originalPrice() != null) product.setOriginalPrice(req.originalPrice());
        if (req.stockCount()    != null) product.setStockCount(req.stockCount());
        if (req.badge()         != null) product.setBadge(req.badge());
        if (req.city()          != null) product.setCity(req.city());
        if (req.freeDelivery()  != null) product.setFreeDelivery(req.freeDelivery());
        if (req.categoryId()    != null) {
            Category cat = categoryRepository.findById(req.categoryId())
                .orElseThrow(() -> new EntityNotFoundException("Catégorie introuvable."));
            product.setCategory(cat);
        }
        if (req.imageUrls() != null) {
            product.getImages().clear();
            product.getImages().addAll(req.imageUrls());
        }

        return toDetail(productRepository.save(product));
    }

    @Transactional
    public void delete(UUID productId, UUID userId) {
        Product product = getOwnedProduct(productId, userId);
        product.setActive(false);
        productRepository.save(product);
    }

    @Transactional
    public void toggleActive(UUID productId, UUID userId) {
        Product product = getOwnedProduct(productId, userId);
        product.setActive(!product.isActive());
        productRepository.save(product);
    }

    // ── Private helpers ────────────────────────────────────────

    private Product getOwnedProduct(UUID productId, UUID userId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new EntityNotFoundException("Produit introuvable."));
        Vendor vendor = vendorRepository.findByUserId(userId)
            .orElseThrow(() -> new EntityNotFoundException("Profil vendeur introuvable."));
        if (!product.getVendor().getId().equals(vendor.getId())) {
            throw new AccessDeniedException("Vous n'êtes pas autorisé à modifier ce produit.");
        }
        return product;
    }

    private String uniqueSlug(String base) {
        String slug = base;
        int i = 2;
        while (productRepository.findBySlug(slug).isPresent()) {
            slug = base + "-" + i++;
        }
        return slug;
    }

    private Pageable buildPageable(String sort, int page, int size) {
        Sort s = switch (sort) {
            case "price_asc"  -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "rating"     -> Sort.by("rating").descending();
            default           -> Sort.by("createdAt").descending();
        };
        return PageRequest.of(page, size, s);
    }

    private ProductSummaryDto toSummary(Product p) {
        String image = p.getImages().isEmpty() ? null : p.getImages().get(0);
        return new ProductSummaryDto(
            p.getId(), p.getSlug(), p.getName(), p.getNameAr(),
            p.getPrice(), p.getOriginalPrice(), image,
            p.getRating(), p.getReviewCount(), p.getBadge(),
            p.getStockCount() > 0, p.isFreeDelivery(), p.getCity(),
            toVendorDto(p.getVendor())
        );
    }

    private ProductDetailDto toDetail(Product p) {
        CategoryResponse catResponse = p.getCategory() == null ? null :
            new CategoryResponse(
                p.getCategory().getId(), p.getCategory().getName(),
                p.getCategory().getNameAr(), p.getCategory().getSlug(),
                p.getCategory().getEmoji(), p.getCategory().getImageUrl(),
                p.getCategory().getSortOrder(), List.of()
            );
        return new ProductDetailDto(
            p.getId(), p.getSlug(), p.getName(), p.getNameAr(),
            p.getDescription(), p.getDescriptionAr(),
            p.getPrice(), p.getOriginalPrice(), p.getImages(),
            p.getRating(), p.getReviewCount(), p.getBadge(),
            p.getStockCount() > 0, p.getStockCount(),
            p.isFreeDelivery(), p.getCity(),
            catResponse, toVendorDto(p.getVendor())
        );
    }

    private ProductVendorDto toVendorDto(Vendor v) {
        return new ProductVendorDto(
            v.getId(), v.getName(), v.getSlug(),
            v.isArtisan(), v.isVerified()
        );
    }
}
