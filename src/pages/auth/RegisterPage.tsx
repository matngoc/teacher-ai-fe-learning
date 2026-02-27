import React, { useEffect } from 'react';
import { Button, Card, Form, Input, Typography, Alert, message } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '~/stores/hooks.ts';
import { registerThunk, clearError } from '~/stores/authSlice.ts';
import type { RegisterDto } from '~/api/types.ts';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);

  useEffect(() => {
    return () => { dispatch(clearError()) };
  }, [dispatch]);

  const onFinish = async (values: RegisterDto & { confirmPassword: string }) => {
    const { confirmPassword: _, ...data } = values;
    const result = await dispatch(registerThunk(data));
    if (registerThunk.fulfilled.match(result)) {
      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <Card className="w-full max-w-md shadow-lg rounded-2xl" bodyStyle={{ padding: 40 }}>
        <div className="text-center mb-8">
          <div className="text-5xl mb-3"></div>
          <Title level={2} className="!mb-1">Đăng ký</Title>
          <Text type="secondary">Tạo tài khoản HanaTalk</Text>
        </div>

        {error && (
          <Alert message={error} type="error" showIcon className="mb-4" closable onClose={() => dispatch(clearError())} />
        )}

        <Form layout="vertical" onFinish={onFinish} autoComplete="off" size="large">
          <Form.Item name="username" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
          </Form.Item>
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item name="firstName">
            <Input prefix={<UserOutlined />} placeholder="Họ" />
          </Form.Item>
          <Form.Item name="lastName">
            <Input prefix={<UserOutlined />} placeholder="Tên" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('Mật khẩu không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block className="rounded-lg h-11">
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-2">
          <Text type="secondary">Đã có tài khoản? </Text>
          <Link to="/login">Đăng nhập</Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
