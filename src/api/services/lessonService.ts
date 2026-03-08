import axiosInstance from '../axiosInstance';
import type {
  Lesson,
  CreateLessonDto,
  UpdateLessonDto,
  LessonFilterDto,
  PageData,
} from '../types';

export const lessonService = {
  findPage: async (data: LessonFilterDto): Promise<PageData<Lesson>> => {
    const res = await axiosInstance.post('/api/lessons/page', data)
    return res.data
  },

  findOne: async (id: number): Promise<Lesson> => {
    const res = await axiosInstance.get(`/api/lessons/${id}`)
    return res.data
  },

  findByCourse: async (courseId: number): Promise<PageData<Lesson>> => {
    const res = await axiosInstance.get(`/api/lessons/course/${courseId}`)
    return res.data
  },

  findByCode: async (code: string): Promise<Lesson> => {
    const res = await axiosInstance.get(`/api/lessons/code/${code}`)
    return res.data
  },

  create: async (data: CreateLessonDto): Promise<Lesson> => {
    const res = await axiosInstance.post('/api/lessons', data)
    return res.data
  },

  update: async (id: number, data: UpdateLessonDto): Promise<Lesson> => {
    const res = await axiosInstance.patch(`/api/lessons/${id}`, data)
    return res.data
  },

  remove: async (id: number) => {
    const res = await axiosInstance.delete(`/api/lessons/${id}`)
    return res.data
  },

  restore: async (id: number) => {
    const res = await axiosInstance.patch(`/api/lessons/${id}/restore`)
    return res.data
  }
}
