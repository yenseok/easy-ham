# ==============================================================
# 1️⃣ Build Stage
# Node 20 LTS 기반 - Alpine 이미지로 가볍고 최신 LTS 보장
# ==============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 캐싱
COPY package*.json ./
RUN npm ci

# 전체 복사 및 환경 변수 설정
COPY . .

# 빌드 시점에 외부 환경 변수 주입 (예: Jenkins ARG)
ARG VITE_APP_BASE_URL
ENV VITE_APP_BASE_URL=$VITE_APP_BASE_URL

# Vite 빌드
RUN npm run build


# ==============================================================
# 2️⃣ Production Stage
# 빌드 결과물만 Nginx로 전달
# ==============================================================
FROM nginx:stable-alpine

# 빌드 결과 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 사용자 정의 Nginx 설정 덮어쓰기
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 헬스체크 (옵션)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost:80/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
