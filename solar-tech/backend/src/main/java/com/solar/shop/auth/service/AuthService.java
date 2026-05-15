package com.solar.shop.auth.service;

import com.solar.shop.auth.dto.*;
import com.solar.shop.common.exception.BusinessException;
import com.solar.shop.security.JwtService;
import com.solar.shop.user.entity.Role;
import com.solar.shop.user.entity.User;
import com.solar.shop.user.repository.RoleRepository;
import com.solar.shop.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JavaMailSender mailSender;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("Un compte avec cet email existe déjà", HttpStatus.CONFLICT);
        }

        Role clientRole = roleRepository.findByName("ROLE_CLIENT")
            .orElseThrow(() -> new BusinessException("Rôle client introuvable"));

        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setRoles(Set.of(clientRole));

        User saved = userRepository.save(user);

        String accessToken = jwtService.generateToken(saved);
        String refreshToken = jwtService.generateRefreshToken(saved);

        List<String> roles = saved.getRoles().stream().map(Role::getName).toList();
        return AuthResponse.of(saved.getId(), saved.getEmail(), saved.getFirstName(), saved.getLastName(), roles, accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = (User) userDetailsService.loadUserByUsername(request.email());

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        List<String> roles = user.getRoles().stream().map(Role::getName).toList();
        return AuthResponse.of(user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(), roles, accessToken, refreshToken);
    }

    public AuthResponse refresh(RefreshRequest request) {
        String email = jwtService.extractUsername(request.refreshToken());
        User user = (User) userDetailsService.loadUserByUsername(email);

        if (!jwtService.isTokenValid(request.refreshToken(), user)) {
            throw new BusinessException("Refresh token invalide ou expiré", HttpStatus.UNAUTHORIZED);
        }

        String newAccessToken = jwtService.generateToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);

        List<String> roles = user.getRoles().stream().map(Role::getName).toList();
        return AuthResponse.of(user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(), roles, newAccessToken, newRefreshToken);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        // Always respond with success to prevent email enumeration attacks
        userRepository.findByEmailAndDeletedAtIsNull(request.email()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setPasswordResetToken(token);
            user.setPasswordResetExpiresAt(LocalDateTime.now().plusHours(1));
            userRepository.save(user);

            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(user.getEmail());
                message.setSubject("Réinitialisation de votre mot de passe — SolarTech");
                message.setText(
                    "Bonjour " + user.getFirstName() + ",\n\n" +
                    "Vous avez demandé la réinitialisation de votre mot de passe.\n\n" +
                    "Cliquez sur le lien ci-dessous (valable 1 heure) :\n" +
                    "http://localhost:3000/reinitialiser-mot-de-passe?token=" + token + "\n\n" +
                    "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.\n\n" +
                    "L'équipe SolarTech"
                );
                mailSender.send(message);
            } catch (Exception ignored) {
                // Swallow mail errors so the endpoint doesn't leak user existence
            }
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.token())
            .orElseThrow(() -> new BusinessException("Lien de réinitialisation invalide ou expiré", HttpStatus.BAD_REQUEST));

        if (user.getPasswordResetExpiresAt() == null ||
            user.getPasswordResetExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Lien de réinitialisation expiré", HttpStatus.BAD_REQUEST);
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
        userRepository.save(user);
    }
}
