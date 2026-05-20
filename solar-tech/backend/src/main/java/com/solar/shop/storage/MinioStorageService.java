package com.solar.shop.storage;

import io.minio.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MinioStorageService {

    private final MinioClient minioClient;

    @Value("${minio.endpoint}")
    private String endpoint;

    @Value("${minio.bucket}")
    private String bucket;

    public String upload(MultipartFile file) throws Exception {
        ensureBucketExists();
        String ext = getExtension(file.getOriginalFilename());
        String objectName = "products/" + UUID.randomUUID() + (ext.isEmpty() ? "" : "." + ext);

        minioClient.putObject(PutObjectArgs.builder()
            .bucket(bucket)
            .object(objectName)
            .stream(file.getInputStream(), file.getSize(), -1)
            .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
            .build());

        return endpoint + "/" + bucket + "/" + objectName;
    }

    public void delete(String url) {
        String prefix = endpoint + "/" + bucket + "/";
        if (url != null && url.startsWith(prefix)) {
            String objectName = url.substring(prefix.length());
            try {
                minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .build());
            } catch (Exception ignored) {
                // Non-fatal: log but don't surface MinIO errors to the client
            }
        }
    }

    private void ensureBucketExists() throws Exception {
        boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
        if (!exists) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
            String policy = """
                {"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":"*","Action":["s3:GetObject"],"Resource":["arn:aws:s3:::%s/*"]}]}
                """.formatted(bucket);
            minioClient.setBucketPolicy(SetBucketPolicyArgs.builder().bucket(bucket).config(policy).build());
        }
    }

    private static String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}
