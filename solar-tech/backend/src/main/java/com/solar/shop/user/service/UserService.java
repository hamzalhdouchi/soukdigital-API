package com.solar.shop.user.service;

import com.solar.shop.common.exception.ResourceNotFoundException;
import com.solar.shop.user.dto.UpdateProfileRequest;
import com.solar.shop.user.dto.UserResponse;
import com.solar.shop.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserResponse getByEmail(String email) {
        return UserResponse.from(
                userRepository.findByEmailAndDeletedAtIsNull(email)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found"))
        );
    }

    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest req) {
        var user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (req.firstName() != null) user.setFirstName(req.firstName());
        if (req.lastName() != null) user.setLastName(req.lastName());
        if (req.phone() != null) user.setPhone(req.phone());
        return UserResponse.from(userRepository.save(user));
    }
}
