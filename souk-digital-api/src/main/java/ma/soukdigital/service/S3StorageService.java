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

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@Profile("!test")
public class S3StorageService implements StorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
        "image/jpeg", "image/png", "image/webp"
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

    @PostConstruct
    void init() {
        if (accessKey == null || accessKey.isBlank() || secretKey == null || secretKey.isBlank()) {
            log.warn("S3 credentials not configured — file upload disabled (set STORAGE_ACCESS_KEY / STORAGE_SECRET_KEY to enable)");
            return;
        }
        S3ClientBuilder builder = S3Client.builder()
            .region(Region.of(region))
            .credentialsProvider(StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey)));

        if (endpoint != null && !endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint));
        }

        s3 = builder.build();
        log.info("S3StorageService initialised — bucket={} region={}", bucket, region);
    }

    @Override
    public String upload(MultipartFile file, String folder) {
        if (s3 == null) {
            throw new IllegalStateException("File upload is not configured (S3 credentials missing)");
        }
        validate(file);

        byte[] data = resize(file);
        String key  = buildKey(folder, file.getOriginalFilename());

        PutObjectRequest req = PutObjectRequest.builder()
            .bucket(bucket)
            .key(key)
            .contentType(file.getContentType())
            .contentLength((long) data.length)
            .build();

        s3.putObject(req, RequestBody.fromBytes(data));

        return publicUrl.replaceAll("/+$", "") + "/" + key;
    }

    @Override
    public void delete(String url) {
        if (s3 == null || url == null || url.isBlank()) return;
        String prefix = publicUrl.replaceAll("/+$", "") + "/";
        if (!url.startsWith(prefix)) return;

        String key = url.substring(prefix.length());
        s3.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
        log.debug("Deleted S3 object: {}", key);
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
        return switch (contentType) {
            case "image/png"  -> "png";
            case "image/webp" -> "webp";
            default           -> "jpg";
        };
    }

    private String buildKey(String folder, String originalName) {
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf('.'));
        }
        String dir = (folder == null || folder.isBlank()) ? "uploads" : folder.replaceAll("^/+|/+$", "");
        return dir + "/" + UUID.randomUUID() + ext;
    }
}
