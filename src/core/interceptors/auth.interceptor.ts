import {AxiosBaseHttpApi} from "../configs/axios.config";
import {deleteCookie, getCookie, setCookie} from "../utils/cookieUtil.ts";
import {AuthService} from "../../api/services/AuthService.ts";
import {triggerLogout} from "../context/authEvent.ts";

const baseHttpApi = AxiosBaseHttpApi;
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};
const refreshTokenApi = async (): Promise<string | null> => {
  try {
    const refreshToken = getCookie('refresh_token');
    if (!refreshToken) return null;

    const res = await AuthService.refreshToken({
      body: {
        refreshToken: refreshToken,
      }
    })
    const newAccessToken = res.data.access_token;
    setCookie('token', newAccessToken);
    return newAccessToken;
  } catch (error) {
    return null;
  }
};


baseHttpApi.interceptors.request.use(
  (config) => {
    const token = getCookie('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


baseHttpApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(baseHttpApi(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshTokenApi();
        if (!newToken) {
          deleteCookie('token');
          deleteCookie('refresh_token');
          triggerLogout();
        }
        baseHttpApi.defaults.headers.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return baseHttpApi(originalRequest);
      } catch (err) {
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


export default baseHttpApi;
