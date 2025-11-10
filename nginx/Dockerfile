FROM nginx:stable-alpine

WORKDIR /usr/share/nginx/html

COPY dist/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /etc/letsencrypt/live/pyeonriham.site

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
