package ma.soukdigital.service;

import ma.soukdigital.entity.PromoCode;
import ma.soukdigital.repository.PromoCodeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PromoServiceTest {

    @Mock PromoCodeRepository promoCodeRepository;

    private PromoService promoService;

    @BeforeEach
    void setUp() {
        promoService = new PromoService(promoCodeRepository);
    }

    @Test
    void validate_withValidCode_returnsValidResponse() {
        PromoCode promo = activePromo("SOUK10", 10, null, null);
        when(promoCodeRepository.findByCodeIgnoreCase("SOUK10")).thenReturn(Optional.of(promo));

        var result = promoService.validate("SOUK10");

        assertThat(result.valid()).isTrue();
        assertThat(result.discountPercent()).isEqualByComparingTo(BigDecimal.valueOf(10));
    }

    @Test
    void validate_withInactiveCode_returnsInvalid() {
        PromoCode promo = activePromo("DEAD10", 10, null, null);
        promo.setActive(false);
        when(promoCodeRepository.findByCodeIgnoreCase("DEAD10")).thenReturn(Optional.of(promo));

        var result = promoService.validate("DEAD10");

        assertThat(result.valid()).isFalse();
    }

    @Test
    void validate_withExpiredCode_returnsInvalid() {
        PromoCode promo = activePromo("OLD10", 10, OffsetDateTime.now().minusDays(1), null);
        when(promoCodeRepository.findByCodeIgnoreCase("OLD10")).thenReturn(Optional.of(promo));

        var result = promoService.validate("OLD10");

        assertThat(result.valid()).isFalse();
        assertThat(result.message()).contains("expiré");
    }

    @Test
    void validate_withMaxUsesReached_returnsInvalid() {
        PromoCode promo = activePromo("USED", 10, null, 5);
        promo.setUsedCount(5);
        when(promoCodeRepository.findByCodeIgnoreCase("USED")).thenReturn(Optional.of(promo));

        var result = promoService.validate("USED");

        assertThat(result.valid()).isFalse();
        assertThat(result.message()).contains("maximum");
    }

    @Test
    void validate_withUnknownCode_returnsInvalid() {
        when(promoCodeRepository.findByCodeIgnoreCase("FAKE")).thenReturn(Optional.empty());

        var result = promoService.validate("FAKE");

        assertThat(result.valid()).isFalse();
    }

    // ── Helpers ───────────────────────────────────────────────

    private PromoCode activePromo(String code, int pct, OffsetDateTime expiresAt, Integer maxUses) {
        return PromoCode.builder()
            .id(UUID.randomUUID())
            .code(code)
            .discountPercent(BigDecimal.valueOf(pct))
            .isActive(true)
            .usedCount(0)
            .expiresAt(expiresAt)
            .maxUses(maxUses)
            .build();
    }
}
