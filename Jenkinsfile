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
                    // .env.prod에서 환경 변수 로드
                    def props = readProperties file: '.env.prod'
                    
                    sh """
                        docker build \
                        --build-arg VITE_SSO_CLIENT_ID=${props.VITE_SSO_CLIENT_ID} \
                        --build-arg VITE_SSO_REDIRECT_URI=${props.VITE_SSO_REDIRECT_URI} \
                        --build-arg VITE_API_BASE_URL=${props.VITE_API_BASE_URL} \
                        --build-arg VITE_MATTERMOST_URL=${props.VITE_MATTERMOST_URL} \
                        -t bonghyerin/pyeonriham-fe:latest \
                        ./frontend
                    """
                }
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    echo '=== Building Frontend (React + Vite) ==='
                    
                    // .env.prod 파일을 직접 읽어서 환경 변수로 설정
                    sh '''
                        cd frontend
                        
                        # .env.prod에서 환경 변수 추출 (export 형태로 변환)
                        if [ -f ../.env.prod ]; then
                            export $(cat ../.env.prod | grep "^VITE_" | xargs)
                        fi
                        
                        # Docker 빌드 시 build-arg로 전달
                        docker build \
                        --build-arg VITE_SSO_CLIENT_ID="${VITE_SSO_CLIENT_ID}" \
                        --build-arg VITE_SSO_REDIRECT_URI="${VITE_SSO_REDIRECT_URI}" \
                        --build-arg VITE_API_BASE_URL="${VITE_API_BASE_URL}" \
                        --build-arg VITE_MATTERMOST_FILE_TOKEN="${VITE_MATTERMOST_FILE_TOKEN}" \
                        --build-arg VITE_MATTERMOST_URL="${VITE_MATTERMOST_URL}" \
                        -t bonghyerin/pyeonriham-fe:latest \
                        .
                    '''
                    
                    echo '✅ Frontend Docker 이미지 빌드 완료!'
                }
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
