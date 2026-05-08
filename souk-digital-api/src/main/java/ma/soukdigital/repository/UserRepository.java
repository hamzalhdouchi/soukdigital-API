package ma.soukdigital.repository;

import ma.soukdigital.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    @Query(
        value = """
            SELECT u FROM User u
            WHERE (:q IS NULL
                OR LOWER(u.firstName) LIKE LOWER(CONCAT('%',:q,'%'))
                OR LOWER(u.lastName)  LIKE LOWER(CONCAT('%',:q,'%'))
                OR u.phone             LIKE CONCAT('%',:q,'%'))
            ORDER BY u.createdAt DESC
            """,
        countQuery = """
            SELECT COUNT(u) FROM User u
            WHERE (:q IS NULL
                OR LOWER(u.firstName) LIKE LOWER(CONCAT('%',:q,'%'))
                OR LOWER(u.lastName)  LIKE LOWER(CONCAT('%',:q,'%'))
                OR u.phone             LIKE CONCAT('%',:q,'%'))
            """
    )
    Page<User> search(@Param("q") String q, Pageable pageable);

    long countByRole(ma.soukdigital.entity.Role role);
}




