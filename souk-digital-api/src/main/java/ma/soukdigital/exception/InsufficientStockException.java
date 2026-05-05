package ma.soukdigital.exception;

public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String productName, int available) {
        super("Stock insuffisant pour \"" + productName + "\" — disponible : " + available);
    }
}
