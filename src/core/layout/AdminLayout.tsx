import React, { useState } from 'react';
import {
  Avatar,
  Dropdown,
  Layout,
  Menu,
  type MenuProps,
  theme,
  Typography,
} from 'antd';
import {
  DashboardOutlined,
  DatabaseOutlined,
  FolderOutlined,
  KeyOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ReadOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '~/stores/hooks.ts';
import { logoutThunk } from '~/stores/authSlice.ts';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems: MenuProps['items'] = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/admin/courses', icon: <ReadOutlined />, label: 'Khóa học' },
];

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { token } = theme.useToken();

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: 'Hồ sơ', onClick: () => navigate('/admin/profile') },
    { key: 'change-password', icon: <KeyOutlined />, label: 'Đổi mật khẩu', onClick: () => navigate('/admin/change-password') },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: handleLogout },
  ];

  const selectedKeys = [location.pathname];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} style={{ background: token.colorBgContainer }} width={220} theme="light">
        <div className="flex items-center justify-center py-4 px-2 border-b border-gray-100" style={{ height: 64 }}>
          {!collapsed ? (
            <Text strong className="text-lg text-green-600">HanaTalk</Text>
          ) : (
            <Text strong className="text-green-600"></Text>
          )}
        </div>
        <Menu mode="inline" selectedKeys={selectedKeys} items={menuItems} onClick={({ key }) => navigate(key)} style={{ borderRight: 0, marginTop: 8 }} />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: token.colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
          <button onClick={() => setCollapsed(!collapsed)} className="text-lg bg-transparent border-none cursor-pointer text-gray-600 hover:text-green-500">
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
            <div className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-50">
              <Avatar src={user?.avatarUrl} icon={<UserOutlined />} size="small" className="bg-green-500" />
              <Text className="text-sm">{user?.username || 'Admin'}</Text>
              <Text type="secondary" className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">Admin</Text>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ padding: 24, background: token.colorBgLayout, minHeight: 280, overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
