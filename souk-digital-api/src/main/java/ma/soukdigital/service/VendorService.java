package ma.soukdigital.service;

import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.*;
import ma.soukdigital.entity.Role;
import ma.soukdigital.entity.User;
import ma.soukdigital.entity.Vendor;
import ma.soukdigital.exception.EntityNotFoundException;
import ma.soukdigital.repository.UserRepository;
import ma.soukdigital.repository.VendorRepository;
import ma.soukdigital.security.JwtService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VendorService {

    private final VendorRepository vendorRepository;
    private final UserRepository   userRepository;
    private final JwtService       jwtService;

    public Page<VendorSummaryDto> findAll(int page, int size, String city) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("rating").descending());
        if (city != null && !city.isBlank()) {
            return vendorRepository.findByCityAndIsVerifiedTrue(city, pageable).map(this::toSummary);
        }
        return vendorRepository.findAll(pageable).map(this::toSummary);
    }

    public VendorDetailDto findBySlug(String slug) {
        return vendorRepository.findBySlug(slug)
            .map(this::toDetail)
            .orElseThrow(() -> new EntityNotFoundException("Vendeur introuvable : " + slug));
    }

    public VendorDetailDto findByCurrentUser(UUID userId) {
        return vendorRepository.findByUserId(userId)
            .map(this::toDetail)
            .orElseThrow(() -> new EntityNotFoundException("Profil vendeur introuvable."));
    }

    @Transactional
    public VendorRegisterResponse createVendorProfile(CreateVendorRequest req, UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable."));

        if (vendorRepository.findByUserId(userId).isPresent()) {
            throw new IllegalArgumentException("Vous avez déjà un profil vendeur.");
        }

        String slug = uniqueSlug(SlugUtils.slugify(req.name()));

        Vendor vendor = Vendor.builder()
            .user(user)
            .name(req.name())
            .nameAr(req.nameAr())
            .slug(slug)
            .city(req.city())
            .description(req.description())
            .descriptionAr(req.descriptionAr())
            .avatarUrl(req.avatarUrl())
            .bannerUrl(req.bannerUrl())
            .isArtisan(req.artisan())
            .isVerified(false)
            .build();

        vendorRepository.save(vendor);

        user.setRole(Role.VENDOR);
        userRepository.save(user);

        String accessToken  = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return new VendorRegisterResponse(
            toDetail(vendor), accessToken, refreshToken,
            "Profil vendeur créé. Vos tokens ont été mis à jour avec le rôle VENDOR."
        );
    }

    @Transactional
    public VendorDetailDto updateProfile(UpdateVendorRequest req, UUID userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
            .orElseThrow(() -> new EntityNotFoundException("Profil vendeur introuvable."));

        if (req.name()          != null) vendor.setName(req.name());
        if (req.nameAr()        != null) vendor.setNameAr(req.nameAr());
        if (req.city()          != null) vendor.setCity(req.city());
        if (req.description()   != null) vendor.setDescription(req.description());
        if (req.descriptionAr() != null) vendor.setDescriptionAr(req.descriptionAr());
        if (req.avatarUrl()     != null) vendor.setAvatarUrl(req.avatarUrl());
        if (req.bannerUrl()     != null) vendor.setBannerUrl(req.bannerUrl());

        return toDetail(vendorRepository.save(vendor));
    }

    @Transactional
    public void follow(UUID vendorId, UUID userId) {
        Vendor vendor = vendorRepository.findById(vendorId)
            .orElseThrow(() -> new EntityNotFoundException("Vendeur introuvable."));
        vendor.setFollowerCount(vendor.getFollowerCount() + 1);
        vendorRepository.save(vendor);
    }

    @Transactional
    public void unfollow(UUID vendorId, UUID userId) {
        Vendor vendor = vendorRepository.findById(vendorId)
            .orElseThrow(() -> new EntityNotFoundException("Vendeur introuvable."));
        if (vendor.getFollowerCount() > 0) {
            vendor.setFollowerCount(vendor.getFollowerCount() - 1);
            vendorRepository.save(vendor);
        }
    }

    // ── Helpers ───────────────────────────────────────────────

    private String uniqueSlug(String base) {
        String slug = base;
        int i = 2;
        while (vendorRepository.existsBySlug(slug)) {
            slug = base + "-" + i++;
        }
        return slug;
    }

    private VendorSummaryDto toSummary(Vendor v) {
        return new VendorSummaryDto(
            v.getId(), v.getSlug(), v.getName(), v.getNameAr(),
            v.getCity(), v.getRating(), v.getReviewCount(), v.getProductCount(),
            v.isArtisan(), v.isVerified(), v.getAvatarUrl(), v.getBannerUrl()
        );
    }

    private VendorDetailDto toDetail(Vendor v) {
        return new VendorDetailDto(
            v.getId(), v.getUser().getId(),
            v.getSlug(), v.getName(), v.getNameAr(),
            v.getCity(), v.getDescription(), v.getDescriptionAr(),
            v.getRating(), v.getReviewCount(), v.getProductCount(), v.getFollowerCount(),
            v.isArtisan(), v.isVerified(),
            v.getAvatarUrl(), v.getBannerUrl(), v.getMemberSince()
        );
    }
}
