import React, { useCallback, useEffect, useState } from 'react';
import { Select, Tag } from 'antd';
import type { TableColumnType } from 'antd';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { dictionaryActions } from '../../stores/dictionarySlice';
import BaseTable from '../../core/components/BaseTable';
import BaseSearchBar from '../../core/components/BaseSearchBar';
import BasePageHeader from '../../core/components/BasePageHeader';
import DictionaryFormModal from './DictionaryFormModal';
import type { Dictionary, DictionaryType } from '../../api/types';
import { useToastMessages } from '../../core/hooks/useToastMessages';

const TYPE_COLOR: Record<string, string> = {
  MOTIVATION: 'purple',
  ENGLISH_LEVEL: 'blue',
  FAVOURITE_TOPIC: 'green',
};

const DICT_TYPE_OPTIONS = [
  { label: 'Motivation', value: 'MOTIVATION' },
  { label: 'English Level', value: 'ENGLISH_LEVEL' },
  { label: 'Favourite Topic', value: 'FAVOURITE_TOPIC' },
];

const DictionaryListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, total, page, pageSize, loading, successMessage, error } = useAppSelector((s) => s.dictionary);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<DictionaryType | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Dictionary | null>(null);

  useToastMessages(
    successMessage,
    error,
    () => dispatch(dictionaryActions.clearSuccessMessage()),
    () => dispatch(dictionaryActions.clearError()),
  );

  const fetchData = useCallback(
    (pg = page, size = pageSize, kw = keyword, type = typeFilter) => {
      dispatch(dictionaryActions.fetchList({ page: pg, size, keyword: kw, type }));
    },
    [dispatch, page, pageSize, keyword, typeFilter],
  );

  useEffect(() => { fetchData(1); }, []);

  const handleSearch = (val: string) => {
    setKeyword(val);
    fetchData(1, pageSize, val, typeFilter);
  };

  const handleTypeFilter = (val: DictionaryType | undefined) => {
    setTypeFilter(val);
    fetchData(1, pageSize, keyword, val);
  };

  const handleEdit = (record: unknown) => {
    setSelected(record as Dictionary);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await dispatch(dictionaryActions.deleteItem(id));
    if (dictionaryActions.deleteItem.fulfilled.match(result)) {
      fetchData();
    }
  };

  const columns: TableColumnType<Dictionary>[] = [
    { title: '#', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Key', dataIndex: 'key', key: 'key', render: (v) => <code className="bg-gray-100 px-1 rounded">{v}</code> },
    { title: 'Value', dataIndex: 'value', key: 'value', render: (v) => <strong>{v}</strong> },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (v) => v ? <Tag color={TYPE_COLOR[v]}>{v}</Tag> : '—',
    },
    { title: 'Mô tả', dataIndex: 'description', key: 'description', render: (v) => v || '—' },
  ];

  return (
    <div>
      <BasePageHeader title="Quản lý Từ điển" onAdd={() => { setSelected(null); setModalOpen(true); }} />
      <div className="flex gap-3 mb-4 flex-wrap">
        <BaseSearchBar placeholder="Tìm theo key, value..." onSearch={handleSearch} />
        <Select
          placeholder="Lọc theo loại"
          allowClear
          style={{ minWidth: 180 }}
          onChange={(val) => handleTypeFilter(val as DictionaryType | undefined)}
          options={DICT_TYPE_OPTIONS}
        />
      </div>
      <BaseTable<Dictionary>
        columns={columns}
        dataSource={items}
        total={total}
        currentPage={page}
        pageSize={pageSize}
        loading={loading}
        onPageChange={(pg, size) => fetchData(pg, size)}
        actionConfig={{ onEdit: handleEdit, onDelete: handleDelete }}
      />
      <DictionaryFormModal
        open={modalOpen}
        record={selected}
        onClose={() => setModalOpen(false)}
        onSuccess={() => { setModalOpen(false); fetchData(); }}
      />
    </div>
  );
};

export default DictionaryListPage;
