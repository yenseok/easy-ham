# =================================================================
# 1. 빌드 스테이지 (Build Stage)
# Node.js 환경에서 애플리케이션 소스 코드를 정적 파일로 빌드합니다.
# =================================================================
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 캐싱: package.json 파일이 변경되었을 때만 npm install을 다시 실행합니다.
COPY package*.json ./
RUN npm install

# 소스 코드 전체 복사
COPY . .

# docker build 시점에 외부에서 환경 변수(VITE_APP_BASE_URL)를 주입받습니다.
ARG VITE_APP_BASE_URL
ENV VITE_APP_BASE_URL=$VITE_APP_BASE_URL

# Vite를 사용하여 프로덕션용으로 빌드합니다.
RUN npm run build

# =================================================================
# 2. 프로덕션 스테이지 (Production Stage)
# 빌드된 결과물을 가벼운 Nginx 이미지에 복사하여 서비스합니다.
# =================================================================
FROM nginx:stable-alpine

# 위 'builder' 스테이지에서 빌드된 결과물(/app/dist)을
# Nginx의 기본 웹 루트 디렉토리로 복사합니다.
COPY --from=builder /app/dist /usr/share/nginx/html

# 우리가 직접 작성한 Nginx 설정을 컨테이너의 기본 설정 파일 위치에 덮어씁니다.
# (이 Dockerfile과 같은 경로에 nginx.conf 파일이 있어야 합니다.)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 80번 포트를 외부에 노출합니다.
EXPOSE 80

# Nginx 서버를 실행합니다.
CMD ["nginx", "-g", "daemon off;"]