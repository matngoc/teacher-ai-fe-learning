import axiosInstance from '../axiosInstance';
import type {
  LessonHistory,
  CreateLessonHistoryDto,
  UpdateLessonHistoryDto,
  LessonHistoryFilterDto,
  PageData,
} from '../types';

export const lessonHistoryService = {
  create: async (data: CreateLessonHistoryDto): Promise<LessonHistory> => {
    const res = await axiosInstance.post('/api/lesson-histories', data);
    return res.data;
  },

  findPage: async (data: LessonHistoryFilterDto): Promise<PageData<LessonHistory>> => {
    const res = await axiosInstance.post('/api/lesson-histories/page', data);
    return res.data;
  },

  findByLessonId: async (lessonId: number): Promise<LessonHistory[]> => {
    const res = await axiosInstance.get(`/api/lesson-histories/lesson/${lessonId}`);
    return res.data;
  },

  findLatestByUserAndLesson: async (lessonId: number, userId: number): Promise<LessonHistory> => {
    const res = await axiosInstance.get(`/api/lesson-histories/lesson/${lessonId}/user/${userId}`);
    return res.data;
  },

  findOne: async (id: number): Promise<LessonHistory> => {
    const res = await axiosInstance.get(`/api/lesson-histories/${id}`);
    return res.data;
  },

  update: async (id: number, data: UpdateLessonHistoryDto): Promise<LessonHistory> => {
    const res = await axiosInstance.patch(`/api/lesson-histories/${id}`, data);
    return res.data;
  },

  remove: async (id: number) => {
    const res = await axiosInstance.delete(`/api/lesson-histories/${id}`);
    return res.data;
  },

  restore: async (id: number) => {
    const res = await axiosInstance.patch(`/api/lesson-histories/${id}/restore`);
    return res.data;
  },
};
