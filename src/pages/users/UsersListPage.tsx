import React, { useCallback, useEffect, useState } from 'react';
import { Select, Tag } from 'antd';
import type { TableColumnType } from 'antd';
import { useAppDispatch, useAppSelector } from '~/stores/hooks.ts';
import { usersActions } from '~/stores/usersSlice.ts';
import BaseTable from '../../core/components/BaseTable';
import BaseSearchBar from '../../core/components/BaseSearchBar';
import BasePageHeader from '../../core/components/BasePageHeader';
import UserFormModal from './UserFormModal';
import type { User } from '~/api/types.ts';
import { useToastMessages } from '~/core/hooks/useToastMessages.ts'

const statusColor: Record<string, string> = {
  ACTIVE: 'green',
  LOCKED: 'orange',
  DELETED: 'red',
};

const UsersListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, total, page, pageSize, loading, successMessage, error } = useAppSelector((s) => s.users);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);

  useToastMessages(
    successMessage,
    error,
    () => dispatch(usersActions.clearSuccessMessage()),
    () => dispatch(usersActions.clearError()),
  );

  const fetchData = useCallback(
    (pg = page, size = pageSize, kw = keyword, status = statusFilter) => {
      dispatch(usersActions.fetchList({ page: pg, size, keyword: kw, status }));
    },
    [dispatch, page, pageSize, keyword, statusFilter],
  );

  useEffect(() => {
    fetchData(1);
  }, []);

  const handleSearch = (val: string) => {
    setKeyword(val);
    fetchData(1, pageSize, val, statusFilter);
  };

  const handleStatusFilter = (val: string | undefined) => {
    setStatusFilter(val);
    fetchData(1, pageSize, keyword, val);
  };

  const handleEdit = (record: unknown) => {
    setSelected(record as User);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await dispatch(usersActions.deleteItem(id));
    if (usersActions.deleteItem.fulfilled.match(result)) {
      fetchData();
    }
  };

  const handleRestore = async (id: number) => {
    if (!usersActions.restoreItem) return;
    const result = await dispatch(usersActions.restoreItem(id));
    if (usersActions.restoreItem.fulfilled.match(result)) {
      fetchData();
    }
  };

  const columns: TableColumnType<User>[] = [
    { title: '#', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Username', dataIndex: 'username', key: 'username', render: (v) => <strong>{v}</strong> },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Họ Tên',
      key: 'fullName',
      render: (_, r) => `${r.firstName || ''} ${r.lastName || ''}`.trim() || '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (v) => <Tag color={statusColor[v]}>{v}</Tag>,
    },
    {
      title: 'Roles',
      key: 'roles',
      render: (_, r) => r.roles?.map((role) => <Tag key={role.id} color="blue">{role.name}</Tag>) || '—',
    },
  ];

  return (
    <div>
      <BasePageHeader
        title="Quản lý người dùng"
        onAdd={() => { setSelected(null); setModalOpen(true); }}
      />
      <div className="flex gap-3 mb-4 flex-wrap">
        <BaseSearchBar placeholder="Tìm theo username, email..." onSearch={handleSearch} />
        <Select
          placeholder="Lọc trạng thái"
          allowClear
          style={{ minWidth: 160 }}
          onChange={handleStatusFilter}
          options={[
            { label: 'Hoạt động', value: 'ACTIVE' },
            { label: 'Khóa', value: 'LOCKED' },
            { label: 'Đã xóa', value: 'DELETED' },
          ]}
        />
      </div>
      <BaseTable<User>
        columns={columns}
        dataSource={items}
        total={total}
        currentPage={page}
        pageSize={pageSize}
        loading={loading}
        onPageChange={(pg, size) => fetchData(pg, size)}
        actionConfig={{
          onEdit: handleEdit,
          onDelete: handleDelete,
          onRestore: handleRestore,
          showRestore: statusFilter === 'DELETED',
        }}
      />
      <UserFormModal
        open={modalOpen}
        record={selected}
        onClose={() => setModalOpen(false)}
        onSuccess={() => { setModalOpen(false); fetchData(); }}
      />
    </div>
  );
};

export default UsersListPage;
