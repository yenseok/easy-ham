# 📘 **편리햄 Porting Manual**

## **1. 개요 (Overview)**

편리햄(Pyeonriham)은 **Mattermost 기반 공지 수집·요약·검색·대시보드화 서비스**로, 단일 AWS EC2 환경에서 **Docker Compose 기반**으로 운영된다.
CI/CD는 Jenkins를 사용해 자동화했으며, 본 문서는 서버 구성, 환경 변수, 배포 절차, CI/CD 파이프라인을 기술한다.
모든 민감 정보는 `{MASKED}` 처리하였다.

---

## **2. 시스템 아키텍처 (System Architecture)**

* AWS EC2 (Ubuntu 24.04 LTS)
* Nginx Reverse Proxy
* React/Vite Frontend
* Spring Boot Backend
* MySQL / Redis / MongoDB / Meilisearch
* Jenkins CI/CD
* LLM 기반 텍스트 요약·메타데이터 추출

구성 흐름:

```
Client → HTTPS → Nginx → (Frontend / Backend)
                     ↓
                Docker Compose
      (MySQL, Redis, MongoDB, Meilisearch, Jenkins)
```


---

## **3. 서버 초기 설정 (Server Initialization)**

### 3.1. 패키지 업데이트

```bash
sudo timedatectl set-timezone Asia/Seoul
sudo apt update -y
sudo apt upgrade -y
```

### 3.2. Swap 비활성화

```bash
sudo swapoff -a
sudo sed -i '/ swap / s/^/#/' /etc/fstab
```

---

## **4. Docker 및 Docker Compose 설치**

### 4.1. Docker 설치

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
sudo systemctl restart docker
```

### 4.2. Docker Compose 설치

```bash
sudo curl -L \
"https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" \
-o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

---

## **5. Nginx Reverse Proxy & HTTPS 구성**

### 5.1. Nginx 설치

```bash
sudo apt install nginx -y
```

### 5.2. 인증서 발급

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d pyeonriham.site -d www.pyeonriham.site
```

### 5.3. Nginx 설정 요약

#### (1) HTTPS 기본 설정

* Let’s Encrypt SSL 적용
* TLS 1.2/1.3 + HTTP/2 활성화
* access/error 로그 분리

#### (2) SSE(Server-Sent Events) 전용 Proxy 설정

* `/api/notifications/stream`, `/api/v1/notifications/stream`
* proxy_buffering off
* proxy_cache off
* proxy_read_timeout 86400s

#### (3) 인증 URL 리라이트

* `/api/auth/* → /api/v1/auth/*`
* 인증 API 라우팅 통일

#### (4) `/api/v1` 전체 백엔드 프록시

* 모든 API → `pyeonriham-backend:8080` 전달
* 타임아웃 및 버퍼링 off

#### (5) React SPA 정적 파일 + 캐싱

* `try_files ... /index.html`
* 정적 파일 1년 캐싱
* index.html만 캐시 No

#### (6) HTTP → HTTPS 리다이렉트

* ACME challenge 예외 처리
* 모든 요청을 HTTPS로 강제

---

## **6. Docker Compose 구성**

### 6.1. 디렉토리 구조

```
/deploy
 ├── docker-compose-infra.yml
 ├── docker-compose-jenkins.yml
 ├── docker-compose-mattermost.yml
 ├── docker-compose.yml
 ├── nginx.conf
 └── Dockerfile.jenkins
```

### 6.2. docker-compose.yml 요약

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

## **7. Backend 환경 변수 (.env.prod)**

---

## **8. Jenkins CI/CD 파이프라인**

### 8.1. Jenkins 컨테이너 실행

```bash
docker run -d --restart always \
  -p 8080:8080 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /jenkins:/var/jenkins_home \
  --name pyeonriham-jenkins \
  jenkins/jenkins:jdk17
```

### 8.2. Jenkins Pipeline Script

```
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

## **9. 데이터베이스 초기 세팅**

### 9.1. MySQL

```bash
CREATE USER 'pyeonriham_user'@'%' IDENTIFIED BY '{MASKED}';
GRANT ALL PRIVILEGES ON pyeonriham_db.* TO 'pyeonriham_user'@'%';
```

### 9.2. MongoDB

```bash
docker exec -it mongo mongosh -u root -p {MASKED}
```

### 9.3. Redis

```bash
docker exec -it redis redis-cli -a {MASKED}
```

---

## **10. Meilisearch 실행**

Master Key 및 ENV는 전부 `{MASKED}` 처리.
Credential Store 또는 EC2 환경변수에서 관리.

---

## **11. 보안 정책**

* 모든 민감 정보 `{MASKED}`
* Jenkins Credential Store 활용
* EC2 보안 그룹 최소 오픈

  * 443 / 80 외 전부 내부 통신
* HTTPS 강제
* SSH key + IP 제한

---

## **12. Troubleshooting**

| 문제                   | 원인                           | 해결                               |
| -------------------- | ---------------------------- | -------------------------------- |
| Jenkins Docker 권한 오류 | `/var/run/docker.sock` 권한 문제 | `chmod 666 /var/run/docker.sock` |
| 프론트 화면 X             | 최신 이미지 반영 X                  | Jenkins 이미지 태그 확인                |
| 공지 수집 실패             | SSE 인증/토큰 오류                 | Backend ENV 재확인                  |

---

