package com.solar.shop.order.entity;

import com.solar.shop.common.entity.BaseEntity;
import com.solar.shop.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order extends BaseEntity {

    @Column(name = "reference", nullable = false, unique = true, length = 32)
    private String reference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private String status = "pending";

    // Shipping address (denormalized)
    @Column(name = "shipping_first_name", nullable = false, length = 100)
    private String shippingFirstName;

    @Column(name = "shipping_last_name", nullable = false, length = 100)
    private String shippingLastName;

    @Column(name = "shipping_email", nullable = false, length = 255)
    private String shippingEmail;

    @Column(name = "shipping_phone", length = 30)
    private String shippingPhone;

    @Column(name = "shipping_address", nullable = false, length = 500)
    private String shippingAddress;

    @Column(name = "shipping_city", nullable = false, length = 100)
    private String shippingCity;

    @Column(name = "shipping_postal_code", nullable = false, length = 20)
    private String shippingPostalCode;

    @Column(name = "shipping_country", nullable = false, length = 2)
    @Builder.Default
    private String shippingCountry = "FR";

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "subtotal_ht", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal subtotalHt = BigDecimal.ZERO;

    @Column(name = "tax_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "shipping_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal shippingAmount = BigDecimal.ZERO;

    @Column(name = "total_ttc", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalTtc = BigDecimal.ZERO;

    @Column(name = "currency", nullable = false, length = 3)
    @Builder.Default
    private String currency = "EUR";

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
}
