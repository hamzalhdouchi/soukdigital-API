package ma.soukdigital.service;

public interface SmsService {
    void sendOtp(String phone, String code);
}
