package ma.soukdigital.dto;

import ma.soukdigital.entity.Role;

import java.util.UUID;

public record UserDto(
    UUID id,
    String firstName,
    String lastName,
    String email,
    String phone,
    Role role,
    boolean isVerified,
    String avatarUrl
) {}
