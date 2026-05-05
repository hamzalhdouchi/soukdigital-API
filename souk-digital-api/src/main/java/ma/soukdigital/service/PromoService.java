package ma.soukdigital.service;

import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.CreatePromoRequest;
import ma.soukdigital.dto.PromoCodeDto;
import ma.soukdigital.dto.PromoValidationResponse;
import ma.soukdigital.entity.PromoCode;
import ma.soukdigital.exception.EntityNotFoundException;
import ma.soukdigital.repository.PromoCodeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PromoService {

    private final PromoCodeRepository promoCodeRepository;

    public PromoValidationResponse validate(String code) {
        try {
            PromoCode promo = promoCodeRepository
                .findByCodeIgnoreCase(code)
                .orElseThrow(() -> new EntityNotFoundException("Code promo introuvable."));

            if (!promo.isActive()) {
                return invalid("Ce code promo n'est plus actif.");
            }
            if (promo.getExpiresAt() != null && promo.getExpiresAt().isBefore(OffsetDateTime.now())) {
                return invalid("Ce code promo a expiré.");
            }
            if (promo.getMaxUses() != null && promo.getUsedCount() >= promo.getMaxUses()) {
                return invalid("Ce code promo a atteint son nombre maximum d'utilisations.");
            }

            return new PromoValidationResponse(
                true,
                promo.getCode(),
                promo.getDiscountPercent(),
                "Code valide — " + promo.getDiscountPercent() + "% de réduction"
            );
        } catch (EntityNotFoundException e) {
            return invalid("Code promo invalide.");
        }
    }

    @Transactional
    public PromoCodeDto create(CreatePromoRequest req) {
        if (promoCodeRepository.findByCodeIgnoreCase(req.code()).isPresent()) {
            throw new IllegalArgumentException("Un code promo avec ce nom existe déjà.");
        }
        PromoCode promo = PromoCode.builder()
            .code(req.code().toUpperCase())
            .discountPercent(req.discountPercent())
            .maxUses(req.maxUses())
            .expiresAt(req.expiresAt())
            .isActive(true)
            .build();
        return toDto(promoCodeRepository.save(promo));
    }

    public Page<PromoCodeDto> findAll(int page, int size) {
        return promoCodeRepository
            .findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()))
            .map(this::toDto);
    }

    @Transactional
    public PromoCodeDto toggleActive(UUID id) {
        PromoCode promo = promoCodeRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Code promo introuvable."));
        promo.setActive(!promo.isActive());
        return toDto(promoCodeRepository.save(promo));
    }

    // ── Helpers ───────────────────────────────────────────────

    private PromoValidationResponse invalid(String message) {
        return new PromoValidationResponse(false, null, null, message);
    }

    private PromoCodeDto toDto(PromoCode p) {
        return new PromoCodeDto(
            p.getId(), p.getCode(), p.getDiscountPercent(),
            p.getMaxUses(), p.getUsedCount(), p.getExpiresAt(),
            p.isActive(), p.getCreatedAt()
        );
    }
}
