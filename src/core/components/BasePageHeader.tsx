import React from 'react';
import { Button, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import BaseBreadcrumb from './BaseBreadcrumb';

const { Title } = Typography;

interface BasePageHeaderProps {
  title: string;
  onAdd?: () => void;
  addLabel?: string;
  extra?: React.ReactNode;
}

const BasePageHeader: React.FC<BasePageHeaderProps> = ({
  title,
  onAdd,
  addLabel = 'Thêm mới',
  extra,
}) => {
  return (
    <div className="mb-4">
      <BaseBreadcrumb />
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0">
          {title}
        </Title>
        <Space>
          {extra}
          {onAdd && (
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
              {addLabel}
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
};

export default BasePageHeader;
