import {Table, Input, Button, Popconfirm, Dropdown, Form, Space, Row, Col} from "antd";
import type { ColumnsType } from "antd/es/table";
import {DeleteOutlined, EditOutlined, MoreOutlined, SearchOutlined, UndoOutlined, PlusOutlined} from "@ant-design/icons";
import {type JSX, useState} from "react";
import {BaseBreadcrumb} from '~/components/BaseBreadcrumb.tsx';
import "./style.css";

export interface ActionPropItem {
  label: string
  key: string
  icon: JSX.Element
  onClick: () => void
  danger?: undefined
}

interface Props<T> {
  columns: ColumnsType<T>;
  data: T[];
  total: number;
  page: number;
  loading: boolean;
  pageSize?: number;
  onFilterChange: (values: any) => void;
  onResetFilter?: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onCreate?: () => void;
  onEdit?: (record: T) => void;
  onDelete?: (id: string) => void;
  actionColumns?: (record: T) => ActionPropItem[];
  extraSearchFields?: JSX.Element;
  extraHeaderButton?: JSX.Element;
  breadcrumbs?: any[];
}

export function BaseTableCrud<T extends { id: string }>(
  {
    columns,
    data,
    total,
    page,
    loading,
    pageSize = 10,
    onPageChange,
    onPageSizeChange,
    onCreate,
    onEdit,
    onDelete,
    actionColumns,
    onFilterChange,
    onResetFilter,
    extraSearchFields,
    extraHeaderButton,
    breadcrumbs
  }: Props<T>) {

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleValuesChange = (_: any, values: any) => {
    onFilterChange(values);
  };

  const handleReset = () => {
    form.resetFields();
    onResetFilter?.();
    onFilterChange({});
  };

  const showPopconfirm = (id: string) => setDeleteId(id);
  const closePopconfirm = () => setDeleteId(null);

  const actionColumn: undefined | ColumnsType<T>[number] = onEdit && onDelete &&
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record: any) => {
        let menuProps = {
          items: [
            {
              label: "Sửa",
              key: '1',
              icon: <EditOutlined/>,
              onClick: () => onEdit(record)
            },
            {
              label: "Xóa",
              key: '2',
              icon: <DeleteOutlined />,
              onClick: () => showPopconfirm(record._id),
              danger: true
            },
          ]
        };
        if(actionColumns?.length != null && actionColumns.length > 0) {
          menuProps.items.push(
            ...actionColumns(record)
          )
        }
        return (
          <div className="action-btn-group">
            <Dropdown
              menu={menuProps}
              placement="bottomRight"
              overlayClassName="base-table-action-menu"
            >
              <Button icon={<MoreOutlined />} className="action-dropdown-btn" />
            </Dropdown>
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc chắn muốn xóa bản ghi này?"
              open={deleteId === record._id}
              onCancel={closePopconfirm}
              onConfirm={() => onDelete(record._id)}
              cancelText="Hủy"
              okText="Xóa"
              okButtonProps={{ danger: true }}
            />
          </div>
        );
      },
    } as ColumnsType<T>[number];
  return (
    <div className="base-table-container">
      <BaseBreadcrumb
        items={breadcrumbs}
        extraButton={
          onCreate && (
            <div className="base-table-header-actions">
              {extraHeaderButton}
              <Button type='primary' onClick={onCreate} icon={<PlusOutlined />}>
                Thêm mới
              </Button>
            </div>
          )
        }
      />
      <Form form={form} onValuesChange={handleValuesChange} className="base-table-search">
        <Row gutter={16}>
          {extraSearchFields}
          <Col span={8}>
            <Form.Item name='keyword' initialValue={''}>
              <Space.Compact style={{ width: '100%' }}>
                <Input prefix={<SearchOutlined />} placeholder='Nhập từ khóa tìm kiếm...' />
                <Button type={'primary'} onClick={handleReset} icon={<UndoOutlined />} />
              </Space.Compact>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <div className="base-table-wrapper">
        <Table
          bordered
          rowKey={(record: any) => record._id}
          columns={
            actionColumn
              ? [
                  {
                    title: 'STT',
                    key: 'stt',
                    width: 80,
                    align: 'center',
                    render: (_: any, __: any, index: number) => (page - 1) * pageSize + index + 1
                  },
                  ...columns,
                  actionColumn
                ]
              : [
                  {
                    title: 'STT',
                    key: 'stt',
                    width: 80,
                    align: 'center',
                    render: (_: any, __: any, index: number) => (page - 1) * pageSize + index + 1
                  },
                  ...columns
                ]
          }
          dataSource={data}
          loading={loading}
          scroll={{ x: true }}
          pagination={{
            current: page,
            total,
            pageSize,
            onChange: (p) => onPageChange(p),
            onShowSizeChange: (_current, size) => {
              onPageSizeChange?.(size)
              onPageChange(1)
            },
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} trên ${total} bản ghi`
          }}
        />
      </div>
    </div>
  )
}
