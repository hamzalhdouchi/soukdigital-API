package ma.soukdigital.repository;

import ma.soukdigital.entity.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpCodeRepository extends JpaRepository<OtpCode, UUID> {

    Optional<OtpCode> findFirstByPhoneAndUsedFalseOrderByCreatedAtDesc(String phone);
}




