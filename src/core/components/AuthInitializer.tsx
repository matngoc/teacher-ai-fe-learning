import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '~/stores/hooks.ts';
import { getProfileThunk } from '~/stores/authSlice.ts';
import type { RootState } from '~/stores/rootReducer.ts';

/**
 * Chạy 1 lần khi app khởi động:
 * Nếu có accessToken trong localStorage (user đã đăng nhập trước đó)
 * nhưng Redux store chưa có user (do reload) → gọi getProfile để restore.
 */
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((s: RootState) => s.auth);

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(getProfileThunk());
    }
  }, []); // chỉ chạy 1 lần khi mount

  return <>{children}</>;
};

export default AuthInitializer;
