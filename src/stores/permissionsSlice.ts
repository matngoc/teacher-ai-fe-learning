import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { roleService } from '../api/services/roleService';
import type { CreatePermissionDto, Permission } from '../api/types';

interface PermissionsState {
  items: Permission[];
  loading: boolean;
  error: string | null;
}

const initialState: PermissionsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchAllPermissions = createAsyncThunk(
  'permissions/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await roleService.findAllPermissions();
      return res as Permission[];
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Lấy permissions thất bại');
    }
  },
);

export const createPermissionThunk = createAsyncThunk(
  'permissions/create',
  async (data: CreatePermissionDto, { rejectWithValue }) => {
    try {
      const res = await roleService.createPermission(data);
      return res as Permission;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Tạo permission thất bại');
    }
  },
);

export const deletePermissionThunk = createAsyncThunk(
  'permissions/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await roleService.removePermission(id);
      return id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Xóa permission thất bại');
    }
  },
);

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPermissionThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deletePermissionThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      });
  },
});

export default permissionsSlice.reducer;
