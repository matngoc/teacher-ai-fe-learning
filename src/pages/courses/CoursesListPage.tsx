import React, { useCallback, useEffect, useState } from 'react';
import { Select, Tag } from 'antd';
import type { TableColumnType } from 'antd';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { coursesActions } from '../../stores/coursesSlice';
import BaseTable from '../../core/components/BaseTable';
import BaseSearchBar from '../../core/components/BaseSearchBar';
import BasePageHeader from '../../core/components/BasePageHeader';
import CourseFormModal from './CourseFormModal';
import type { Course } from '../../api/types';
import { useToastMessages } from '../../core/hooks/useToastMessages';

const LEVEL_LABELS: Record<string, { label: string; color: string }> = {
  BEGINNER: { label: 'Beginner', color: 'green' },
  ELEMENTARY: { label: 'Elementary', color: 'cyan' },
  INTERMEDIATE: { label: 'Intermediate', color: 'blue' },
  UPPER_INTERMEDIATE: { label: 'Upper Intermediate', color: 'geekblue' },
  ADVANCED: { label: 'Advanced', color: 'purple' },
};

const LEVEL_OPTIONS = [
  { label: 'Beginner', value: 'BEGINNER' },
  { label: 'Elementary', value: 'ELEMENTARY' },
  { label: 'Intermediate', value: 'INTERMEDIATE' },
  { label: 'Upper Intermediate', value: 'UPPER_INTERMEDIATE' },
  { label: 'Advanced', value: 'ADVANCED' },
];

const CoursesListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, total, page, pageSize, loading, successMessage, error } = useAppSelector((s) => s.courses);
  const [keyword, setKeyword] = useState('');
  const [levelFilter, setLevelFilter] = useState<string | undefined>();
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Course | null>(null);

  useToastMessages(
    successMessage,
    error,
    () => dispatch(coursesActions.clearSuccessMessage()),
    () => dispatch(coursesActions.clearError()),
  );

  const fetchData = useCallback(
    (pg = page, size = pageSize, kw = keyword, level = levelFilter, isActive = activeFilter) => {
      dispatch(
        coursesActions.fetchList({
          page: pg,
          size,
          keyword: kw || undefined,
          level: level as Course['level'],
          isActive,
        }),
      );
    },
    [dispatch, page, pageSize, keyword, levelFilter, activeFilter],
  );

  useEffect(() => {
    fetchData(1);
  }, []);

  const handleSearch = (val: string) => {
    setKeyword(val);
    fetchData(1, pageSize, val, levelFilter, activeFilter);
  };

  const handleLevelFilter = (val: string | undefined) => {
    setLevelFilter(val);
    fetchData(1, pageSize, keyword, val, activeFilter);
  };

  const handleActiveFilter = (val: string | undefined) => {
    const boolVal = val === undefined ? undefined : val === 'true';
    setActiveFilter(boolVal);
    fetchData(1, pageSize, keyword, levelFilter, boolVal);
  };

  const handleEdit = (record: unknown) => {
    setSelected(record as Course);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await dispatch(coursesActions.deleteItem(id));
    if (coursesActions.deleteItem.fulfilled.match(result)) {
      fetchData();
    }
  };

  const handleRestore = async (id: number) => {
    if (!coursesActions.restoreItem) return;
    const result = await dispatch(coursesActions.restoreItem(id));
    if (coursesActions.restoreItem.fulfilled.match(result)) {
      fetchData();
    }
  };

  const columns: TableColumnType<Course>[] = [
    { title: '#', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: 'Tên khóa học',
      dataIndex: 'name',
      key: 'name',
      render: (v) => <strong>{v}</strong>,
    },
    { title: 'Mã', dataIndex: 'code', key: 'code', width: 130 },
    {
      title: 'Cấp độ',
      dataIndex: 'level',
      key: 'level',
      width: 160,
      render: (v) =>
        v ? (
          <Tag color={LEVEL_LABELS[v]?.color}>{LEVEL_LABELS[v]?.label ?? v}</Tag>
        ) : (
          '—'
        ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Hoạt động' : 'Tạm dừng'}</Tag>,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (v) =>
        v ? (
          <img src={v} alt="course" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
        ) : (
          '—'
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
      <BasePageHeader
        title="Quản lý khóa học"
        onAdd={() => {
          setSelected(null);
          setModalOpen(true);
        }}
      />
      <div className="flex gap-3 mb-4 flex-wrap">
        <BaseSearchBar placeholder="Tìm theo tên hoặc mã khóa học..." onSearch={handleSearch} />
        <Select
          placeholder="Lọc cấp độ"
          allowClear
          style={{ minWidth: 180 }}
          onChange={handleLevelFilter}
          options={LEVEL_OPTIONS}
        />
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
      <BaseTable<Course>
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
      <CourseFormModal
        open={modalOpen}
        record={selected}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          fetchData();
        }}
      />
    </div>
  );
};

export default CoursesListPage;
