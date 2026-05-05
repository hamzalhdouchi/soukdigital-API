package ma.soukdigital.exception;

public class OtpExpiredException extends RuntimeException {
    public OtpExpiredException() {
        super("Code OTP expiré. Veuillez en demander un nouveau.");
    }
}
