FROM node:22.13.0

   # 작업폴더 지정
WORKDIR /app
   # 현재위치 복사할컨테이너 위치
COPY ./package.json ./
RUN npm install

COPY ./ ./
CMD ["npm", "start"]

# # 1단계: 빌드 단계
# FROM node:22.13.0 AS builder
# WORKDIR /app

# # package.json 및 lock 파일 복사
# COPY package-lock.json ./
# COPY package.json ./

# # 의존성 설치
# RUN npm install

# # 소스 코드 복사 및 빌드
# COPY . .
# RUN npm run build

# # check용
# RUN ls -al /app

# # 2단계: 최종 실행 단계
# FROM node:22.13.0
# WORKDIR /app

# # 빌드 결과물 복사
# COPY --from=builder /app/dist /app/dist
# # 패키지 파일 복사 
# COPY --from=builder /app/package.json /app/package.json 
# # 패키지 파일 복사
# COPY --from=builder /app/package-lock.json /app/package-lock.json 
# # 포트 열기
# EXPOSE 5173

# CMD ["npm", "start"]
