import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../api/services/authService';
import { userService } from '../api/services/userService';
import type { ChangePasswordDto, LoginDto, RegisterDto, UpdateProfileDto, User } from '../api/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initializing: boolean; // true khi đang fetch profile sau reload
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,
  initializing: !!localStorage.getItem('accessToken'),
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (data: LoginDto, { rejectWithValue }) => {
    try {
      const res = await authService.login(data);
      // Interceptor đã unwrap envelope → res = { accessToken, refreshToken, user? }
      if (!res?.accessToken) {
        return rejectWithValue('Phản hồi từ server không hợp lệ. Vui lòng thử lại.');
      }
      if (!res.user) {
        localStorage.setItem('accessToken', res.accessToken);
        if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
        const user: User = await authService.getProfile();
        return { ...res, user };
      }
      return res;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  },
);

export const googleLoginThunk = createAsyncThunk(
  'auth/googleLogin',
  async (googleAccessToken: string, { rejectWithValue }) => {
    try {
      const res = await authService.googleTokenLogin(googleAccessToken);
      const raw = res as unknown as Record<string, unknown>;
      const accessToken = (raw['accessToken'] ?? raw['access_token']) as string | undefined;
      const refreshToken = ((raw['refreshToken'] ?? raw['refresh_token']) ?? '') as string;

      if (!accessToken) {
        return rejectWithValue('Google login thất bại. Vui lòng thử lại.');
      }

      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

      const user: User = await authService.getProfile();
      return { accessToken, refreshToken, user };
    } catch (error: unknown) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Đăng nhập Google thất bại');
    }
  },
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (data: RegisterDto, { rejectWithValue }) => {
    try {
      const res = await authService.register(data);
      return res;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Đăng ký thất bại');
    }
  },
);

export const getProfileThunk = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authService.getProfile();
      return res;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Lấy thông tin thất bại');
    }
  },
);

export const changePasswordThunk = createAsyncThunk(
  'auth/changePassword',
  async (data: ChangePasswordDto, { rejectWithValue }) => {
    try {
      const res = await authService.changePassword(data);
      return res;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    }
  },
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Đăng xuất thất bại');
    }
  },
);

export const updateProfileThunk = createAsyncThunk(
  'auth/updateProfile',
  async (data: UpdateProfileDto, { rejectWithValue }) => {
    try {
      const res = await userService.updateMyProfile(data);
      return res;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Cập nhật thông tin thất bại');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string; user: User }>,
    ) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    clearError(state) {
      state.error = null;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user ?? null;
        state.isAuthenticated = true;
        state.initializing = !action.payload.user;
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Google Login (same shape as loginThunk)
      .addCase(googleLoginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLoginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.initializing = false;
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(googleLoginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Profile
      .addCase(getProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.initializing = false;
      })
      .addCase(getProfileThunk.rejected, (state) => {
        // Token không hợp lệ → clear auth
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.initializing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      // Logout
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.initializing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      // Update Profile
      .addCase(updateProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = state.user ? { ...state.user, ...action.payload } : action.payload;
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCredentials, clearAuth, clearError, setError } = authSlice.actions;
export default authSlice.reducer;
