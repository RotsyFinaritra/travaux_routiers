# Use pre-built JAR file from local target directory
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy the pre-compiled JAR file from local target directory
COPY target/*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
# Use pre-built WAR file from local target directory
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy the pre-compiled JAR file from local target directory
COPY target/*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
