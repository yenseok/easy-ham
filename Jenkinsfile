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
        EC2_PATH = '/home/ubuntu/app/release'
        SSH_CREDENTIAL_ID = 'ec2-deploy-key'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '=== Checking out code from GitLab ==='
                git branch: 'release',
                    credentialsId: 'gitlab-api-token',
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
                echo '=== Building Frontend (npm) ==='
                dir(FRONTEND_DIR) {
                    sh '''
                        npm install
                        npm run build
                    '''
                }
                echo '✅ Frontend 빌드 완료!'
            }
        }

        stage('Build Docker Images') {
            steps {
                echo '=== Building Docker Images ==='
                script {
                    sh """
                        echo '🗑️  이전 이미지 삭제 중...'
                        docker rmi ${DOCKER_BACKEND_IMAGE}:latest || true
                        docker rmi ${DOCKER_FRONTEND_IMAGE}:latest || true
                    """
                    
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
