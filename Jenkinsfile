pipeline {
    agent any

    environment {
        PROJECT_DIR = '.'
        FRONTEND_DIR = "${PROJECT_DIR}/frontend"
        BACKEND_DIR = "${PROJECT_DIR}/backend"

        // Docker Hub 정보
        DOCKER_HUB_CREDENTIAL_ID = 'dockerhub-cred'
        DOCKER_HUB_USER = 'bonghyerin'

        // Docker 이미지 이름
        DOCKER_FRONTEND_IMAGE = "${DOCKER_HUB_USER}/prham-frontend"
        DOCKER_BACKEND_IMAGE  = "${DOCKER_HUB_USER}/prham-backend"

        // 이미지 태그 (빌드 번호)
        IMAGE_TAG = "${BUILD_NUMBER}"

        // EC2 배포 정보
        EC2_USER = 'ubuntu'
        EC2_HOST = '3.39.246.235'
        EC2_PATH = '/home/ubuntu/app'
        SSH_CREDENTIAL_ID = 'ec2-deploy-key'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '=== Checking out code from GitLab ==='
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                echo '=== Building Backend (Gradle) ==='
                dir(BACKEND_DIR) {
                    script {
                        if (fileExists('./gradlew')) {
                            sh 'chmod +x ./gradlew'
                            sh './gradlew clean build -x test'
                        } else {
                            error "gradlew not found!"
                        }
                    }
                }
                echo '✅ Backend 빌드 완료!'
            }
        }

        stage('Build Frontend') {
            steps {
                echo '=== Building Frontend (npm) ==='
                script {
                    // ✅ NodeJS Plugin 환경 경로 추가
                    def nodeHome = tool name: 'NodeJS-LTS', type: 'NodeJSInstallation'
                    env.PATH = "${nodeHome}/bin:${env.PATH}"
                }
                dir(FRONTEND_DIR) {
                    sh 'npm install'
                    sh 'npm run build'
                }
                echo '✅ Frontend 빌드 완료!'
            }
        }

        stage('Build Docker Images') {
            steps {
                echo '=== Building Docker Images ==='
                script {
                    dir(BACKEND_DIR) {
                        sh """
                            docker build -t ${DOCKER_BACKEND_IMAGE}:${IMAGE_TAG} .
                            docker tag ${DOCKER_BACKEND_IMAGE}:${IMAGE_TAG} ${DOCKER_BACKEND_IMAGE}:latest
                        """
                    }
                    dir(FRONTEND_DIR) {
                        sh """
                            docker build -t ${DOCKER_FRONTEND_IMAGE}:${IMAGE_TAG} .
                            docker tag ${DOCKER_FRONTEND_IMAGE}:${IMAGE_TAG} ${DOCKER_FRONTEND_IMAGE}:latest
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

        stage('Deploy to EC2 Server') {
            steps {
                echo '=== 🚀 Deploying on EC2 Server (3.39.246.235) ==='
                script {
                    sshagent(credentials: ["${SSH_CREDENTIAL_ID}"]) {
                        sh """
                            ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                                set -e
                                echo "📂 배포 디렉토리 이동 중..."
                                cd ${EC2_PATH} || exit 1

                                echo "🧹 기존 컨테이너 중지 및 정리..."
                                docker compose down || true

                                echo "🪣 최신 이미지 Pull 중..."
                                export IMAGE_TAG=${IMAGE_TAG}
                                docker compose pull

                                echo "🚀 서비스 재시작..."
                                docker compose up -d

                                echo "🧽 불필요한 이미지 정리..."
                                docker image prune -f

                                echo "✅ 배포 완료! 서비스가 http://3.39.246.235:8080 에서 실행 중입니다."
                            '
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
