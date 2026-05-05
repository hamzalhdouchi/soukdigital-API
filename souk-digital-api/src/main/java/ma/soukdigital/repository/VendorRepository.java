package ma.soukdigital.repository;

import ma.soukdigital.entity.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, UUID> {

    Optional<Vendor> findBySlug(String slug);

    Optional<Vendor> findByUserId(UUID userId);

    boolean existsBySlug(String slug);

    Page<Vendor> findByCityAndIsVerifiedTrue(String city, Pageable pageable);
}



