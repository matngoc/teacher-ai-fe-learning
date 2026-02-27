import React from 'react';
import { Table, type TableProps, type TableColumnType, Tooltip, Button, Popconfirm, Space } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  UndoOutlined,
} from '@ant-design/icons';

export interface ActionConfig {
  onEdit?: (record: unknown) => void;
  onDelete?: (id: number) => void;
  onRestore?: (id: number) => void;
  showRestore?: boolean;
}

interface BaseTableProps<T> extends Omit<TableProps<T>, 'pagination'> {
  total?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number, size: number) => void;
  actionConfig?: ActionConfig;
  hideActions?: boolean;
}

function BaseTable<T extends { id: number }>({
  columns = [],
  dataSource,
  total = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  actionConfig,
  hideActions = false,
  loading,
  ...rest
}: BaseTableProps<T>) {
  const actionColumn: TableColumnType<T> = {
    title: 'Thao tác',
    key: 'actions',
    fixed: 'right',
    width: 120,
    render: (_, record) => (
      <Space>
        {actionConfig?.onEdit && (
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => actionConfig.onEdit!(record)}
              className="text-blue-500 hover:text-blue-700"
            />
          </Tooltip>
        )}
        {actionConfig?.onDelete && (
          <Popconfirm
            title="Xác nhận xóa?"
            description="Dữ liệu sẽ bị xóa mềm, bạn có thể khôi phục sau."
            onConfirm={() => actionConfig.onDelete!(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                className="text-red-500 hover:text-red-700"
              />
            </Tooltip>
          </Popconfirm>
        )}
        {actionConfig?.showRestore && actionConfig?.onRestore && (
          <Tooltip title="Khôi phục">
            <Button
              type="text"
              icon={<UndoOutlined />}
              onClick={() => actionConfig.onRestore!(record.id)}
              className="text-green-500 hover:text-green-700"
            />
          </Tooltip>
        )}
      </Space>
    ),
  };

  const finalColumns = hideActions
    ? columns
    : [...columns, actionColumn];

  return (
    <Table<T>
      columns={finalColumns as TableColumnType<T>[]}
      dataSource={dataSource}
      loading={loading}
      rowKey="id"
      scroll={{ x: 'max-content' }}
      pagination={{
        current: currentPage,
        pageSize,
        total,
        showSizeChanger: true,
        showTotal: (total) => `Tổng ${total} bản ghi`,
        pageSizeOptions: ['10', '20', '50', '100'],
        onChange: onPageChange,
      }}
      {...rest}
    />
  );
}

export default BaseTable;
