// Authentication.js
import router from "../router/index";
import axiosInstance from "axios";
import store from "../store/store";

// 경로 상수
const ROUTE_LOGIN = "/oauth2Login";
const ROUTE_DASHBOARD = "/";

// 쿠키에서 특정 키의 값을 가져오는 유틸 함수
const getCookie = (key) => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(key))
    ?.split("=")[1];
};

// OAuth 로그인 핸들러
export const oauthLogin = async (provider) => {
  // export 추가
  try {
    const baseUrl = "http://34.22.98.26:8080/oauth2/authorization";
    const redirectUrl = `${baseUrl}/${provider}`;
    window.location.href = redirectUrl;
  } catch (error) {
    console.error("OAuth Login Error:", error);
  }
};
// OAuth 로그인 성공 이후 처리 핸들러
export const handleOAuthCallback = async () => {
  // export 추가
  try {
    const response = await axiosInstance.get("/api/check-auth");
    if (response.status === 200) {
      const accessToken = getCookie("access");
      const refreshToken = getCookie("refresh");
      if (accessToken && refreshToken) {
        localStorage.setItem("access", accessToken);
        router.push(ROUTE_DASHBOARD);
        console.log("store.dispatch(");
        store.dispatch("login"); // Vuex를 통해 로그인 상태 변경
      } else {
        console.error("토큰이 쿠키에 없습니다.");
        router.push(ROUTE_LOGIN);
      }
    }
  } catch (error) {
    console.error("OAuth Callback Error:", error);
    router.push(ROUTE_LOGIN);
  }
};
