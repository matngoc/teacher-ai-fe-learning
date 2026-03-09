import axiosInstance from '../axiosInstance';
import type {
  CreateDictionaryDto,
  Dictionary,
  PageData,
  PageRequest,
  UpdateDictionaryDto,
} from '../types';

export const dictionaryService = {
  create: async (data: CreateDictionaryDto): Promise<Dictionary> => {
    const res = await axiosInstance.post('/api/dictionaries', data);
    return res.data;
  },

  findPage: async (data: PageRequest): Promise<PageData<Dictionary>> => {
    const res = await axiosInstance.post('/api/dictionaries/page', data);
    return res.data;
  },

  findByType: async (type: string) => {
    const res = await axiosInstance.get(`/api/dictionaries/by-type/${type}`);
    return res.data;
  },

  findOne: async (id: number) => {
    const res = await axiosInstance.get(`/api/dictionaries/${id}`);
    return res.data;
  },

  update: async (id: number, data: UpdateDictionaryDto) => {
    const res = await axiosInstance.patch(`/api/dictionaries/${id}`, data);
    return res.data;
  },

  remove: async (id: number) => {
    const res = await axiosInstance.delete(`/api/dictionaries/${id}`);
    return res.data;
  },
};
