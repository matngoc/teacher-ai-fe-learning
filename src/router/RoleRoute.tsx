import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../stores/hooks';
import { Result, Button, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ROLE_HOME: Record<string, string> = {
  SUPER_ADMIN: '/super-admin/dashboard',
  ADMIN: '/admin/dashboard',
  USER: '/user/dashboard',
};

const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, initializing } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Đang fetch profile sau reload → chờ, không render 403 vội
  if (initializing || (isAuthenticated && !user)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Đang tải thông tin người dùng..." />
      </div>
    );
  }

  const userRoles = user?.roles?.map((r) => r.name) || [];
  const hasAccess = allowedRoles.some((role) => userRoles.includes(role))

  if (!hasAccess) {
    const firstRole = userRoles[0]
    const redirectPath = firstRole ? ROLE_HOME[firstRole] : '/dashboard'
    return (
      <Result
        status='403'
        title='403'
        subTitle='Bạn không có quyền truy cập trang này.'
        extra={
          <Button type='primary' onClick={() => navigate(redirectPath)}>
            Về trang chủ
          </Button>
        }
      />
    )
  }

  return <>{children}</>;
};

export default RoleRoute;
