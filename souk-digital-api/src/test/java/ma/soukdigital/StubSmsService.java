package ma.soukdigital;

import lombok.extern.slf4j.Slf4j;
import ma.soukdigital.service.SmsService;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@Profile("test")
class StubSmsService implements SmsService {

    @Override
    public void sendOtp(String phone, String code) {
        log.info(">>> [TEST SMS] OTP for {} : {}", phone, code);
    }
}
