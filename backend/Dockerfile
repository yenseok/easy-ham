# ---- Build stage ----
FROM gradle:8.7-jdk17 AS builder
WORKDIR /app

# Gradle 캐시 최적화
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
COPY gradlew gradlew.bat ./
RUN chmod +x gradlew

# 소스 복사 후 빌드
COPY src ./src
# 테스트는 컨테이너 빌드 속도 위해 스킵 (필요하면 제거)
RUN ./gradlew clean bootJar -x test

# ---- Run stage ----
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# 보안상 비루트
RUN useradd -m spring && chown -R spring /app
USER spring

# 빌드 결과 JAR 복사
COPY --from=builder /app/build/libs/*.jar /app/app.jar

# 필요 시 JVM 옵션 주입
ENV JAVA_OPTS=""

EXPOSE 8080
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
