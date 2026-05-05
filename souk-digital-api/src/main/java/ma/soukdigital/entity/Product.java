package ma.soukdigital.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.soukdigital.entity.Category;
import ma.soukdigital.entity.Vendor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "products")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false, length = 300)
    private String name;

    @Column(name = "name_ar", nullable = false, length = 300)
    private String nameAr;

    @Column(unique = true, nullable = false, length = 300)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "description_ar", columnDefinition = "TEXT")
    private String descriptionAr;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "original_price", precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "stock_count", nullable = false)
    @Builder.Default
    private int stockCount = 0;

    @Column(length = 20)
    private String badge;

    @Column(length = 100)
    private String city;

    @Column(name = "free_delivery", nullable = false)
    @Builder.Default
    private boolean freeDelivery = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal rating = BigDecimal.ZERO;

    @Column(name = "review_count")
    @Builder.Default
    private int reviewCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "product_images",
        joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "url")
    @OrderColumn(name = "sort_order")
    @Builder.Default
    private List<String> images = new ArrayList<>();
}



