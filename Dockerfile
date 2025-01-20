# 1단계: 빌드 단계
FROM node:latest AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2단계: 최종 단계
FROM node:latest
WORKDIR /app
COPY --from=builder /app/dist /app/dist
EXPOSE 5173
CMD ["npm", "start"]
