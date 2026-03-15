import React from 'react';
import { type MenuProps } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import AppLayoutShell from './AppLayoutShell';

const menuItems: MenuProps['items'] = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/admin/courses', icon: <ReadOutlined />, label: 'Khóa học' },
  { key: '/admin/lessons', icon: <FileTextOutlined />, label: 'Bài học' }
]

const AdminLayout: React.FC = () => {
  return (
    <AppLayoutShell
      menuItems={menuItems}
      roleTag='ADMIN'
      roleText='Admin'
      profilePath='/admin/profile'
      changePasswordPath='/admin/change-password'
    />
  )
};

export default AdminLayout;
