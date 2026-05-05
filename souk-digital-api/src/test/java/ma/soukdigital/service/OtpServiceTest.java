package ma.soukdigital.service;

import ma.soukdigital.exception.OtpExpiredException;
import ma.soukdigital.exception.OtpInvalidException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OtpServiceTest {

    @Mock StringRedisTemplate    redis;
    @Mock ValueOperations<String, String> valueOps;
    @Mock SmsService             smsService;

    private OtpService otpService;

    private static final String PHONE = "+212600000001";

    @BeforeEach
    void setUp() {
        when(redis.opsForValue()).thenReturn(valueOps);
        otpService = new OtpService(redis, smsService);
    }

    @Test
    void generateAndSend_storesCodeInRedisAndCallsSms() {
        otpService.generateAndSend(PHONE);

        verify(valueOps).set(eq("otp:" + PHONE), anyString(), any());
        verify(smsService).sendOtp(eq(PHONE), anyString());
    }

    @Test
    void verify_withCorrectCode_succeeds() {
        String code = "123456";
        when(valueOps.get("otp:" + PHONE)).thenReturn(code);

        assertThatNoException().isThrownBy(() -> otpService.verify(PHONE, code));
        verify(redis).delete("otp:" + PHONE);
    }

    @Test
    void verify_withWrongCode_throwsOtpInvalidException() {
        when(valueOps.get("otp:" + PHONE)).thenReturn("999999");

        assertThatThrownBy(() -> otpService.verify(PHONE, "000000"))
            .isInstanceOf(OtpInvalidException.class);
    }

    @Test
    void verify_withExpiredCode_throwsOtpExpiredException() {
        when(valueOps.get("otp:" + PHONE)).thenReturn(null);

        assertThatThrownBy(() -> otpService.verify(PHONE, "123456"))
            .isInstanceOf(OtpExpiredException.class);
    }
}
