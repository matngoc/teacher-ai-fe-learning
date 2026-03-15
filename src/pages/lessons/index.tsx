import React, { useCallback, useEffect, useState } from 'react';
import { Select, Tag } from 'antd';
import type { TableColumnType } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '~/stores/hooks.ts';
import { lessonsActions } from '~/stores/lessonsSlice.ts';
import BaseTable from '../../core/components/BaseTable';
import BaseSearchBar from '../../core/components/BaseSearchBar';
import BasePageHeader from '../../core/components/BasePageHeader';
import type { Lesson } from '~/api/types.ts';
import { useToastMessages } from '~/core/hooks/useToastMessages.ts';

const LessonManagePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, total, page, pageSize, loading, successMessage, error } = useAppSelector(
    (s) => s.lessons,
  );
  const [keyword, setKeyword] = useState('');
  const [courseFilter] = useState<number | undefined>();
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>();

  useToastMessages(
    successMessage,
    error,
    () => dispatch(lessonsActions.clearSuccessMessage()),
    () => dispatch(lessonsActions.clearError()),
  );

  // Detect current role prefix for navigation
  const getBasePath = () => {
    const path = window.location.pathname;
    if (path.startsWith('/super-admin')) return '/super-admin';
    return '/admin';
  };

  const fetchData = useCallback(
    (
      pg = page,
      size = pageSize,
      kw = keyword,
      courseId = courseFilter,
      isActive = activeFilter,
    ) => {
      dispatch(
        lessonsActions.fetchList({
          page: pg,
          size,
          keyword: kw || undefined,
          courseId,
          isActive,
        }),
      );
    },
    [dispatch, page, pageSize, keyword, courseFilter, activeFilter],
  );

  useEffect(() => {
    fetchData(1);
  }, []);

  const handleSearch = (val: string) => {
    setKeyword(val);
    fetchData(1, pageSize, val, courseFilter, activeFilter);
  };

  const handleActiveFilter = (val: string | undefined) => {
    const boolVal = val === undefined ? undefined : val === 'true';
    setActiveFilter(boolVal);
    fetchData(1, pageSize, keyword, courseFilter, boolVal);
  };

  const handleAdd = () => navigate(`${getBasePath()}/lessons/new`);

  const handleEdit = (record: unknown) => {
    const lesson = record as Lesson;
    navigate(`${getBasePath()}/lessons/${lesson.id}`);
  };

  const handleDelete = async (id: number) => {
    const result = await dispatch(lessonsActions.deleteItem(id));
    if (lessonsActions.deleteItem.fulfilled.match(result)) {
      fetchData();
    }
  };

  const handleRestore = async (id: number) => {
    if (!lessonsActions.restoreItem) return;
    const result = await dispatch(lessonsActions.restoreItem(id));
    if (lessonsActions.restoreItem.fulfilled.match(result)) {
      fetchData();
    }
  };

  const columns: TableColumnType<Lesson>[] = [
    {
      title: 'Tên bài học',
      dataIndex: 'name',
      key: 'name',
      render: (v) => <strong>{v}</strong>,
    },
    { title: 'Mã', dataIndex: 'code', key: 'code', width: 140 },
    {
      title: 'Khóa học ID',
      dataIndex: 'courseId',
      key: 'courseId',
      width: 110,
    },
    {
      title: 'Nhà cung cấp AI',
      dataIndex: 'providerName',
      key: 'providerName',
      width: 140,
      render: (v) => v || '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (v) => (
        <Tag color={v ? 'green' : 'default'}>{v ? 'Hoạt động' : 'Tạm dừng'}</Tag>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (v) => <span className="text-gray-500 text-sm">{v || '—'}</span>,
    },
  ];

  return (
    <div>
      <BasePageHeader title="Quản lý bài học" onAdd={handleAdd} />
      <div className="flex gap-3 mb-4 flex-wrap">
        <BaseSearchBar placeholder="Tìm theo tên hoặc mã bài học..." onSearch={handleSearch} />
        <Select
          placeholder="Lọc trạng thái"
          allowClear
          style={{ minWidth: 150 }}
          onChange={handleActiveFilter}
          options={[
            { label: 'Hoạt động', value: 'true' },
            { label: 'Tạm dừng', value: 'false' },
          ]}
        />
      </div>
      <BaseTable<Lesson>
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
        }}
      />
    </div>
  );
};

export default LessonManagePage;
