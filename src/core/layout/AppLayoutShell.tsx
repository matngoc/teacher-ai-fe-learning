import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Drawer,
  Dropdown,
  Grid,
  Layout,
  Menu,
  type MenuProps,
  Tag,
  Typography,
} from 'antd';
import {
  KeyOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { logoutThunk } from '~/stores/authSlice';
import { useAppDispatch, useAppSelector } from '~/stores/hooks';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface AppLayoutShellProps {
  menuItems: MenuProps['items'];
  roleTag: string;
  roleText: string;
  profilePath: string;
  changePasswordPath: string;
  defaultOpenKeys?: string[];
}

const shellBgStyle: React.CSSProperties = {
  minHeight: '100vh',
  backgroundImage:
    "linear-gradient(135deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.35) 45%, rgba(255, 255, 255, 0.55) 100%), url('/background.jpg')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'fixed',
};

const sidebarStyle: React.CSSProperties = {
  borderRight: '1px solid rgba(0,0,0,0.06)',
  backgroundImage:
    "linear-gradient(135deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.85) 45%, rgba(255, 255, 255, 0.55) 100%), url('/background.jpg')",
}

const headerStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px',
  borderBottom: '1px solid rgba(0,0,0,0.08)',
  backgroundImage:
    "linear-gradient(135deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.85) 45%, rgba(255, 255, 255, 0.55) 100%), url('/background.jpg')",
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)'
}

const AppLayoutShell: React.FC<AppLayoutShellProps> = ({
  menuItems,
  roleTag,
  roleText,
  profilePath,
  changePasswordPath,
  defaultOpenKeys,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const screens = Grid.useBreakpoint();

  const isMobile = !screens.lg;

  const selectedKeys = useMemo(() => [location.pathname], [location.pathname]);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: 'Hồ sơ', onClick: () => navigate(profilePath) },
    {
      key: 'change-password',
      icon: <KeyOutlined />,
      label: 'Đổi mật khẩu',
      onClick: () => navigate(changePasswordPath),
    },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: handleLogout },
  ];

  const logo = (
    <div
      style={{
        height: 64,
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
        gap: 10,
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <img src='/logo.png' alt='HanaTalk' style={{ height: 36, width: 36, objectFit: 'contain' }} />
      {(!collapsed || isMobile) && (
        <div style={{ lineHeight: 1.1 }}>
          <Text strong style={{ display: 'block', color: '#1f3f7f' }}>
            HanaTalk
          </Text>
          <Text style={{ fontSize: 10, color: '#5b6f98', letterSpacing: 0.5 }}>{roleTag}</Text>
        </div>
      )}
    </div>
  );

  const menu = (
    <Menu
      mode='inline'
      selectedKeys={selectedKeys}
      defaultOpenKeys={defaultOpenKeys}
      items={menuItems}
      onClick={({ key }) => {
        navigate(key);
        if (isMobile) {
          setMobileMenuOpen(false);
        }
      }}
      style={{ borderRight: 0, background: 'transparent', marginTop: 8 }}
    />
  );

  return (
    <Layout style={shellBgStyle}>
      {!isMobile && (
        <Sider trigger={null} collapsible collapsed={collapsed} width={240} theme='light' style={sidebarStyle}>
          {logo}
          {menu}
        </Sider>
      )}

      <Drawer
        title={null}
        placement='left'
        open={isMobile && mobileMenuOpen}
        width={280}
        onClose={() => setMobileMenuOpen(false)}
        styles={{ body: { padding: 0, background: '#f9fcff' } }}
      >
        {logo}
        {menu}
      </Drawer>

      <Layout>
        <Header style={headerStyle}>
          <Button
            type='text'
            icon={isMobile || collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => {
              if (isMobile) {
                setMobileMenuOpen(true);
              } else {
                setCollapsed((prev) => !prev);
              }
            }}
          />

          <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.7)',
              }}
            >
              <Badge dot status='success' offset={[-2, 24]}>
                <Avatar
                  src={user?.profile?.avatarUrl}
                  icon={<UserOutlined />}
                  size='small'
                  style={{ background: 'linear-gradient(135deg,#4f7fff,#7f60ff)' }}
                />
              </Badge>
              <div style={{ lineHeight: 1.2 }}>
                <Text style={{ display: 'block', fontSize: 13 }}>{user?.username || roleText}</Text>
                <Tag color='blue' style={{ margin: 0, fontSize: 10, lineHeight: '16px' }}>
                  {roleText}
                </Tag>
              </div>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ padding: isMobile ? 12 : 20, minHeight: 280, overflow: 'auto' }}>
          <div
            style={{
              minHeight: 'calc(100vh - 104px)',
              borderRadius: 14,
              padding: isMobile ? 12 : 16,
              background: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayoutShell;

