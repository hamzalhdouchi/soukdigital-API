package ma.soukdigital.dto;

import java.util.Map;

public record CmiInitResponse(
    String paymentUrl,
    Map<String, String> params
) {}
