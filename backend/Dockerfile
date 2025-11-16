# =====================
# 1) Build Stage
# =====================
FROM node:20-alpine AS build
WORKDIR /app

# package.json 복사 및 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사
COPY . .

# 빌드 시 환경변수 주입 (ARG로 받아서 ENV로 설정)
ARG VITE_SSO_CLIENT_ID
ARG VITE_SSO_REDIRECT_URI
ARG VITE_API_BASE_URL

ENV VITE_SSO_CLIENT_ID=$VITE_SSO_CLIENT_ID
ENV VITE_SSO_REDIRECT_URI=$VITE_SSO_REDIRECT_URI
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# 빌드 실행
RUN npm run build

# =====================
# 2) Deploy Stage
# =====================
FROM nginx:1.25-alpine

# Vite 빌드 결과물은 dist에 생성됨
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]