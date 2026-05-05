package ma.soukdigital.entity;

public enum Badge {
    artisan, sale, new_, top, flash;

    public static Badge fromString(String value) {
        if (value == null) return null;
        return switch (value.toLowerCase()) {
            case "new" -> new_;
            default -> Badge.valueOf(value.toLowerCase());
        };
    }
}


