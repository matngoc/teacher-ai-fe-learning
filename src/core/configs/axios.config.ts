import axios from "axios";
import qs from "qs";

export const AxiosBaseHttpApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 30000,
    paramsSerializer: {
        encode: qs.parse as any,
        serialize: qs.stringify as any,
    }
});

export const AxiosBaseHttpAiApi = axios.create({
    baseURL: import.meta.env.VITE_AI_BE_URL,
    timeout: 30000,
    paramsSerializer: {
        encode: qs.parse as any,
        serialize: qs.stringify as any,
    }
});