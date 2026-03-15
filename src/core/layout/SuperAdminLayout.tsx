import React from 'react';
import { type MenuProps } from 'antd';
import {
  BookOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  FolderOutlined,
  KeyOutlined,
  SafetyOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import AppLayoutShell from './AppLayoutShell';

const menuItems: MenuProps['items'] = [
  {
    key: '/super-admin/dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: 'system',
    icon: <SettingOutlined />,
    label: 'Hệ thống',
    children: [
      { key: '/super-admin/users', icon: <TeamOutlined />, label: 'Người dùng' },
      { key: '/super-admin/roles', icon: <SafetyOutlined />, label: 'Roles' },
      { key: '/super-admin/permissions', icon: <KeyOutlined />, label: 'Phân quyền' },
    ],
  },
  {
    key: '/super-admin/courses',
    icon: <BookOutlined />,
    label: 'Khóa học',
  },
  {
    key: '/super-admin/dictionary',
    icon: <DatabaseOutlined />,
    label: 'Từ điển',
  },
  {
    key: '/super-admin/storage',
    icon: <FolderOutlined />,
    label: 'Lưu trữ',
  },
];

const SuperAdminLayout: React.FC = () => {
  return (
    <AppLayoutShell
      menuItems={menuItems}
      roleTag='SUPER ADMIN'
      roleText='Super Admin'
      profilePath='/super-admin/profile'
      changePasswordPath='/super-admin/change-password'
      defaultOpenKeys={['system']}
    />
  );
};

export default SuperAdminLayout;
