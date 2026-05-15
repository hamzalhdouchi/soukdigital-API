package ma.soukdigital.service;

import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.time.Duration;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@Profile("!test")
public class S3StorageService implements StorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
        "image/jpeg", "image/png"
    );
    private static final int MAX_DIMENSION = 1200;

    @Value("${storage.bucket}")
    private String bucket;

    @Value("${storage.region}")
    private String region;

    @Value("${storage.endpoint:}")
    private String endpoint;

    @Value("${storage.access-key:}")
    private String accessKey;

    @Value("${storage.secret-key:}")
    private String secretKey;

    @Value("${storage.public-url}")
    private String publicUrl;

    @Value("${storage.max-file-size-mb:5}")
    private int maxFileSizeMb;

    private S3Client s3;
    private S3Presigner presigner;

    @PostConstruct
    void init() {
        if (accessKey == null || accessKey.isBlank() || secretKey == null || secretKey.isBlank()) {
            log.warn("S3 credentials not configured — file upload disabled (set STORAGE_ACCESS_KEY / STORAGE_SECRET_KEY to enable)");
            return;
        }
        var creds = StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey));
        var reg   = Region.of(region);

        S3ClientBuilder builder = S3Client.builder()
            .region(reg)
            .credentialsProvider(creds)
            .forcePathStyle(true); // required for MinIO

        S3Presigner.Builder presignerBuilder = S3Presigner.builder()
            .region(reg)
            .credentialsProvider(creds);

        if (endpoint != null && !endpoint.isBlank()) {
            URI uri = URI.create(endpoint);
            builder.endpointOverride(uri);
            presignerBuilder.endpointOverride(uri);
        }

        s3        = builder.build();
        presigner = presignerBuilder.build();
        log.info("S3StorageService initialised — bucket={} endpoint={}", bucket, endpoint);
    }

    @Override
    public String upload(MultipartFile file, String folder) {
        if (s3 == null) {
            throw new IllegalStateException("File upload is not configured (S3 credentials missing)");
        }
        validate(file);

        byte[] data        = resize(file);
        String key         = buildKey(folder, file.getContentType());
        String contentType = outputContentType(file.getContentType());

        PutObjectRequest req = PutObjectRequest.builder()
            .bucket(bucket)
            .key(key)
            .contentType(contentType)
            .contentLength((long) data.length)
            .build();

        s3.putObject(req, RequestBody.fromBytes(data));

        return publicUrl.replaceAll("/+$", "") + "/" + key;
    }

    @Override
    public void delete(String url) {
        if (s3 == null || url == null || url.isBlank()) return;
        String key = extractKey(url);
        if (key == null) return;
        s3.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
        log.debug("Deleted object: {}", key);
    }

    @Override
    public String presign(String storedUrl, int expiryMinutes) {
        if (presigner == null || storedUrl == null || storedUrl.isBlank()) return storedUrl;
        String key = extractKey(storedUrl);
        if (key == null) return storedUrl;

        GetObjectPresignRequest req = GetObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(expiryMinutes))
            .getObjectRequest(GetObjectRequest.builder().bucket(bucket).key(key).build())
            .build();

        return presigner.presignGetObject(req).url().toString();
    }

    // ── Helpers ───────────────────────────────────────────────

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        long maxBytes = (long) maxFileSizeMb * 1024 * 1024;
        if (file.getSize() > maxBytes) {
            throw new IllegalArgumentException("File exceeds " + maxFileSizeMb + " MB limit");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Only JPEG, PNG and WebP images are accepted");
        }
    }

    private byte[] resize(MultipartFile file) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Thumbnails.of(file.getInputStream())
                .size(MAX_DIMENSION, MAX_DIMENSION)
                .keepAspectRatio(true)
                .outputFormat(outputFormat(file.getContentType()))
                .toOutputStream(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalArgumentException("Could not process image: " + e.getMessage(), e);
        }
    }

    private String outputFormat(String contentType) {
        return "image/png".equals(contentType) ? "png" : "jpg";
    }

    private String outputExtension(String contentType) {
        return "image/png".equals(contentType) ? ".png" : ".jpg";
    }

    private String outputContentType(String contentType) {
        return "image/png".equals(contentType) ? "image/png" : "image/jpeg";
    }

    private String buildKey(String folder, String contentType) {
        String dir = (folder == null || folder.isBlank()) ? "uploads" : folder.replaceAll("^/+|/+$", "");
        return dir + "/" + UUID.randomUUID() + outputExtension(contentType);
    }

    /** Extracts the object key from a stored URL (strips the publicUrl prefix). */
    private String extractKey(String url) {
        String prefix = publicUrl.replaceAll("/+$", "") + "/";
        if (!url.startsWith(prefix)) return null;
        return url.substring(prefix.length());
    }
}
