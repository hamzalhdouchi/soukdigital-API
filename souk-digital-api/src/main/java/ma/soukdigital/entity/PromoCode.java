package ma.soukdigital.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "promo_codes")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PromoCode {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(name = "discount_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal discountPercent;

    @Column(name = "max_uses")
    private Integer maxUses;

    @Column(name = "used_count", nullable = false)
    @Builder.Default
    private int usedCount = 0;

    @Column(name = "expires_at")
    private OffsetDateTime expiresAt;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}


