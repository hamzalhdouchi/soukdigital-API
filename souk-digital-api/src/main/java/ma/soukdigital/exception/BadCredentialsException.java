package ma.soukdigital.exception;

public class BadCredentialsException extends RuntimeException {
    public BadCredentialsException() {
        super("Email/téléphone ou mot de passe incorrect.");
    }
}
