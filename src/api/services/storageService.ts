import axiosInstance from '../axiosInstance';

export const storageService = {
  uploadOne: async (file: File, folder = 'files') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const res = await axiosInstance.post('/api/storage/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  uploadMultiple: async (files: File[], folder = 'files') => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    formData.append('folder', folder);
    const res = await axiosInstance.post(
      '/api/storage/upload/multiple',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return res.data;
  },

  getPresignedUrl: async (id: number) => {
    const res = await axiosInstance.get(`/api/storage/${id}/presigned`);
    return res.data;
  },

  deleteFile: async (id: number) => {
    const res = await axiosInstance.delete(`/api/storage/${id}`);
    return res.data;
  },
};
