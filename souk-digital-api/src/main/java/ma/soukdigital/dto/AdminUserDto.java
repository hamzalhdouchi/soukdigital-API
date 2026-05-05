package ma.soukdigital.dto;

import ma.soukdigital.entity.Role;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AdminUserDto(
    UUID           id,
    String         firstName,
    String         lastName,
    String         email,
    String         phone,
    Role           role,
    boolean        verified,
    String         avatarUrl,
    OffsetDateTime createdAt
) {}
