package com.solar.shop.quote.entity;

import com.solar.shop.common.entity.BaseEntity;
import com.solar.shop.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quotes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Quote extends BaseEntity {

    @Column(name = "reference", nullable = false, unique = true, length = 32)
    private String reference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "company", length = 200)
    private String company;

    @Column(name = "installation_type", length = 50)
    private String installationType;

    @Column(name = "consumption_kwh")
    private BigDecimal consumptionKwh;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "budget", precision = 12, scale = 2)
    private BigDecimal budget;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private String status = "new";

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @OneToMany(mappedBy = "quote", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<QuoteItem> items = new ArrayList<>();
}
