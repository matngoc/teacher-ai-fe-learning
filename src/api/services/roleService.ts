import axiosInstance from '../axiosInstance';
import type {
  AssignPermissionsDto,
  CreatePermissionDto,
  CreateRoleDto,
  PageData,
  PageRequest,
  Role,
  UpdateRoleDto,
} from '../types';

export const roleService = {
  create: async (data: CreateRoleDto): Promise<Role> => {
    const res = await axiosInstance.post('/api/roles', data);
    return res.data;
  },

  findPage: async (data: PageRequest): Promise<PageData<Role>> => {
    const res = await axiosInstance.post('/api/roles/page', data);
    return res.data;
  },

  findOne: async (id: number) => {
    const res = await axiosInstance.get(`/api/roles/${id}`);
    return res.data;
  },

  update: async (id: number, data: UpdateRoleDto) => {
    const res = await axiosInstance.patch(`/api/roles/${id}`, data);
    return res.data;
  },

  remove: async (id: number) => {
    const res = await axiosInstance.delete(`/api/roles/${id}`);
    return res.data;
  },

  assignPermissions: async (id: number, data: AssignPermissionsDto) => {
    const res = await axiosInstance.patch(`/api/roles/${id}/permissions`, data);
    return res.data;
  },

  findAllPermissions: async () => {
    const res = await axiosInstance.get('/api/roles/permissions/all');
    return res.data;
  },

  createPermission: async (data: CreatePermissionDto) => {
    const res = await axiosInstance.post('/api/roles/permissions', data);
    return res.data;
  },

  removePermission: async (id: number) => {
    const res = await axiosInstance.delete(`/api/roles/permissions/${id}`);
    return res.data;
  },
};
