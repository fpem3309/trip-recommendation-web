import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // 쿠키를 자동으로 포함
});

// 요청 인터셉터
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("localStorage token:", token);
  return config;
});

// 동시 요청 처리를 위한 변수
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    const guestToken = response.headers["x-guest-token"];
    if (guestToken && !localStorage.getItem("token")) {
      localStorage.setItem("token", guestToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.log("Response error:", error.response);

    // 401 에러이고, 재시도한 요청이 아닐 경우
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh`, 
          {}, // POST body
          { withCredentials: true } // refresh token 쿠키를 보내기 위해 필수
        );
        
        const newAccessToken = data.accessToken;

        localStorage.setItem("token", newAccessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        console.error("Unable to refresh token:", refreshError);
        
        localStorage.removeItem("token");
        // 로그인 페이지로 리디렉션
        // 순환 종속성 문제를 피하기 위해 router를 직접 import하는 대신 window.location 사용
        window.location.href = '/login';

        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const login = async (credentials) => {
  const response = await api.post('/api/auth/login', credentials);
  const token = response.data.token;
  localStorage.setItem('token', token);
  return token;
};

export default api;
