package ma.soukdigital.service;

import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.*;
import ma.soukdigital.entity.Role;
import ma.soukdigital.entity.User;
import ma.soukdigital.exception.BadCredentialsException;
import ma.soukdigital.exception.EntityNotFoundException;
import ma.soukdigital.exception.UnverifiedAccountException;
import ma.soukdigital.repository.UserRepository;
import ma.soukdigital.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository    userRepository;
    private final PasswordEncoder   passwordEncoder;
    private final JwtService        jwtService;
    private final OtpService        otpService;

    @Transactional
    public RegisterResponse register(RegisterRequest req) {
        if (userRepository.existsByPhone(req.phone())) {
            throw new IllegalArgumentException("Ce numéro de téléphone est déjà utilisé.");
        }
        if (req.email() != null && !req.email().isBlank() && userRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Cet email est déjà utilisé.");
        }

        User user = User.builder()
            .firstName(req.firstName())
            .lastName(req.lastName())
            .email(req.email())
            .phone(req.phone())
            .passwordHash(passwordEncoder.encode(req.password()))
            .role(Role.BUYER)
            .isVerified(false)
            .build();

        user = userRepository.save(user);
        otpService.generateAndSend(req.phone());

        return new RegisterResponse(user.getId(),
            "Compte créé. Un code OTP a été envoyé au " + req.phone());
    }

    @Transactional
    public AuthResponse verifyOtp(OtpVerifyRequest req) {
        User user = userRepository.findByPhone(req.phone())
            .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable."));

        otpService.verify(req.phone(), req.code());

        user.setVerified(true);
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.identifier())
            .or(() -> userRepository.findByPhone(req.identifier()))
            .orElseThrow(BadCredentialsException::new);

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new BadCredentialsException();
        }
        if (!user.isVerified()) {
            throw new UnverifiedAccountException();
        }

        return buildAuthResponse(user);
    }

    public String refreshToken(String refreshToken) {
        if (!jwtService.validateToken(refreshToken)) {
            throw new BadCredentialsException();
        }
        String userId = jwtService.extractUserId(refreshToken);
        User user = userRepository.findById(java.util.UUID.fromString(userId))
            .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable."));

        return jwtService.generateToken(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken  = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        UserDto userDto = toUserDto(user);
        return new AuthResponse(accessToken, refreshToken, jwtService.getExpiration() / 1000, userDto);
    }

    private UserDto toUserDto(User user) {
        return new UserDto(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole(),
            user.isVerified(),
            user.getAvatarUrl()
        );
    }
}
