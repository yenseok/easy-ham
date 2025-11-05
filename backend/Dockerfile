
FROM eclipse-temurin:17-jdk-jammy AS builder

WORKDIR /app

# Gradle Wrapper 및 설정 파일 복사
COPY build.gradle settings.gradle gradlew ./
COPY gradle gradle

# 소스 코드 복사
COPY src src

# Gradlew 실행 권한 부여 및 빌드
RUN chmod +x gradlew && ./gradlew bootJar



FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# 타임존 설정
ENV TZ=Asia/Seoul

# 빌드 결과물(JAR) 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 헬스체크 
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
