import {AxiosBaseHttpApi} from "../configs/axios.config";
import {getCookie} from "../utils/cookieUtil.ts";

const baseHttpApi = AxiosBaseHttpApi;

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
    (error) => {
        if (error.response?.status === 401) {
            console.warn('⚠️ Token expired or unauthorized');
            // TODO: handle refresh token here if needed
        }
        return Promise.reject(error);
    }
);

export default baseHttpApi;
