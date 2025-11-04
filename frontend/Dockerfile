# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# package.json과 package-lock.json 복사 (캐시 활용)
COPY package*.json ./
RUN npm ci

# 소스 복사 후 빌드
COPY . .
RUN npm run build

# ---- Run stage (Nginx로 정적 파일 서빙) ----
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# 기존 nginx 기본 파일 삭제
RUN rm -rf ./*

# 빌드된 파일 복사
COPY --from=builder /app/build .


# Nginx 설정 (SPA 라우팅 지원)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]