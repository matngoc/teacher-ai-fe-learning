import React from 'react';
import { type MenuProps } from 'antd';
import { BookOutlined, DashboardOutlined, ReadOutlined } from '@ant-design/icons';
import AppLayoutShell from './AppLayoutShell';

const menuItems: MenuProps['items'] = [
  { key: '/user/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/user/courses', icon: <ReadOutlined />, label: 'Khóa học' }
];

const UserLayout: React.FC = () => {
  return (
    <AppLayoutShell
      menuItems={menuItems}
      roleTag='USER'
      roleText='User'
      profilePath='/user/profile'
      changePasswordPath='/user/change-password'
    />
  );
};

export default UserLayout;
