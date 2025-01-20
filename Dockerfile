# 1단계: 빌드 단계
FROM node:latest AS builder
WORKDIR /Star-FE
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2단계: 최종 단계
FROM node:latest
WORKDIR /Star-FE
COPY --from=builder /Star-FE/dist /Star-FE/dist
EXPOSE 5173
CMD ["npm", "start"]
