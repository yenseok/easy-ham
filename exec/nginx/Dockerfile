FROM nginx:alpine

# nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/default.conf /etc/nginx/conf.d/default.conf

# 프론트엔드 파일 복사 (있는 경우)
COPY index.html /usr/share/nginx/html/index.html
COPY game.html /usr/share/nginx/html/game.html
COPY game2.html /usr/share/nginx/html/game2.html
COPY game3.html /usr/share/nginx/html/game3.html
# 로그 디렉토리 권한 설정
RUN mkdir -p /var/log/nginx && \
    chown -R nginx:nginx /var/log/nginx

# 포트 노출
EXPOSE 80 443

# nginx 실행
CMD ["nginx", "-g", "daemon off;"]
