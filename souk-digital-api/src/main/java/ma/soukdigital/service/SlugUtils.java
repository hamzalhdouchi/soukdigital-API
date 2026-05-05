package ma.soukdigital.service;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public final class SlugUtils {

    private static final Pattern NON_ASCII = Pattern.compile("[^\\w-]");
    private static final Pattern DASHES    = Pattern.compile("-{2,}");

    private SlugUtils() {}

    public static String slugify(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
            .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return DASHES.matcher(
            NON_ASCII.matcher(
                normalized.toLowerCase(Locale.ROOT).trim().replace(" ", "-")
            ).replaceAll("")
        ).replaceAll("-");
    }
}
