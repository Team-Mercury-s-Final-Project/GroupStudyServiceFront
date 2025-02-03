import axios from "axios";

const api = axios.create({
  // baseURL: 'http://34.22.98.26:8080/api',
  // headers: {
  //     'Content-Type': 'application/json',
  // }
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 이 옵션을 추가
});

export default api;
