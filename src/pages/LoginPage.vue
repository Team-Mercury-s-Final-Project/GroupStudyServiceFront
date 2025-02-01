<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 로그인 폼 -->
      <div class="form-container">
        <h1>로그인</h1>
        <span class="subtitle">소셜 계정으로 로그인</span>
        <div class="oauth-buttons">
          <fwb-avatar
            img="/src/assets/google2-logo.png"
            alt="Google 로그인"
            rounded
            @click="oauthLogin('google')"
          />
          <fwb-avatar
            img="/src/assets/naver-logo.png"
            alt="Naver 로그인"
            rounded
            @click="oauthLogin('naver')"
          />
          <fwb-avatar
            img="/src/assets/kakao-logo.png"
            alt="Kakao 로그인"
            rounded
            @click="oauthLogin('kakao')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { FwbAvatar } from "flowbite-vue";
import { oauthLogin } from "../api/authentication"; // Authentication.js에서 함수 가져오기
</script>

<style scoped>
/* 페이지 전체 레이아웃 */
.login-page {
  width: 50vw;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30vh;
  position: relative;
  top: 15vh;
  left: 15vw;
}

/* 로그인 & 회원가입 컨테이너 */
.login-container {
  display: flex;
  width: 80%;
  max-width: 900px;
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.form-container {
  flex: 1;
  padding: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.form-container h1,
.register-container h1 {
  font-size: 2rem;
  margin-bottom: 20px;
  color: #333;
}

.subtitle {
  margin-bottom: 20px;
  font-size: 1rem;
  color: #666;
}

/* 소셜 로그인 버튼 */
.oauth-buttons {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.oauth-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f1f1f1;
  transition: all 0.3s ease;
  cursor: pointer;
}

.oauth-button img {
  width: 24px;
  height: 24px;
}

.oauth-button:hover {
  transform: scale(1.1);
}

/* 입력 필드 스타일 */
.form-control {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

/* 버튼 스타일 */
.primary-button {
  width: 100%;
  padding: 10px;
  background: #1e88e5;
  color: #fff;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-button:hover {
  background: #1565c0;
}

.ghost-button {
  padding: 10px 20px;
  background: none;
  color: #1e88e5;
  border: 2px solid #1e88e5;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ghost-button:hover {
  background: #1e88e5;
  color: #fff;
}
</style>
