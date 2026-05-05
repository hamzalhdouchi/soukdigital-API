package ma.soukdigital.dto;

import java.util.UUID;

public record BuyerDto(UUID id, String firstName, String lastName, String phone) {}
