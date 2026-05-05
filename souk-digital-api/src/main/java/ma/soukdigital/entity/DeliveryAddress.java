package ma.soukdigital.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DeliveryAddress {

    @Column(name = "delivery_first_name", length = 100)
    private String firstName;

    @Column(name = "delivery_last_name", length = 100)
    private String lastName;

    @Column(name = "delivery_phone", length = 20)
    private String phone;

    @Column(name = "delivery_street", columnDefinition = "TEXT")
    private String street;

    @Column(name = "delivery_city", length = 100)
    private String city;

    @Column(name = "delivery_zip", length = 20)
    private String zipCode;
}


