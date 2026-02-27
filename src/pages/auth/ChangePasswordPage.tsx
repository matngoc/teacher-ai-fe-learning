import React from 'react';
import { Button, Card, Form, Input, Typography, message, Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { changePasswordThunk, clearError } from '../../stores/authSlice';
import type { ChangePasswordDto } from '../../api/types';
import BasePageHeader from '../../core/components/BasePageHeader';

const { Text } = Typography;

const ChangePasswordPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);
  const [form] = Form.useForm();

  const onFinish = async (values: ChangePasswordDto & { confirmNewPassword: string }) => {
    const { confirmNewPassword: _, ...data } = values;
    const result = await dispatch(changePasswordThunk(data));
    if (changePasswordThunk.fulfilled.match(result)) {
      message.success('Đổi mật khẩu thành công!');
      form.resetFields();
    }
  };

  return (
    <div>
      <BasePageHeader title="Đổi mật khẩu" />
      <Card className="max-w-md">
        {error && (
          <Alert message={error} type="error" showIcon className="mb-4" closable onClose={() => dispatch(clearError())} />
        )}
        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <Form.Item label="Mật khẩu hiện tại" name="currentPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu hiện tại" />
          </Form.Item>
          <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" />
          </Form.Item>
          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmNewPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('Mật khẩu không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu mới" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Cập nhật mật khẩu
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default ChangePasswordPage;
