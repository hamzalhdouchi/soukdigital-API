package com.solar.shop.order.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "order_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "product_variant_id")
    private Long productVariantId;

    @Column(name = "product_name", nullable = false, length = 255)
    private String productName;

    @Column(name = "variant_label", length = 100)
    private String variantLabel;

    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "unit_price_ht", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPriceHt;

    @Column(name = "unit_price_ttc", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPriceTtc;

    @Column(name = "product_snapshot", columnDefinition = "TEXT")
    private String productSnapshot;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() { createdAt = Instant.now(); }
}
