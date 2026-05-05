# ── Stage 1: Build ────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Cache dependencies layer separately
COPY pom.xml .
RUN mvn dependency:go-offline -q

COPY src ./src
RUN mvn clean package -DskipTests -q

# ── Stage 2: Runtime ──────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

RUN addgroup -S souk && adduser -S souk -G souk
USER souk

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseContainerSupport"

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
