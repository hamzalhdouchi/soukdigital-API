package ma.soukdigital.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.*;
import ma.soukdigital.service.AuthService;
import ma.soukdigital.service.OtpService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, OTP verification, login")
public class AuthController {

    private final AuthService authService;
    private final OtpService  otpService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create account and send OTP")
    public RegisterResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP and activate account")
    public AuthResponse verifyOtp(@Valid @RequestBody OtpVerifyRequest req) {
        return authService.verifyOtp(req);
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email/phone + password")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Get new access token from refresh token")
    public ResponseEntity<Map<String, String>> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "refreshToken requis."));
        }
        String newToken = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(Map.of("accessToken", newToken));
    }

    @PostMapping("/resend-otp")
    @Operation(summary = "Resend OTP to phone number")
    public ResponseEntity<Map<String, String>> resendOtp(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        if (phone == null || phone.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "phone requis."));
        }
        otpService.generateAndSend(phone);
        return ResponseEntity.ok(Map.of("message", "OTP renvoyé au " + phone));
    }
}
