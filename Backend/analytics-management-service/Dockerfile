# ---------------- Stage 1: Build ----------------
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml .

RUN mvn dependency:go-offline -B

# Copy full project
COPY . .

# Build the Spring Boot JAR
RUN mvn clean package -DskipTests


# ---------------- Stage 2: Runtime ----------------
FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

# Copy only the built JAR from builder
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 4009

ENV SPRING_PROFILES_ACTIVE=prod

CMD ["java", "-jar", "app.jar"]