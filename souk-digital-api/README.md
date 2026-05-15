# Souk Digital API

Spring Boot 3.3 — Moroccan Marketplace Backend

## Requirements

- Java 21 (`C:\Program Files\Java\jdk-21.0.10`)
- Maven 3.9+
- PostgreSQL running on `localhost:5432`
- Redis running on `localhost:6379`

## Run Command

Copy `.env.example` to `.env` and fill in your values, then run:

```bash
# Windows (PowerShell) — set JAVA_HOME to JDK 21 before running
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"
$env:DB_URL     = "jdbc:postgresql://localhost:5432/soukdigital"
$env:DB_USER    = "postgres"
$env:DB_PASSWORD = "your_postgres_password"
$env:REDIS_HOST = "localhost"
$env:REDIS_PORT = "6379"
$env:JWT_SECRET = "your-secret-key"
$env:CORS_ORIGINS = "http://localhost:3000"
mvn spring-boot:run
```

```bash
# Linux / macOS / Git Bash (one-liner with .env loaded)
JAVA_HOME="/c/Program Files/Java/jdk-21.0.10" \
  DB_URL="jdbc:postgresql://localhost:5432/soukdigital" \
  DB_USER="postgres" \
  DB_PASSWORD="your_postgres_password" \
  REDIS_HOST="localhost" REDIS_PORT="6379" REDIS_PASSWORD="" \
  JWT_SECRET="your-secret-key" \
  CORS_ORIGINS="http://localhost:3000" \
  mvn spring-boot:run
```

Server starts at: http://localhost:8080/api  
Swagger UI: http://localhost:8080/api/swagger-ui.html
