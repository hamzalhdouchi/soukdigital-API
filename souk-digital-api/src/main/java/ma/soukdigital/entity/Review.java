package ma.soukdigital.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.soukdigital.entity.Order;
import ma.soukdigital.entity.Product;
import ma.soukdigital.entity.User;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "reviews",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_reviews_product_user",
        columnNames = {"product_id", "user_id"}
    ))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(nullable = false)
    private short rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "is_verified_purchase", nullable = false)
    @Builder.Default
    private boolean isVerifiedPurchase = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}



