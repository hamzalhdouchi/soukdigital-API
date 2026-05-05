package ma.soukdigital.exception;

public class DuplicateReviewException extends RuntimeException {
    public DuplicateReviewException() {
        super("Vous avez déjà laissé un avis pour ce produit.");
    }
}
