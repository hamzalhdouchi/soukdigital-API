package ma.soukdigital.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.soukdigital.entity.User;

import java.util.UUID;

@Entity
@Table(name = "addresses")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 50)
    private String label;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String street;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(name = "zip_code", length = 20)
    private String zipCode;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private boolean isDefault = false;
}



