package ma.soukdigital.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.soukdigital.exception.OtpExpiredException;
import ma.soukdigital.exception.OtpInvalidException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private static final String OTP_PREFIX = "otp:";
    private static final Duration OTP_TTL  = Duration.ofMinutes(5);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final StringRedisTemplate redis;
    private final SmsService          smsService;

    public void generateAndSend(String phone) {
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        redis.opsForValue().set(OTP_PREFIX + phone, code, OTP_TTL);
        smsService.sendOtp(phone, code);
    }

    public void verify(String phone, String code) {
        String stored = redis.opsForValue().get(OTP_PREFIX + phone);
        if (stored == null) {
            throw new OtpExpiredException();
        }
        if (!stored.equals(code)) {
            throw new OtpInvalidException();
        }
        redis.delete(OTP_PREFIX + phone);
    }
}
