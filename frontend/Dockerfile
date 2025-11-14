# =====================
# 1) Build Stage
# =====================
FROM node:20-alpine AS build

WORKDIR /app

# 패키지 설치
COPY package*.json ./
RUN npm install

# 소스 복사 후 빌드
COPY . .
RUN npm run build


# =====================
# 2) Deploy Stage
# =====================
FROM nginx:1.25-alpine

# Nginx 설정 파일 덮어쓰기 (필요 시)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build 결과물을 Nginx 기본 경로로 복사
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
