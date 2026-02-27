import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store',
    Pragma: 'no-cache',
  },

  validateStatus: (status) => status >= 200 && status < 300,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

// Request interceptor - attach access token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle 401 and refresh token + unwrap API envelope
axiosInstance.interceptors.response.use(
  (response) => {
    // Unwrap common API envelope: { success, message, data: <actual payload> }
    const body = response.data;
    if (
      body !== null &&
      typeof body === 'object' &&
      'success' in body
    ) {
      // If server signals failure inside a 2xx response, reject with the message
      if (body.success === false) {
        const err = new Error(body.message || 'Yêu cầu thất bại') as Error & {
          apiMessage?: string;
        };
        err.apiMessage = body.message;
        return Promise.reject(err);
      }
      // Attach _apiMessage so callers (baseSlice) can read the success message
      if ('data' in body) {
        const unwrapped = body.data;
        if (unwrapped !== null && typeof unwrapped === 'object') {
          (unwrapped as Record<string, unknown>)['_apiMessage'] = body.message;
        } else {
          // primitive / null: wrap in object so message is not lost
          response.data = { _apiMessage: body.message, _value: unwrapped };
          return response;
        }
        response.data = unwrapped;
      }
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });
        const { accessToken: newAccessToken } = response.data;
        localStorage.setItem('accessToken', newAccessToken);
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
