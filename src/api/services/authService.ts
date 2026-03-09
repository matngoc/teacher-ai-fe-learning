import axiosInstance from '../axiosInstance';
import type {
  AuthResponse,
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  User,
} from '../types';

export const authService = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const res = await axiosInstance.post('/api/auth/login', data);
    return res.data;
  },

  register: async (data: RegisterDto) => {
    const res = await axiosInstance.post('/api/auth/register', data);
    return res.data;
  },

  refresh: async (refreshToken: string) => {
    const res = await axiosInstance.post('/api/auth/refresh', { refreshToken });
    return res.data;
  },

  logout: async (refreshToken: string) => {
    const res = await axiosInstance.post('/api/auth/logout', { refreshToken });
    return res.data;
  },

  getProfile: async (): Promise<User> => {
    const res = await axiosInstance.get('/api/auth/profile');
    return res.data;
  },

  changePassword: async (data: ChangePasswordDto) => {
    const res = await axiosInstance.patch('/api/auth/change-password', data);
    return res.data;
  },

  // Gửi Google access_token lên backend để đổi lấy JWT hệ thống
  googleTokenLogin: async (googleAccessToken: string) => {
    const res = await axiosInstance.post('/api/auth/google/token', {
      access_token: googleAccessToken,
    });
    return res.data;
  },

  // URL redirect trực tiếp (dùng window.location nếu cần)
  getGoogleLoginUrl: () => {
    return `${import.meta.env.VITE_API_URL}/api/auth/google`;
  },
};
