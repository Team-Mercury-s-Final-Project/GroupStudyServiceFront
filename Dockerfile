# 1단계: 빌드 단계
FROM node:22.13.0 AS builder
WORKDIR /app

# package.json 및 lock 파일 복사
COPY package.json package-lock.json /app/
# 권한 설정
RUN chmod 755 /app/package.json /app/package-lock.json

# 의존성 설치
RUN npm install

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# 2단계: 최종 실행 단계
FROM node:22.13.0
WORKDIR /app

# 빌드 결과물 복사
COPY --from=builder /app/dist /app/dist
# 권한 설정
RUN chmod -R 755 /app

# 포트 열기
EXPOSE 5173

CMD ["npm", "start"]
