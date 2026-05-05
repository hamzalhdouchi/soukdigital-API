package ma.soukdigital.security;

import ma.soukdigital.entity.Role;
import ma.soukdigital.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private static final String SECRET =
        "test-secret-key-must-be-at-least-256-bits-long-for-hmac-sha256";
    private static final long EXPIRATION         = 86_400_000L;
    private static final long REFRESH_EXPIRATION = 604_800_000L;

    private JwtService jwtService;
    private User       testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, EXPIRATION, REFRESH_EXPIRATION);
        testUser   = User.builder()
            .id(UUID.randomUUID())
            .firstName("Ahmed")
            .lastName("Ziani")
            .email("ahmed@test.ma")
            .phone("+212600000001")
            .role(Role.BUYER)
            .build();
    }

    @Test
    void generateToken_returnsNonNullJwt() {
        String token = jwtService.generateToken(testUser);
        assertThat(token).isNotBlank();
    }

    @Test
    void validateToken_withValidToken_returnsTrue() {
        String token = jwtService.generateToken(testUser);
        assertThat(jwtService.validateToken(token)).isTrue();
    }

    @Test
    void validateToken_withTamperedToken_returnsFalse() {
        String token = jwtService.generateToken(testUser) + "tampered";
        assertThat(jwtService.validateToken(token)).isFalse();
    }

    @Test
    void validateToken_withExpiredToken_returnsFalse() {
        JwtService shortLived = new JwtService(SECRET, 1L, REFRESH_EXPIRATION);
        String token = shortLived.generateToken(testUser);
        // 1ms TTL — immediately expired by the time we validate
        assertThat(shortLived.validateToken(token)).isFalse();
    }

    @Test
    void extractUserId_returnsCorrectUserId() {
        String token  = jwtService.generateToken(testUser);
        String userId = jwtService.extractUserId(token);
        assertThat(userId).isEqualTo(testUser.getId().toString());
    }

    @Test
    void extractRole_returnsCorrectRole() {
        String token = jwtService.generateToken(testUser);
        assertThat(jwtService.extractRole(token)).isEqualTo("BUYER");
    }

    @Test
    void generateRefreshToken_isDistinctFromAccessToken() {
        String access  = jwtService.generateToken(testUser);
        String refresh = jwtService.generateRefreshToken(testUser);
        assertThat(access).isNotEqualTo(refresh);
    }
}
