package ma.soukdigital.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String upload(MultipartFile file, String folder);
    void delete(String publicUrl);
    /** Returns a presigned URL valid for {@code expiryMinutes} minutes. */
    String presign(String storedUrl, int expiryMinutes);
}
