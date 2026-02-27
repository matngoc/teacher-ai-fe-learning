import React, { useCallback, useEffect, useState } from 'react';
import { Tag } from 'antd';
import type { TableColumnType } from 'antd';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { rolesActions } from '../../stores/rolesSlice';
import BaseTable from '../../core/components/BaseTable';
import BaseSearchBar from '../../core/components/BaseSearchBar';
import BasePageHeader from '../../core/components/BasePageHeader';
import RoleFormModal from './RoleFormModal';
import type { Role } from '../../api/types';
import { useToastMessages } from '../../core/hooks/useToastMessages';

const RolesListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, total, page, pageSize, loading, successMessage, error } = useAppSelector((s) => s.roles);
  const [keyword, setKeyword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Role | null>(null);

  useToastMessages(
    successMessage,
    error,
    () => dispatch(rolesActions.clearSuccessMessage()),
    () => dispatch(rolesActions.clearError()),
  );

  const fetchData = useCallback(
    (pg = page, size = pageSize, kw = keyword) => {
      dispatch(rolesActions.fetchList({ page: pg, size, keyword: kw }));
    },
    [dispatch, page, pageSize, keyword],
  );

  useEffect(() => { fetchData(1); }, []);

  const handleSearch = (val: string) => {
    setKeyword(val);
    fetchData(1, pageSize, val);
  };

  const handleEdit = (record: unknown) => {
    setSelected(record as Role);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await dispatch(rolesActions.deleteItem(id));
    if (rolesActions.deleteItem.fulfilled.match(result)) {
      fetchData();
    }
  };

  const columns: TableColumnType<Role>[] = [
    { title: '#', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Tên', dataIndex: 'name', key: 'name', render: (v) => <strong>{v}</strong> },
    { title: 'Mô tả', dataIndex: 'description', key: 'description', render: (v) => v || '—' },
    {
      title: 'System',
      dataIndex: 'isSystem',
      key: 'isSystem',
      render: (v) => v ? <Tag color="red">System</Tag> : <Tag>Custom</Tag>,
    },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (_, r) => r.permissions?.length
        ? r.permissions.map((p) => <Tag key={p.id} color="geekblue">{p.name}</Tag>)
        : <Tag>Chưa có</Tag>,
    },
  ];

  return (
    <div>
      <BasePageHeader title="Quản lý Roles" onAdd={() => { setSelected(null); setModalOpen(true); }} />
      <div className="mb-4">
        <BaseSearchBar placeholder="Tìm theo tên role..." onSearch={handleSearch} />
      </div>
      <BaseTable<Role>
        columns={columns}
        dataSource={items}
        total={total}
        currentPage={page}
        pageSize={pageSize}
        loading={loading}
        onPageChange={(pg, size) => fetchData(pg, size)}
        actionConfig={{ onEdit: handleEdit, onDelete: handleDelete }}
      />
      <RoleFormModal
        open={modalOpen}
        record={selected}
        onClose={() => setModalOpen(false)}
        onSuccess={() => { setModalOpen(false); fetchData(); }}
      />
    </div>
  );
};

export default RolesListPage;
