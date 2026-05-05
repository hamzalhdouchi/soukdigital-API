package ma.soukdigital.dto;

public record VendorRegisterResponse(
    VendorDetailDto vendor,
    String accessToken,
    String refreshToken,
    String message
) {}
