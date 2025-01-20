# 1단계: 빌드 단계
FROM node:latest AS builder
WORKDIR /
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2단계: 최종 단계
FROM node:latest
WORKDIR /
COPY --from=builder /dist /dist
EXPOSE 5173
CMD ["npm", "start"]
