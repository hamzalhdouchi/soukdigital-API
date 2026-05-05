package ma.soukdigital.exception;

public class UnverifiedAccountException extends RuntimeException {
    public UnverifiedAccountException() {
        super("Compte non vérifié. Veuillez confirmer votre numéro de téléphone.");
    }
}
