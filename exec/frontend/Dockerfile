# 프론트엔드 정적 파일을 Nginx로 서빙하는 Dockerfile

FROM nginx:stable-alpine

# 빌드된 정적 파일 복사
COPY build/ /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx/html

# history mode 대응을 위한 Nginx 설정 덮어쓰기
COPY nginx.conf /etc/nginx/conf.d/default.conf
