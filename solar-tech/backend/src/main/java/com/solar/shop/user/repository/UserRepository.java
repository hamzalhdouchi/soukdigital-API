package com.solar.shop.user.repository;

import com.solar.shop.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailAndDeletedAtIsNull(String email);

    Optional<User> findByPasswordResetToken(String token);

    boolean existsByEmail(String email);
}
