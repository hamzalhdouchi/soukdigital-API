package ma.soukdigital;

import ma.soukdigital.service.StorageService;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Profile("test")
class StubStorageService implements StorageService {

    @Override
    public String upload(MultipartFile file, String folder) {
        return "http://localhost/storage/" + folder + "/stub.jpg";
    }

    @Override
    public void delete(String publicUrl) {}
}
