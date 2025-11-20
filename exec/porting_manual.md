# **1. 개요 (Overview)**

편리햄(Pyeonriham)은 **Mattermost 기반 공지 수집·요약·검색·대시보드화 서비스**로, 단일 AWS EC2 환경에서 **Docker Compose 기반**으로 운영된다.

CI/CD는 Jenkins를 이용하여 구축했으며, 본 문서는 서비스 운영을 위한 서버 구성, 환경 변수, 배포 절차, CI/CD 파이프라인을 기술하며, **모든 민감 정보는 {MASKED} 처리**하였다.

---

# **2. 시스템 아키텍처 (System Architecture)**

- **AWS EC2 (Ubuntu 24.04 LTS)**
- **Nginx Reverse Proxy (SSL/TLS Termination)**
- **Frontend (React + Vite, Docker Image)**
- **Backend (Spring Boot, Docker Image)**
- **MySQL 8.x**
- **Redis 7.x**
- **MongoDB 7.x**
- **Meilisearch 1.x**
- **Jenkins (CI/CD)**
- **LLM API 기반 텍스트 요약 및 메타데이터 추출**

전체 구성은 다음과 같이 이루어진다:

```
Client → HTTPS → Nginx → (Frontend / Backend)
                     ↓
                Docker Compose
      (MySQL, Redis, MongoDB, Meilisearch, Jenkins)

```

Blue/Green 구조를 통해 서비스 중단 없이 교체 배포가 가능하다.

---

# **3. 서버 초기 설정 (Server Initialization)**

## 3.1. 기본 패키지 업데이트

```bash
sudo timedatectl set-timezone Asia/Seoul
sudo apt update -y
sudo apt upgrade -y
```

## 3.2. Swap 비활성화

```bash
sudo swapoff -a
sudo sed -i '/ swap / s/^/#/' /etc/fstab
```

---

# **4. Docker 및 Docker Compose 설치**

## 4.1. Docker 설치

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
sudo systemctl restart docker
```

## 4.2. Docker Compose 설치

```bash
sudo curl -L \
"https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" \
-o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

---

# **5. Nginx Reverse Proxy & SSL 설정**

## 5.1. Nginx 설치

```bash
sudo apt install nginx -y
```

## 5.2. HTTPS 인증서 발급 (Let’s Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx \
  -d pyeonriham.site \
  -d www.pyeonriham.site
```

## 5.3. Nginx 설정 파일 (요약)

```
server {
    listen 443 ssl;
    server_name pyeonriham.site www.pyeonriham.site;

    ssl_certificate /etc/letsencrypt/live/pyeonriham.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pyeonriham.site/privkey.pem;

    location / {
        proxy_pass http://frontend-blue;
    }

    location /api/ {
        proxy_pass http://backend-blue;
    }
}
```

※ Blue/Green 교체는 upstream 블록의 service name 변경으로 수행한다.

---

# **6. Docker Compose 구성**

## 6.1. 프로젝트 구조

```
/deploy
 ├── docker-compose-infra.yml
 ├── docker-compose-jenkins.yml
 ├── docker-compose-mattermost.yml
 ├── docker-compose.yml
 ├── nginx.conf
 └── Dockerfile.jenkins
```

## 6.2. docker-compose.yml (민감정보 마스킹)

```yaml
services:
  backend:
    image: bonghyerin/pyeonriham-be:latest
    container_name: pyeonriham-backend
    env_file:
      - .env.prod

  nginx:
    image: bonghyerin/pyeonriham-fe:latest
    container_name: app-nginx
    env_file:
      - .env.prod
```

---

# **7. Backend 환경 변수 (.env.prod)**

```
SERVER_PORT=8080
SPRING_APPLICATION_NAME=prham

# MySQL Database
SPRING_DATASOURCE_DRIVER_CLASS_NAME=com.mysql.cj.jdbc.Driver
SPRING_DATASOURCE_URL=jdbc:mysql://pyeonriham-mysql:3306/pyeonriham_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&characterEncoding=UTF-8&useUnicode=true
SPRING_DATASOURCE_USERNAME={MASKED}
SPRING_DATASOURCE_PASSWORD={MASKED}

# Connection Pool
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=10
SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=5
SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT=30000
SPRING_DATASOURCE_HIKARI_IDLE_TIMEOUT=600000
SPRING_DATASOURCE_HIKARI_MAX_LIFETIME=1800000

# Redis
SPRING_DATA_REDIS_HOST=pyeonriham-redis
SPRING_DATA_REDIS_PORT=6379

# MongoDB
SPRING_DATA_MONGODB_URI=mongodb://pyeonriham-mongo:27017/pyeonriham_db

# Meilisearch
MEILISEARCH_HOST=http://meilisearch:7700
MEILISEARCH_API_KEY={MASKED}
LLM_API_KEY={MASKED}
SPRING_JPA_HIBERNATE_DDL_AUTO: update
SPRING_SQL_INIT_MODE: always
MATTERMOST_WEBHOOK_CHANNEL: notice,announcement
MATTERMOST_WEBHOOK_URL: https://pyeonriham.site/api/v1/mattermost/webhook
MATTERMOST_API_URL: http://pyeonriham.site:8065
MATTERMOST_API_BASE_URL: http://pyeonriham.site:8065
MATTERMOST_WEBHOOK_TOKEN: {MASKED}
```

모든 인증 키는 Jenkins Credential Store에서 관리한다.

---

# **8. Jenkins CI/CD 파이프라인**

## 8.1. Jenkins 컨테이너 실행

```bash
docker run -d --restart always \
  -p 8080:8080 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /jenkins:/var/jenkins_home \
  --name pyeonriham-jenkins \
  jenkins/jenkins:jdk17

```

## 8.2. Pipeline Script

```groovy
pipeline {
    agent any

    tools {
        nodejs 'NodeJS-18'
    }

    environment {
        PROJECT_DIR = '.'
        FRONTEND_DIR = "${PROJECT_DIR}/frontend"
        BACKEND_DIR = "${PROJECT_DIR}/backend"

        // ✅ Docker Hub 정보
        DOCKER_HUB_CREDENTIAL_ID = 'dockerhub-jenkins'
        DOCKER_HUB_USER = 'bonghyerin'

        // ✅ 새 이미지명
        DOCKER_FRONTEND_IMAGE = "${DOCKER_HUB_USER}/pyeonriham-fe"
        DOCKER_BACKEND_IMAGE  = "${DOCKER_HUB_USER}/pyeonriham-be"

        IMAGE_TAG = "${BUILD_NUMBER}"

        // ✅ 배포 서버 정보
        EC2_USER = 'ubuntu'
        EC2_HOST = '3.39.246.235'
        EC2_PATH = '/home/ubuntu/deploy'
        SSH_CREDENTIAL_ID = 'ec2-deploy-key'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '=== Checking out code from GitLab ==='
                git branch: 'release',
                    credentialsId: 'gitlab-token',
                    url: 'https://lab.ssafy.com/s13-final/S13P31A105.git'
            }
        }

        stage('Build Backend') {
            steps {
                echo '=== Building Backend (Gradle) ==='
                dir(BACKEND_DIR) {
                    sh '''
                        chmod +x ./gradlew
                        ./gradlew clean build -x test
                    '''
                }
                echo '✅ Backend 빌드 완료!'
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    echo '=== Building Frontend (React + Vite) ==='

                    dir('frontend') {
                        sh """
                            docker build \
                              --build-arg VITE_SSO_CLIENT_ID=1292a035-be8b-4e8d-919c-0898c6b957c5 \
                              --build-arg VITE_SSO_REDIRECT_URI=https://pyeonriham.site/callback \
                              --build-arg VITE_API_BASE_URL=https://pyeonriham.site/api \
                              --build-arg VITE_MATTERMOST_FILE_TOKEN=wq6fk8f7yp817nfzo5fiaraqph \
                              --build-arg VITE_MATTERMOST_URL=http://pyeonriham.site:8065 \
                              -t bonghyerin/pyeonriham-fe:latest \
                              -t bonghyerin/pyeonriham-fe:${BUILD_NUMBER} \
                              .
                        """
                    }

                    echo '✅ Frontend Docker 이미지 빌드 완료!'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo '=== Building Backend Docker Image ==='
                script {
                    dir(BACKEND_DIR) {
                        sh """
                            docker build -t ${DOCKER_BACKEND_IMAGE}:${IMAGE_TAG} .
                            docker tag ${DOCKER_BACKEND_IMAGE}:${IMAGE_TAG} ${DOCKER_BACKEND_IMAGE}:latest
                        """
                    }
                }
                echo '✅ Docker 이미지 빌드 완료!'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo '=== Pushing Images to Docker Hub ==='
                withCredentials([usernamePassword(credentialsId: "${DOCKER_HUB_CREDENTIAL_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push ${DOCKER_BACKEND_IMAGE}:${IMAGE_TAG}
                        docker push ${DOCKER_BACKEND_IMAGE}:latest
                        docker push ${DOCKER_FRONTEND_IMAGE}:${IMAGE_TAG}
                        docker push ${DOCKER_FRONTEND_IMAGE}:latest
                        docker logout
                    """
                }
                echo '✅ Docker Hub 푸시 완료!'
            }
        }

        stage('Cleanup Local Images') {
            steps {
                echo '=== 🧹 Jenkins 서버 이미지 정리 ==='
                sh """
                    docker rmi ${DOCKER_BACKEND_IMAGE}:${IMAGE_TAG} || true
                    docker rmi ${DOCKER_FRONTEND_IMAGE}:${IMAGE_TAG} || true
                    docker image prune -f
                    echo '✅ Jenkins 서버 이미지 정리 완료!'
                """
            }
        }

        stage('Deploy to EC2 Server') {
            steps {
                echo '=== 🚀 Deploying on EC2 Server (3.39.246.235) ==='
                script {
                    sshagent(credentials: ["${SSH_CREDENTIAL_ID}"]) {
                        sh """
                            ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} "
                                set -e
                                cd ${EC2_PATH} || exit 1
                                docker compose down || true
                                export IMAGE_TAG=${IMAGE_TAG}
                                docker compose pull
                                docker compose up -d
                                docker image prune -f
                                echo '✅ 배포 완료! https://pyeonriham.site'
                            "
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo '🎉 전체 파이프라인 성공! 서비스 배포 완료!'
        }
        failure {
            echo '❌ Pipeline 실패! 로그를 확인하세요.'
        }
    }
}
```

---

# **10. 데이터베이스 초기 세팅**

## 10.1. MySQL

```bash
docker exec -it pyeonriham-mysql mysql -u root -p
CREATE USER 'pyeonriham_user'@'%' IDENTIFIED BY '{MASKED}';
GRANT ALL PRIVILEGES ON pyeonriham_db.* TO 'pyeonriham_user'@'%';
```

## 10.2. MongoDB

```bash
docker exec -it mongo mongosh -u root -p {MASKED}
```

## 10.3. Redis

```bash
docker exec -it redis redis-cli -a {MASKED}
```

---

# **11. Meilisearch 실행**

마스터 키는 전부 `{MASKED}` 처리하며 Jenkins Credential Store 또는 EC2 환경변수로 관리한다.

---

# **12. 보안 정책**

- 모든 민감 정보는 문서 내 `{MASKED}` 처리
- Jenkins Credential Store 이용
- EC2 보안그룹
  - 80/443만 외부 오픈
  - DB/Mongo/Redis는 모두 내부 통신 전용
- HTTPS 강제 적용
- SSH 접근은 key 기반 + IPv4 제한

---

# **13. Troubleshooting**

| 문제                         | 원인                  | 해결                                  |
| ---------------------------- | --------------------- | ------------------------------------- |
| Jenkins에서 Docker 권한 오류 | docker.sock 권한 문제 | `sudo chmod 666 /var/run/docker.sock` |
| Blue/Green 전환 안됨         | upstream 변경 누락    | `nginx -s reload` 수행                |
| 프론트 화면 X                | 이미지 태그 미반영    | Jenkins sed 적용 확인                 |
| 공지 수집 안됨               | SSE Webhook 인증 문제 | 백엔드 환경변수 재확인                |

---

# **14. 부록 (Appendix)**

- 전체 폴더 구조
- 주요 스크립트 (apply.sh 등)
- env 예시 파일 (마스킹 버전)

---
