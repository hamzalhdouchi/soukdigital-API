package ma.soukdigital.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.soukdigital.service.StorageService;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
@Tag(name = "Upload", description = "Image upload to S3-compatible storage")
@SecurityRequirement(name = "bearerAuth")
public class UploadController {

    private static final String PRODUCT_FOLDER  = "products";
    private static final int    MAX_BATCH       = 8;
    private static final int    PRESIGN_MINUTES = 60;

    private final StorageService storageService;

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('VENDOR','ADMIN')")
    @Operation(summary = "Upload a single product image")
    public Map<String, String> uploadImage(
            @RequestPart("file") MultipartFile file) {
        String url = storageService.upload(file, PRODUCT_FOLDER);
        return Map.of("url", url);
    }

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('VENDOR','ADMIN')")
    @Operation(summary = "Upload up to 8 product images")
    public Map<String, List<String>> uploadImages(
            @RequestPart("files") List<MultipartFile> files) {
        if (files.size() > MAX_BATCH) {
            throw new IllegalArgumentException("Maximum " + MAX_BATCH + " images per upload");
        }
        List<String> urls = files.stream()
            .map(f -> storageService.upload(f, PRODUCT_FOLDER))
            .toList();
        return Map.of("urls", urls);
    }

    @GetMapping("/presign")
    @Operation(summary = "Generate a presigned URL for a private object (valid 60 min)")
    public Map<String, String> presign(@RequestParam String url) {
        return Map.of("url", storageService.presign(url, PRESIGN_MINUTES));
    }

    @PostMapping("/presign/batch")
    @Operation(summary = "Generate presigned URLs for multiple objects (valid 60 min)")
    public Map<String, List<String>> presignBatch(@RequestBody List<String> urls) {
        List<String> signed = urls.stream()
            .map(u -> storageService.presign(u, PRESIGN_MINUTES))
            .collect(Collectors.toList());
        return Map.of("urls", signed);
    }
}
