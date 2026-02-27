import React, { useEffect, useRef } from 'react';
import { Form, Input, Select } from 'antd';
import BaseModal from '../../core/components/BaseModal';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { usersActions } from '../../stores/usersSlice';
import { rolesActions } from '../../stores/rolesSlice';
import type { CreateUserDto, UpdateUserDto, User } from '../../api/types';

interface UserFormModalProps {
  open: boolean;
  record: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ open, record, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((s) => s.users);
  const { items: roles } = useAppSelector((s) => s.roles);
  const [form] = Form.useForm();
  const isEdit = !!record;
  const prevOpen = useRef(false);


  useEffect(() => {
    if (open && !prevOpen.current) {
      dispatch(rolesActions.fetchList({ page: 1, size: 100 }));
    }
    prevOpen.current = open;
    if (!open) {
      form.resetFields();
    } else if (record) {
      form.setFieldsValue({
        ...record,
        roleIds: record.roles?.map((r) => r.id),
      });
    }
  }, [open, record, form, dispatch]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (isEdit && record) {
        const { username: _, email: __, password: ___, ...updateData } = values;
        const result = await dispatch(usersActions.updateItem({ id: record.id, data: updateData as UpdateUserDto }));
        if (usersActions.updateItem.fulfilled.match(result)) {
          onSuccess();
        }
      } else {
        const result = await dispatch(usersActions.createItem(values as CreateUserDto));
        if (usersActions.createItem.fulfilled.match(result)) {
          onSuccess();
        }
      }
    } catch {
      // form validation error
    }
  };

  return (
    <BaseModal
      title={isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item label="Tên đăng nhập" name="username" rules={[{ required: !isEdit, message: 'Vui lòng nhập tên đăng nhập!' }]}>
          <Input placeholder="Tên đăng nhập" disabled={isEdit} />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ required: !isEdit, type: 'email', message: 'Email không hợp lệ!' }]}>
          <Input placeholder="Email" disabled={isEdit} />
        </Form.Item>
        {!isEdit && (
          <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' }]}>
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>
        )}
        <Form.Item label="Họ" name="firstName">
          <Input placeholder="Họ" />
        </Form.Item>
        <Form.Item label="Tên" name="lastName">
          <Input placeholder="Tên" />
        </Form.Item>
        {isEdit && (
          <Form.Item label="Trạng thái" name="status">
            <Select options={[
              { label: 'Hoạt động', value: 'ACTIVE' },
              { label: 'Khóa', value: 'LOCKED' },
              { label: 'Đã xóa', value: 'DELETED' },
            ]} />
          </Form.Item>
        )}
        <Form.Item label="Roles" name="roleIds">
          <Select
            mode="multiple"
            placeholder="Chọn roles"
            options={roles.map((r) => ({ label: r.name, value: r.id }))}
            allowClear
          />
        </Form.Item>
      </Form>
    </BaseModal>
  );
};

export default UserFormModal;
