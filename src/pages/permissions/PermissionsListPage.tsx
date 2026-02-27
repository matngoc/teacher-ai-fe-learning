import React, { useCallback, useEffect, useState } from 'react';
import { Tag, message } from 'antd';
import type { TableColumnType } from 'antd';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { fetchAllPermissions, createPermissionThunk, deletePermissionThunk } from '../../stores/permissionsSlice';
import BaseTable from '../../core/components/BaseTable';
import BaseSearchBar from '../../core/components/BaseSearchBar';
import BasePageHeader from '../../core/components/BasePageHeader';
import BaseModal from '../../core/components/BaseModal';
import { Form, Input } from 'antd';
import type { Permission, CreatePermissionDto } from '../../api/types';

const PermissionsListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.permissions);
  const [keyword, setKeyword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchAllPermissions());
  }, [dispatch]);

  const filtered = keyword
    ? items.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword.toLowerCase()) ||
          p.resource.toLowerCase().includes(keyword.toLowerCase()) ||
          p.action.toLowerCase().includes(keyword.toLowerCase()),
      )
    : items;

  const handleDelete = async (id: number) => {
    const result = await dispatch(deletePermissionThunk(id));
    if (deletePermissionThunk.fulfilled.match(result)) {
      message.success('Xóa permission thành công!');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const result = await dispatch(createPermissionThunk(values as CreatePermissionDto));
      if (createPermissionThunk.fulfilled.match(result)) {
        message.success('Tạo permission thành công!');
        form.resetFields();
        setModalOpen(false);
      }
    } catch {
      // form validation
    }
  };

  const columns: TableColumnType<Permission>[] = [
    { title: '#', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Tên', dataIndex: 'name', key: 'name', render: (v) => <strong>{v}</strong> },
    { title: 'Resource', dataIndex: 'resource', key: 'resource', render: (v) => <Tag color="blue">{v}</Tag> },
    { title: 'Action', dataIndex: 'action', key: 'action', render: (v) => <Tag color="green">{v}</Tag> },
    { title: 'Mô tả', dataIndex: 'description', key: 'description', render: (v) => v || '—' },
  ];

  return (
    <div>
      <BasePageHeader title="Quản lý Permissions" onAdd={() => setModalOpen(true)} />
      <div className="mb-4">
        <BaseSearchBar placeholder="Tìm theo name, resource, action..." onSearch={setKeyword} />
      </div>
      <BaseTable<Permission>
        columns={columns}
        dataSource={filtered}
        loading={loading}
        actionConfig={{ onDelete: handleDelete }}
      />
      <BaseModal
        title="Thêm Permission mới"
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item label="Tên permission" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input placeholder="users:read" />
          </Form.Item>
          <Form.Item label="Resource" name="resource" rules={[{ required: true, message: 'Vui lòng nhập resource!' }]}>
            <Input placeholder="users" />
          </Form.Item>
          <Form.Item label="Action" name="action" rules={[{ required: true, message: 'Vui lòng nhập action!' }]}>
            <Input placeholder="read" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={2} placeholder="Mô tả" />
          </Form.Item>
        </Form>
      </BaseModal>
    </div>
  );
};

export default PermissionsListPage;
