import axios from "axios";
import { useStore } from "vuex";
import store from "../store/store";
import router from "../router";
// import loginmodal from "../components/modal/LoginPermissionRequired.vue";

const axiosInstance = axios.create({
  baseURL: "http://34.22.98.26:8080/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshSubscribers = [];

// const hasRefreshToken = () => {
//   return document.cookie.split("; ").some((row) => row.startsWith("refresh"));
// };

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

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  async (config) => {
    if (!config.url?.includes("/api/auth/reissue")) {
      // 쿠키에서 access 토큰을 찾기
      const accessToken = localStorage.getItem("access");
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      // alert("로그인 사용자만 가능합니다.");
      // router.push("/oauth2Login");
      // {
      //   {
      //     store.commit("setModal", {
      //       isVisible: true,
      //       title: "테스트",
      //       message: "로그인 한 사용자만 이용가능합니다.",
      //     });
      //     return;
      //   }
      // }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await axiosInstance.post("/api/auth/reissue");
      console.error("토큰 갱신 실패:", refreshError);
    }
    const originalRequest = error.config;

    // 응답이 401일 때, 서버에서 보낸 메시지를 확인하고 출력
    if (error.response?.status === 401) {
      const message = error.response.data;
      if (
        message === "Access token is missing" ||
        message === "Token Category is not access token"
      )
        alert("로그인 사용자만 가능합니다.");
      window.location.href = "/oauth2Login";
    }

    //   if (error.response?.status === 401 && !originalRequest._retry) {
    //     originalRequest._retry = true;

    //     if (!isRefreshing) {
    //       isRefreshing = true;

    //       try {
    //         await axiosInstance.post("/api/auth/reissue");
    //         isRefreshing = false;
    //         onRefreshed();
    //         return axiosInstance(originalRequest);
    //       } catch (refreshError) {
    //         isRefreshing = false;
    //         onRefreshError(refreshError);
    //         console.error("토큰 갱신 실패:", refreshError);
    //         return Promise.reject(refreshError);
    //       }
    //     }
    //     // 토큰 재발급 진행 중일 때의 요청들은 대기열에 추가
    //     return new Promise((resolve, reject) => {
    //       refreshSubscribers.push((error) => {
    //         if (error) {
    //           reject(error);
    //         } else {
    //           resolve(axiosInstance(originalRequest));
    //         }
    //       });
    //     });
    //   }
    //   return Promise.reject(error);
  }
);

export default axiosInstance;
