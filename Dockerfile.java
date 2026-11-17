# Multi-Stage Build for Spring Boot 3 Java 21
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY pom.xml mvnw ./
COPY .mvn .mvn
COPY src src
RUN chmod +x mvnw && ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/retail-ecosystem-1.0.0.jar app.jar
COPY public public
COPY data data
ENV PORT=8080
EXPOSE 8080
CMD ["java", "-jar", "app.jar", "--server.port=${PORT}"]
