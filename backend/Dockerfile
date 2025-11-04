FROM openjdk:17-jdk-slim AS builder

WORKDIR /app

COPY build.gradle settings.gradle gradlew ./
COPY gradle gradle

COPY src src

RUN chmod +x gradlew && ./gradlew bootJar

FROM openjdk:17-slim

WORKDIR /app

ENV TZ=Asia/Seoul

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]