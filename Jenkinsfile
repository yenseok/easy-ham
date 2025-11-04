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
        DOCKER_BACKEND_IMAGE = "${DOCKER_HUB_USER}/prham-backend"
        
        // 이미지 태그
        IMAGE_TAG = "${BUILD_NUMBER}"
        
        // 배포 경로 (같은 서버)
        DEPLOY_PATH = '/home/ubuntu/app'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '=== Checking out code from GitLab ==='
                cleanWs()
                git url: 'https://lab.ssafy.com/s13-final/S13P31A105.git', 
                    branch: 'release', 
                    credentialsId: 'jenkins-token'
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
                            echo 'Backend 빌드 완료!'
                        } else {
                            error 'gradlew 파일이 없습니다!'
                        }
                    }
                }
            }
        }
        
        stage('Build Frontend') {
            tools {
                nodejs 'NodeJS-LTS' 
            }
            steps {
                echo '=== Building Frontend (npm) ==='
                dir(FRONTEND_DIR) {
                    script {
                        if (fileExists('package.json')) {
                            sh 'npm install'
                            sh 'npm run build'
                            echo 'Frontend 빌드 완료!'
                        } else {
                            error 'package.json이 없습니다!'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                echo '=== Building Docker Images ==='
                script {
                    // Backend Docker Image 빌드
                    dir(BACKEND_DIR) {
                        sh """
                            docker build -t ${DOCKER_BACKEND_IMAGE}:${IMAGE_TAG} .
                            docker tag ${DOCKER_BACKEND_IMAGE}:${IMAGE_TAG} ${DOCKER_BACKEND_IMAGE}:latest
                        """
                    }
                    
                    // Frontend Docker Image 빌드
                    dir(FRONTEND_DIR) {
                        sh """
                            docker build -t ${DOCKER_FRONTEND_IMAGE}:${IMAGE_TAG} .
                            docker tag ${DOCKER_FRONTEND_IMAGE}:${IMAGE_TAG} ${DOCKER_FRONTEND_IMAGE}:latest
                        """
                    }
                }
                echo 'Docker 이미지 빌드 완료!'
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                echo '=== Pushing Images to Docker Hub ==='
                script {
                    docker.withRegistry('https://registry.hub.docker.com', DOCKER_HUB_CREDENTIAL_ID) {
                        sh """
                            docker push ${DOCKER_BACKEND_IMAGE}:${IMAGE_TAG}
                            docker push ${DOCKER_BACKEND_IMAGE}:latest
                            docker push ${DOCKER_FRONTEND_IMAGE}:${IMAGE_TAG}
                            docker push ${DOCKER_FRONTEND_IMAGE}:latest
                        """
                    }
                }
                echo 'Docker Hub에 이미지 푸시 완료!'
            }
        }
        
        stage('Deploy to Server') {
            steps {
                echo '=== Deploying on Same Server (No SSH needed) ==='
                sh """
                    cd ${DEPLOY_PATH}
                    
                    echo "Pulling latest images..."
                    docker pull ${DOCKER_BACKEND_IMAGE}:${IMAGE_TAG}
                    docker pull ${DOCKER_FRONTEND_IMAGE}:${IMAGE_TAG}
                    
                    echo "Starting services..."
                    export TAG=${IMAGE_TAG}
                    docker compose up -d backend frontend mysql mongodb
                    
                    echo "Cleaning up old images..."
                    docker image prune -f
                    
                    echo "Deployment completed!"
                    docker compose ps
                """
            }
        }
    }
    
    post {
        success {
            echo '=== Pipeline 성공! ==='
            echo "Backend: ${DOCKER_BACKEND_IMAGE}:${IMAGE_TAG}"
            echo "Frontend: ${DOCKER_FRONTEND_IMAGE}:${IMAGE_TAG}"
        }
        failure {
            echo '=== Pipeline 실패! ==='
            echo '로그를 확인하세요.'
        }
        always {
            echo '=== Cleaning up workspace Docker images ==='
            sh """
                docker rmi ${DOCKER_BACKEND_IMAGE}:${IMAGE_TAG} || true
                docker rmi ${DOCKER_FRONTEND_IMAGE}:${IMAGE_TAG} || true
            """
        }
    }
}