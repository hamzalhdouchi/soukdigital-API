package ma.soukdigital.repository;

import ma.soukdigital.entity.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, UUID> {

    Optional<Vendor> findBySlug(String slug);

    Optional<Vendor> findByUserId(UUID userId);

    boolean existsBySlug(String slug);

    Page<Vendor> findByCityAndIsVerifiedTrue(String city, Pageable pageable);

    @Query("""
        SELECT v FROM Vendor v
        WHERE LOWER(v.name) LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(v.nameAr) LIKE LOWER(CONCAT('%', :q, '%'))
        ORDER BY v.rating DESC
        """)
    List<Vendor> searchByName(@Param("q") String q, Pageable pageable);

    Page<Vendor> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByIsVerifiedTrue();
}



