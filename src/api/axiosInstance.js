import axios from "axios";
import store from "../store/store";
import router from "../router";

const ROUTE_LOGIN = "/oauth2Login";
const ROUTE_DASHBOARD = "/";
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshSubscribers = [];

// 리다이렉트 URL을 설정하는 함수
const getRedirectUrl = (url) => {
  switch (url) {
    case "/user-info":
      return "userinfoPage";
    default:
      return "/";
  }
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 쿠키에서 특정 키의 값을 가져오는 유틸 함수
const getCookie = (key) => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(key))
    ?.split("=")[1];
};

// 로그인 후 리다이렉트 처리 함수
const redirectAfterLogin = (alertMessage, redirectUrl) => {
  setTimeout(() => alert(alertMessage), 100);
  router.push({ path: "/oauth2Login", query: { redirect: redirectUrl } });
};

// 토큰 재발급이 완료된 후 기존 요청들을 재시도
const onRefreshed = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

// 토큰 재발급 실패 시 대기 중인 요청들을 reject
const onRefreshError = (error) => {
  refreshSubscribers.forEach((callback) => callback(error));
  refreshSubscribers = [];
};

// 로그인 처리와 토큰 발급 실패 시 리다이렉트 메시지 처리 함수
const handleErrorMessage = (message, url) => {
  switch (message) {
    case "Access token is missing":
    case "Token Category is not access token":
      redirectAfterLogin("로그인 후 이용해주세요.", url);
      break;
    case "Access token is blacklisted":
      redirectAfterLogin(
        "다른 PC 또는 브라우저에서 접속되어 재 로그인 후 이용해주세요.",
        url
      );
      store.dispatch("logout");
      localStorage.removeItem("access");
      break;
    case "Access token time is expired":
      return true;
    case "reissue Fail":
      redirectAfterLogin("세션이 종료되어 재 로그인 후 이용해주세요.", url);
      store.dispatch("logout");
      localStorage.removeItem("access");
    default:
      break;
  }
  return false;
};

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem("access");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      const redirectUrl = getRedirectUrl(config.url);
      redirectAfterLogin("로그인 후 이용해주세요.", redirectUrl);
      return;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// // 응답 인터셉터 코드
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      const { status, data: message } = error.response;
      const redirectUrl = getRedirectUrl(error.config.url);
      if (handleErrorMessage(message, redirectUrl)) {
        // 재발급 중인 경우 중복 요청을 방지
        if (originalRequest._retry) return Promise.reject(error);

        originalRequest._retry = true;

        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const reissu_res = await axiosInstance.post("/auth/reissue");
            if (reissu_res.status === 200) {
              // 새로 발급된 액세스 토큰
              const reissue_access = reissu_res.headers[
                "authorization"
              ].replace("Bearer ", "");
              localStorage.setItem("access", reissue_access);
            }
            // 토큰 재발급 완료 후 대기 중인 요청들 실행
            isRefreshing = false;
            onRefreshed();
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            isRefreshing = false;
            onRefreshError(refreshError);
            return Promise.reject(refreshError);
          }
        }

        // 재시도하려는 요청을 Promise로 감싸고, 재발급 후 처리
        return new Promise((resolve, reject) => {
          // 요청이 끝날 때까지 대기
          refreshSubscribers.push((error) => {
            if (error) {
              reject(error); // 에러가 나면 reject
            } else {
              resolve(axiosInstance(originalRequest)); // 재시도
            }
          });
        });
      }
    }
    return Promise.reject(error);
  }
);

// 응답 인터셉터
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401) {
//       const { status, data: message } = error.response;
//       const redirectUrl = getRedirectUrl(error.config.url);

//       if (handleErrorMessage(message, redirectUrl)) {
//         if (originalRequest._retry) return Promise.reject(error);

//         originalRequest._retry = true;
//         if (!isRefreshing) {
//           isRefreshing = true;
//           try {
//             const reissu_res = await axiosInstance.post("/auth/reissue");
//             if (reissu_res.status === 200) {
//               // await delay(200); // 200ms 대기
//               let reissue_access = reissu_res.headers["authorization"];
//               if (reissue_access) {
//                 reissue_access = reissue_access.replace("Bearer ", "");
//                 localStorage.setItem("access", reissue_access);
//               } else {
//                 console.log("토큰이 쿠키에 없습니다.");
//                 router.push(ROUTE_LOGIN);
//               }
//             } else {
//               setTimeout(() => alert("토큰이 쿠키에 없습니다."), 100);
//               router.push(ROUTE_LOGIN);
//             }

//             isRefreshing = false;
//             onRefreshed();
//             return axiosInstance(originalRequest);
//           } catch (refreshError) {
//             console.log("refreshError: " + refreshError);
//             isRefreshing = false;
//             onRefreshError(refreshError);
//             return Promise.reject(refreshError);
//           }
//         }
//         return new Promise((resolve, reject) => {
//           refreshSubscribers.push((error) => {
//             if (error) {
//               reject(error);
//             } else {
//               resolve(axiosInstance(originalRequest));
//             }
//           });
//         });
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;
