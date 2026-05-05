package ma.soukdigital.exception;

public class OtpInvalidException extends RuntimeException {
    public OtpInvalidException() {
        super("Code OTP invalide.");
    }
}
