package ma.soukdigital.dto;

import java.util.UUID;

public record CategoryStatDto(UUID id, String name, long orderCount) {}
