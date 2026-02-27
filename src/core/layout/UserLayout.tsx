import React from 'react';
import { Avatar, Dropdown, Layout, Menu, type MenuProps, theme, Typography } from 'antd';
import { KeyOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { logoutThunk } from '../../stores/authSlice';

const { Header, Content } = Layout;
const { Text } = Typography;

const UserLayout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { token } = theme.useToken();

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/login');
  };

  const navItems: MenuProps['items'] = [
    { key: '/user/dashboard', label: 'Dashboard' },
    { key: '/user/courses', label: 'Khóa học' },
  ];

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: 'Hồ sơ', onClick: () => navigate('/user/profile') },
    { key: 'change-password', icon: <KeyOutlined />, label: 'Đổi mật khẩu', onClick: () => navigate('/user/change-password') },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: handleLogout },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: token.colorBgContainer, borderBottom: `1px solid ${token.colorBorderSecondary}`, padding: '0 24px' }}>
        <div className="flex items-center gap-4">
          <Text strong className="text-blue-600 text-lg">HanaTalk</Text>
          <Menu mode="horizontal" items={navItems} onClick={({ key }) => navigate(key)} style={{ border: 'none', background: 'transparent' }} />
        </div>
        <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
          <div className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-50">
            <Avatar src={user?.avatarUrl} icon={<UserOutlined />} size="small" className="bg-blue-400" />
            <Text className="text-sm">{user?.username}</Text>
          </div>
        </Dropdown>
      </Header>
      <Content style={{ padding: 24, background: token.colorBgLayout }}>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default UserLayout;
