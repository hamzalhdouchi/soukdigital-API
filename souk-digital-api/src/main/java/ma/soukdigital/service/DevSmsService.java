package ma.soukdigital.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@Profile("dev")
public class DevSmsService implements SmsService {

    @Override
    public void sendOtp(String phone, String code) {
        log.info(">>> [DEV SMS] OTP for {} : {}", phone, code);
    }
}
