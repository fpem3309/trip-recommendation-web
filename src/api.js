import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

// 요청 인터셉터
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("token:", token);
  return config;
});

// 응답 인터셉터
api.interceptors.response.use((response) => {
  const guestToken = response.headers["x-guest-token"];
  if (guestToken && !localStorage.getItem("token")) {
    // 토큰이 없었던 경우 → guestToken 저장
    localStorage.setItem("token", guestToken);
  }
  console.log("guestToken:", guestToken);
  return response;
});

export default api;
