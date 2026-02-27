import axiosInstance from '../axiosInstance';
import type {
  Course,
  CreateCourseDto,
  UpdateCourseDto,
  CourseFilterDto,
  PageData,
} from '../types';

export const courseService = {
  findPage: async (data: CourseFilterDto): Promise<PageData<Course>> => {
    const res = await axiosInstance.post('/api/courses/page', data);
    return res.data;
  },

  findOne: async (id: number): Promise<Course> => {
    const res = await axiosInstance.get(`/api/courses/${id}`);
    return res.data;
  },

  findActive: async (): Promise<Course[]> => {
    const res = await axiosInstance.get('/api/courses/active');
    return res.data;
  },

  findByCode: async (code: string): Promise<Course> => {
    const res = await axiosInstance.get(`/api/courses/code/${code}`);
    return res.data;
  },

  create: async (data: CreateCourseDto): Promise<Course> => {
    const res = await axiosInstance.post('/api/courses', data);
    return res.data;
  },

  update: async (id: number, data: UpdateCourseDto): Promise<Course> => {
    const res = await axiosInstance.patch(`/api/courses/${id}`, data);
    return res.data;
  },

  remove: async (id: number) => {
    const res = await axiosInstance.delete(`/api/courses/${id}`);
    return res.data;
  },

  restore: async (id: number) => {
    const res = await axiosInstance.patch(`/api/courses/${id}/restore`);
    return res.data;
  },
};
