# 기본 이미지로 node를 사용
FROM node:23.6.0

# 앱 디렉터리 생성 및 소스 복사
WORKDIR /app
COPY package*.json ./
COPY . .

# 의존성 설치 및 프로젝트 빌드
RUN npm install
RUN npm run build

# 빌드된 파일을 제공하는 서버 설치 (예: serve)
RUN npm install -g serve

# 빌드된 파일 복사
WORKDIR /app
COPY --from=0 /app/dist /app/dist

# 포트 설정
EXPOSE 5173

# serve를 사용하여 정적 파일 제공
CMD ["serve", "-s", "dist"]
