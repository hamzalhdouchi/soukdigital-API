package ma.soukdigital.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.soukdigital.entity.Vendor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(unique = true, length = 255)
    private String email;

    @Column(unique = true, length = 20)
    private String phone;

    @Column(name = "password_hash")
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.BUYER;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private boolean isVerified = false;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    private Vendor vendor;
}



