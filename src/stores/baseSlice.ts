import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { PageData } from '../api/types';

export interface PageParams {
  page?: number;
  size?: number;
  keyword?: string;
  [key: string]: unknown;
}

export interface BaseState<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  selected: T | null;
  successMessage: string | null;
}

export interface ServiceMethods<T, CreateDto, UpdateDto> {
  findPage: (params: PageParams) => Promise<PageData<T>>;
  findOne?: (id: number) => Promise<T>;
  create: (data: CreateDto) => Promise<T>;
  update: (id: number, data: UpdateDto) => Promise<T>;
  remove: (id: number) => Promise<unknown>;
  restore?: (id: number) => Promise<unknown>;
}

/** Extract _apiMessage injected by axiosInstance interceptor */
function extractMessage(data: unknown): string | undefined {
  if (data !== null && typeof data === 'object') {
    return (data as Record<string, unknown>)['_apiMessage'] as string | undefined;
  }
  return undefined;
}

function createBaseSlice<T extends { id: number }, CreateDto, UpdateDto>(
  name: string,
  service: ServiceMethods<T, CreateDto, UpdateDto>,
) {
  const initialState: BaseState<T> = {
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    loading: false,
    error: null,
    selected: null,
    successMessage: null,
  };

  const fetchList = createAsyncThunk(
    `${name}/fetchList`,
    async (params: PageParams, { rejectWithValue }) => {
      try {
        const res = await service.findPage(params);
        return {
          items: res.items ?? [],
          total: res.total ?? 0,
          page: res.page ?? params.page ?? 1,
          pageSize: res.size ?? params.size ?? 10,
        };
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } }; apiMessage?: string; message?: string };
        return rejectWithValue(err.apiMessage || err.response?.data?.message || 'Lấy danh sách thất bại');
      }
    },
  );

  const fetchOne = service.findOne
    ? createAsyncThunk(
        `${name}/fetchOne`,
        async (id: number, { rejectWithValue }) => {
          try {
            return await service.findOne!(id);
          } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; apiMessage?: string };
            return rejectWithValue(err.apiMessage || err.response?.data?.message || 'Lấy chi tiết thất bại');
          }
        },
      )
    : null;

  const createItem = createAsyncThunk(
    `${name}/createItem`,
    async (data: CreateDto, { rejectWithValue }) => {
      try {
        const result = await service.create(data);
        return { data: result, message: extractMessage(result) || 'Tạo mới thành công' };
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } }; apiMessage?: string; message?: string };
        return rejectWithValue(err.apiMessage || err.response?.data?.message || 'Tạo mới thất bại');
      }
    },
  );

  const updateItem = createAsyncThunk(
    `${name}/updateItem`,
    async ({ id, data }: { id: number; data: UpdateDto }, { rejectWithValue }) => {
      try {
        const result = await service.update(id, data);
        return { data: result, message: extractMessage(result) || 'Cập nhật thành công' };
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } }; apiMessage?: string; message?: string };
        return rejectWithValue(err.apiMessage || err.response?.data?.message || 'Cập nhật thất bại');
      }
    },
  );

  const deleteItem = createAsyncThunk(
    `${name}/deleteItem`,
    async (id: number, { rejectWithValue }) => {
      try {
        const result = await service.remove(id);
        return { id, message: extractMessage(result) || 'Xóa thành công' };
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } }; apiMessage?: string; message?: string };
        return rejectWithValue(err.apiMessage || err.response?.data?.message || 'Xóa thất bại');
      }
    },
  );

  const restoreItem = service.restore
    ? createAsyncThunk(
        `${name}/restoreItem`,
        async (id: number, { rejectWithValue }) => {
          try {
            const result = await service.restore!(id);
            return { id, message: extractMessage(result) || 'Khôi phục thành công' };
          } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; apiMessage?: string; message?: string };
            return rejectWithValue(err.apiMessage || err.response?.data?.message || 'Khôi phục thất bại');
          }
        },
      )
    : null;

  const slice = createSlice({
    name,
    initialState,
    reducers: {
      setSelected(state, action: PayloadAction<T | null>) {
        state.selected = action.payload as typeof state.selected;
      },
      clearError(state) {
        state.error = null;
      },
      clearSuccessMessage(state) {
        state.successMessage = null;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchList.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchList.fulfilled, (state, action) => {
          state.loading = false;
          state.items = action.payload.items as unknown as typeof state.items;
          state.total = action.payload.total;
          state.page = action.payload.page;
          state.pageSize = action.payload.pageSize;
        })
        .addCase(fetchList.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        })
        .addCase(createItem.pending, (state) => { state.loading = true; state.error = null; })
        .addCase(createItem.fulfilled, (state, action) => {
          state.loading = false;
          state.successMessage = action.payload.message;
        })
        .addCase(createItem.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        })
        .addCase(updateItem.pending, (state) => { state.loading = true; state.error = null; })
        .addCase(updateItem.fulfilled, (state, action) => {
          state.loading = false;
          state.successMessage = action.payload.message;
        })
        .addCase(updateItem.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        })
        .addCase(deleteItem.pending, (state) => { state.loading = true; state.error = null; })
        .addCase(deleteItem.fulfilled, (state, action) => {
          state.loading = false;
          state.successMessage = action.payload.message;
          state.items = state.items.filter((item) => item.id !== action.payload.id) as unknown as typeof state.items;
        })
        .addCase(deleteItem.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        });

      if (fetchOne) {
        builder.addCase(fetchOne.fulfilled, (state, action) => {
          state.selected = action.payload as unknown as typeof state.selected;
        });
      }

      if (restoreItem) {
        builder
          .addCase(restoreItem.fulfilled, (state, action) => {
            state.loading = false;
            state.successMessage = action.payload.message;
          })
          .addCase(restoreItem.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
          });
      }
    },
  });

  return {
    slice,
    actions: {
      ...slice.actions,
      fetchList,
      fetchOne,
      createItem,
      updateItem,
      deleteItem,
      restoreItem,
    },
  };
}

export default createBaseSlice;
