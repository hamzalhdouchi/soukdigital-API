package ma.soukdigital;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
public abstract class AbstractIntegrationTest {

    static final PostgreSQLContainer<?> POSTGRES =
        new PostgreSQLContainer<>(DockerImageName.parse("postgres:16-alpine"))
            .withDatabaseName("soukdigital_test")
            .withUsername("postgres")
            .withPassword("postgres");

    @SuppressWarnings("resource")
    static final GenericContainer<?> REDIS =
        new GenericContainer<>(DockerImageName.parse("redis:7-alpine"))
            .withExposedPorts(6379);

    static {
        POSTGRES.start();
        REDIS.start();
    }

    @DynamicPropertySource
    static void overrideProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url",      POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("spring.data.redis.host",     REDIS::getHost);
        registry.add("spring.data.redis.port",     () -> REDIS.getMappedPort(6379));
        registry.add("spring.mail.host",            () -> "localhost");
        registry.add("spring.mail.port",            () -> "3025");
        registry.add("storage.access-key",          () -> "test");
        registry.add("storage.secret-key",          () -> "test-secret-key-minimum-32chars");
        registry.add("storage.public-url",          () -> "http://localhost/storage");
    }
}
