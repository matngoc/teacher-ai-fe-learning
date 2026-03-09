import React, { useEffect } from 'react';
import { Button, Card, Form, Input, Typography, Alert, Divider } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAppDispatch, useAppSelector } from '~/stores/hooks.ts';
import { loginThunk, clearError, googleLoginThunk, setError } from '~/stores/authSlice.ts';
import type { LoginDto } from '~/api/types.ts';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/redirect', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onFinish = async (values: LoginDto) => {
    const result = await dispatch(
      loginThunk({ ...values, deviceInfo: navigator.userAgent }),
    );
    if (loginThunk.fulfilled.match(result)) {
      navigate('/redirect', { replace: true });
    }
  };

  // Google OAuth popup flow: lấy access_token rồi gửi lên backend
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const result = await dispatch(googleLoginThunk(tokenResponse.access_token));
      if (googleLoginThunk.fulfilled.match(result)) {
        navigate('/redirect', { replace: true });
      }
    },
    onError: () => {
      dispatch(setError('Đăng nhập Google thất bại. Vui lòng thử lại.'));
    },
    flow: 'implicit', // lấy access_token ngay, không cần code exchange
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-lg rounded-2xl" styles={{ body: { padding: 40 } }}>
        <div className="text-center mb-8">
          <div className="text-5xl mb-3"></div>
          <Title level={2} className="!mb-1">HanaTalk</Title>
          <Text type="secondary">Đăng nhập vào hệ thống quản trị</Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="mb-4"
            closable
            onClose={() => dispatch(clearError())}
          />
        )}

        <Form layout="vertical" onFinish={onFinish} autoComplete="off" size="large">
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item className="mb-2">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="rounded-lg h-11"
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>
          <Text type="secondary" className="text-xs">hoặc</Text>
        </Divider>

        <Button
          block
          size="large"
          loading={loading}
          onClick={() => handleGoogleLogin()}
          className="rounded-lg h-11 flex items-center justify-center gap-2 border border-gray-300 hover:border-blue-400 hover:text-blue-500"
          icon={
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.1 0 5.8 1.1 8 2.9l6-6C34.5 3.1 29.6 1 24 1 14.8 1 7 6.7 3.7 14.8l7 5.4C12.4 14 17.7 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.8-9.9 6.8-17.4z" />
              <path fill="#FBBC05" d="M10.7 28.8A14.6 14.6 0 0 1 9.5 24c0-1.7.3-3.3.8-4.8l-7-5.4A23.9 23.9 0 0 0 0 24c0 3.8.9 7.4 2.5 10.6l8.2-5.8z"/>
              <path fill="#34A853" d="M24 47c5.4 0 9.9-1.8 13.2-4.8l-7.4-5.7c-1.8 1.2-4.1 2-5.8 2-6.3 0-11.6-4.3-13.5-10.1l-8.2 5.8C7 41.3 14.8 47 24 47z"/>
            </svg>
          }
        >
          Đăng nhập với Google
        </Button>

        <div className="text-center mt-4">
          <Text type="secondary">Chưa có tài khoản? </Text>
          <Link to="/register">Đăng ký ngay</Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
