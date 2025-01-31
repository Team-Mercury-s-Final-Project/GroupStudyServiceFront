import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  async (config) => {
    // 쿠키에서 access 토큰을 찾기
    const accessToken = localStorage.getItem("access");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
