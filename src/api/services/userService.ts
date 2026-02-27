import axiosInstance from '../axiosInstance';
import type {
  CreateUserDto,
  PageData,
  UpdateProfileDto,
  UpdateUserDto,
  User,
  UserPageDto,
} from '../types';

export const userService = {
  findPage: async (data: UserPageDto): Promise<PageData<User>> => {
    const res = await axiosInstance.post('/api/users/page', data);
    return res.data;
  },

  findOne: async (id: number): Promise<User> => {
    const res = await axiosInstance.get(`/api/users/${id}`);
    return res.data;
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const res = await axiosInstance.post('/api/users', data);
    return res.data;
  },

  update: async (id: number, data: UpdateUserDto): Promise<User> => {
    const res = await axiosInstance.patch(`/api/users/${id}`, data);
    return res.data;
  },

  remove: async (id: number) => {
    const res = await axiosInstance.delete(`/api/users/${id}`);
    return res.data;
  },

  restore: async (id: number) => {
    const res = await axiosInstance.patch(`/api/users/${id}/restore`);
    return res.data;
  },

  updateMyProfile: async (data: UpdateProfileDto): Promise<User> => {
    const res = await axiosInstance.patch('/api/users/profile/me', data);
    return res.data;
  },
};
