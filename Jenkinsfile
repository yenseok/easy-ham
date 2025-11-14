pipeline {
    agent any

    tools {
        nodejs 'NodeJS-18'
    }

    environment {
        PROJECT_DIR = '.'
        FRONTEND_DIR = "${PROJECT_DIR}/frontend"
        BACKEND_DIR = "${PROJECT_DIR}/backend"

        DOCKER_HUB_CREDENTIAL_ID = 'dockerhub-jenkins'
        DOCKER_HUB_USER = 'bonghyerin'

        DOCKER_FRONTEND_IMAGE = "${DOCKER_HUB_USER}/pyeonriham-fe"
        DOCKER_BACKEND_IMAGE  = "${DOCKER_HUB_USER}/pyeonriham-be"

        IMAGE_TAG = "${BUILD_NUMBER}"

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
                        # --no-daemon으로 메모리 절약
                        ./gradlew clean build -x test --no-daemon
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
                        npm ci --prefer-offline  # npm install보다 빠르고 안정적
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
                    // 이전 이미지 정리는 빌드 전에
                    sh """
                        echo '🗑️  이전 이미지 삭제 중...'
                        docker rmi ${DOCKER_BACKEND_IMAGE}:latest ${DOCKER_BACKEND_IMAGE}:${IMAGE_TAG} || true
                        docker rmi ${DOCKER_FRONTEND_IMAGE}:latest ${DOCKER_FRONTEND_IMAGE}:${IMAGE_TAG} || true
                        
                        # Dangling 이미지도 정리
                        docker image prune -f
                    """
                    
                    dir(BACKEND_DIR) {
                        sh """
                            docker build --no-cache -t ${DOCKER_BACKEND_IMAGE}:${IMAGE_TAG} .
                            docker tag ${DOCKER_BACKEND_IMAGE}:${IMAGE_TAG} ${DOCKER_BACKEND_IMAGE}:latest
                        """
                    }
                    dir(FRONTEND_DIR) {
                        sh """
                            docker build --no-cache -t ${DOCKER_FRONTEND_IMAGE}:${IMAGE_TAG} .
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
                    # 방금 빌드한 이미지들 삭제
                    docker rmi ${DOCKER_BACKEND_IMAGE}:${IMAGE_TAG} ${DOCKER_BACKEND_IMAGE}:latest || true
                    docker rmi ${DOCKER_FRONTEND_IMAGE}:${IMAGE_TAG} ${DOCKER_FRONTEND_IMAGE}:latest || true
                    
                    # 전체 정리
                    docker system prune -af --volumes
                    
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
                                
                                # 기존 컨테이너 중지
                                docker compose down
                                
                                # 새 이미지 가져오기
                                export IMAGE_TAG=${IMAGE_TAG}
                                docker compose pull
                                
                                # 컨테이너 시작
                                docker compose up -d
                                
                                # EC2 서버도 정리
                                docker system prune -af --volumes
                                
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
        always {
            // 빌드 후 항상 정리
            sh """
                echo '🧹 최종 정리 중...'
                docker system prune -f || true
            """
        }
    }
}