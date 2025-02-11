import router from "../router/index";
import axios from "axios";
import store from "../store/store";
import * as jwtDecode from "jwt-decode";
import { useToast } from "vue-toastification";

// 경로 상수
const toast = useToast();
const ROUTE_LOGIN = "/oauth2Login";
const ROUTE_DASHBOARD = "/";
const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// 쿠키에서 특정 키의 값을 가져오는 유틸 함수
const getCookie = (key) => {
  alert("alert coockie");
  alert(
    "access token: " +
      document.cookie
        .split("; ")
        .find((row) => row.startsWith(key))
        ?.split("=")[1]
  );
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(key))
    ?.split("=")[1];
};

// OAuth 로그인 핸들러
export const oauthLogin = async (provider) => {
  try {
    // 현재 페이지 URL을 쿼리로 전달하여 로그인 후 돌아올 페이지를 저장
    const currentUrl = window.location.href;
    localStorage.setItem("redirectUrl", currentUrl); // 로컬 스토리지에 저장
    const baseUrl = import.meta.env.SERVER_HOST + "/oauth2/authorization";
    // const baseUrl = "http://localhost:8080/oauth2/authorization";

    // const baseUrl = "http://34.22.98.26:8080/oauth2/authorization";
    const redirectUrl = `${baseUrl}/${provider}`;
    window.location.href = redirectUrl; // OAuth 로그인 페이지로 리다이렉트
  } catch (error) {
    console.error("OAuth Login Error:", error);
  }
};

// OAuth 로그인 콜백 핸들러
export const handleOAuthCallback = async () => {
  try {
    const response = await axiosInstance.get("/check-auth");

    // alert(response.request.responseURL); // 요청 경로 확인
    if (response.status === 200) {
      const accessToken = getCookie("access");
      if (accessToken) {
        localStorage.setItem("access", accessToken);
        // 토큰 디코딩 후 userId localStorage에 저장
        const decodedToken = jwtDecode.jwtDecode(accessToken);
        localStorage.setItem("userId", decodedToken.id);
        // 로컬 스토리지에서 리다이렉트 URL을 가져옴
        const redirectUrl =
          localStorage.getItem("redirectUrl").split("=")[1] || ROUTE_DASHBOARD;
        // 로그인 후 해당 페이지로 리다이렉트
        router.push({
          path: redirectUrl,
        });

        store.dispatch("login"); // Vuex를 통해 로그인 상태 변경
        toast.success("환영합니다.", { timeout: 2000 });
      } else {
        setTimeout(() => alert("토큰이 쿠키에 없습니다."), 100);
        router.push(ROUTE_LOGIN);
      }
    }
  } catch (error) {
    setTimeout(() => alert("OAuth Callback Error:" + error), 100);
    router.push(ROUTE_LOGIN);
  }
};
