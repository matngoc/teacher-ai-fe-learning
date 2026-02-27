import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAppDispatch, useAppSelector } from '../stores/hooks';
import { getProfileThunk } from '../stores/authSlice';

/**
 * RoleRedirect: after login, redirect users to the correct layout root
 * based on their roles fetched from the backend.
 */
const RoleRedirect: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    const redirect = async () => {
      let u = user;
      if (!u) {
        const result = await dispatch(getProfileThunk());
        if (getProfileThunk.fulfilled.match(result)) {
          u = result.payload;
          console.log(u);
        }
      }

      const roles = u?.roles?.map((r) => r.name) || [];

      if (roles.includes('SUPER_ADMIN')) {
        navigate('/super-admin/dashboard', { replace: true });
      } else if (roles.includes('ADMIN')) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/user/dashboard', { replace: true });
      }
    };

    redirect();
  }, [isAuthenticated, user, dispatch, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spin size="large" tip="Đang tải..." />
    </div>
  );
};

export default RoleRedirect;
