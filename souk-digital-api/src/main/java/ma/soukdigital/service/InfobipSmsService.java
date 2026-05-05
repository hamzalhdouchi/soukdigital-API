package ma.soukdigital.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@Profile("!dev")
public class InfobipSmsService implements SmsService {

    @Value("${infobip.base-url:}")
    private String baseUrl;

    @Value("${infobip.api-key:}")
    private String apiKey;

    @Value("${infobip.sender:SoukDigital}")
    private String sender;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void sendOtp(String phone, String code) {
        if (baseUrl == null || baseUrl.isBlank() || apiKey == null || apiKey.isBlank()) {
            log.warn("Infobip not configured — OTP for {} skipped (code={})", phone, code);
            return;
        }

        String url  = baseUrl.replaceAll("/+$", "") + "/sms/2/text/advanced";
        String text = "Votre code Souk Digital : " + code + ". Valide 5 min.";

        Map<String, Object> body = Map.of(
            "messages", List.of(Map.of(
                "from",         sender,
                "destinations", List.of(Map.of("to", phone)),
                "text",         text
            ))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "App " + apiKey);

        try {
            ResponseEntity<String> resp = restTemplate.exchange(
                url, HttpMethod.POST, new HttpEntity<>(body, headers), String.class);
            log.debug("Infobip response: {}", resp.getStatusCode());
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", phone, e.getMessage());
        }
    }
}
