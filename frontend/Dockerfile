# =====================
# 1) Build Stage
# =====================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# =====================
# 2) Deploy Stage
# =====================
FROM nginx:1.25-alpine

# 결과물 경로 수정! dist → build
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
