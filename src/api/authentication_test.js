// import router from "../router/index";
// import axios from "axios";
// //import axiosInstance from "../api/axiosInstance";
// import store from "../store/store";
// import * as jwtDecode from "jwt-decode";

// // 경로 상수
// const ROUTE_LOGIN = "/oauth2Login";
// const ROUTE_DASHBOARD = "/";
// const axiosInstance = axios.create({
//   baseUrl: import.meta.env.SERVER_HOST,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // 쿠키에서 특정 키의 값을 가져오는 유틸 함수
// const getCookie = (key) => {
//   alert("alert coockie");
//   alert(
//     "access token: " +
//       document.cookie
//         .split("; ")
//         .find((row) => row.startsWith(key))
//         ?.split("=")[1]
//   );
//   return document.cookie
//     .split("; ")
//     .find((row) => row.startsWith(key))
//     ?.split("=")[1];
// };

// // OAuth 로그인 핸들러
// export const oauthLogin = async (provider) => {
//   try {
//     // 현재 페이지 URL을 쿼리로 전달하여 로그인 후 돌아올 페이지를 저장
//     const currentUrl = window.location.href;
//     localStorage.setItem("redirectUrl", currentUrl); // 로컬 스토리지에 저장


//     const baseUrl = import.meta.env.VITE_SERVER_HOST_BASE + "/oauth2/authorization";
    
//     const redirectUrl = `${baseUrl}/${provider}`;
//     window.location.href = redirectUrl; // OAuth 로그인 페이지로 리다이렉트
//   } catch (error) {
//     console.error("OAuth Login Error:", error);
//   }
// };

// // OAuth 로그인 콜백 핸들러
// export const handleOAuthCallback = async () => {
//   try {
//     console.log("api sent");
//     const response = await axiosInstance.get("/api/check-auth");
//     if (response.status === 200) {
//       const accessToken = getCookie("access");
//       if (accessToken) {
//         localStorage.setItem("access", accessToken);
//         // 토큰 디코딩 후 userId localStorage에 저장
//         const decodedToken = jwtDecode.jwtDecode(accessToken);
//         localStorage.setItem("userId", decodedToken.id);
//         // 로컬 스토리지에서 리다이렉트 URL을 가져옴
//         const redirectUrl =
//           localStorage.getItem("redirectUrl").split("=")[1] || ROUTE_DASHBOARD;
//         // 로그인 후 해당 페이지로 리다이렉트
//         router.push({
//           path: redirectUrl,
//         });

//         store.dispatch("login"); // Vuex를 통해 로그인 상태 변경
//       } else {
//         alert("토큰토큰");
//         setTimeout(() => alert("토큰이 쿠키에 없음."), 100);
//         router.push(ROUTE_LOGIN);
//       }
//     }
//   } catch (error) {
//     setTimeout(() => alert("OAuth Callback Error:" + error), 100);
//     router.push(ROUTE_LOGIN);
//   }
// };
