import React, { useEffect } from 'react';
import { Form, Input, Switch, Select } from 'antd';
import BaseModal from '../../core/components/BaseModal';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { rolesActions } from '../../stores/rolesSlice';
import { fetchAllPermissions } from '../../stores/permissionsSlice';
import type { CreateRoleDto, UpdateRoleDto, Role } from '../../api/types';

interface RoleFormModalProps {
  open: boolean;
  record: Role | null;
  onClose: () => void;
  onSuccess: () => void;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({ open, record, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((s) => s.roles);
  const { items: permissions } = useAppSelector((s) => s.permissions);
  const [form] = Form.useForm();
  const isEdit = !!record;


  useEffect(() => {
    if (open) {
      dispatch(fetchAllPermissions());
      if (record) {
        form.setFieldsValue({ ...record, permissionIds: record.permissions?.map((p) => p.id) });
      } else {
        form.resetFields();
      }
    } else {
      form.resetFields();
    }
  }, [open, record, form, dispatch]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (isEdit && record) {
        const result = await dispatch(rolesActions.updateItem({ id: record.id, data: values as UpdateRoleDto }));
        if (rolesActions.updateItem.fulfilled.match(result)) {
          onSuccess();
        }
      } else {
        const result = await dispatch(rolesActions.createItem(values as CreateRoleDto));
        if (rolesActions.createItem.fulfilled.match(result)) {
          onSuccess();
        }
      }
    } catch {
      // form validation error
    }
  };

  return (
    <BaseModal
      title={isEdit ? 'Chỉnh sửa Role' : 'Thêm Role mới'}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item label="Tên role" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên role!' }]}>
          <Input placeholder="admin, editor, ..." />
        </Form.Item>
        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={3} placeholder="Mô tả role" />
        </Form.Item>
        {!isEdit && (
          <Form.Item label="System role" name="isSystem" valuePropName="checked" initialValue={false}>
            <Switch />
          </Form.Item>
        )}
        <Form.Item label="Permissions" name="permissionIds">
          <Select
            mode="multiple"
            placeholder="Chọn permissions"
            allowClear
            options={permissions.map((p) => ({ label: `${p.resource}:${p.action}`, value: p.id }))}
          />
        </Form.Item>
      </Form>
    </BaseModal>
  );
};

export default RoleFormModal;
