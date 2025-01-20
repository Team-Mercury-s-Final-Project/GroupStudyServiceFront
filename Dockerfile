# 1단계: 빌드 단계
FROM node:22.13.0 AS builder
WORKDIR /app

# 프로젝트의 모든 파일을 복사하여 package.json 포함
COPY ./ ./

# 의존성 설치
RUN npm install

# 소스 코드 복사 및 빌드
RUN npm run build

# 2단계: 최종 실행 단계
FROM node:22.13.0
WORKDIR /app

# 빌드 결과물 복사
COPY --from=builder /app/dist /app/dist

# 포트 열기
EXPOSE 5173

CMD ["npm", "start"]
