# 1단계: 빌드 단계
FROM node:latest AS builder
# 컨테이너 내부 디렉토리에 /app/src 디렉토리를 생성
RUN mkdir -p /app/src  
WORKDIR /app
# 프로젝트 디렉토리를 /app 안으로 복사
COPY ./ ./
# npm install을 통해 node_modules를 설치
RUN npm install
RUN npm run build

# 2단계: 최종 단계
FROM node:latest
WORKDIR /app
# 빌드된 결과물을 /app/dist 디렉토리로 복사
COPY --from=builder /app/dist /app/dist
# 5173번 포트를 해당 컨테이너에서 오픈
EXPOSE 5173
CMD ["npm", "start"]
