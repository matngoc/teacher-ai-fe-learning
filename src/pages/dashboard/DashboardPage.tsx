import React from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import { TeamOutlined, SafetyOutlined, DatabaseOutlined, FolderOutlined } from '@ant-design/icons';
import { useAppSelector } from '../../stores/hooks';
import BaseBreadcrumb from '../../core/components/BaseBreadcrumb';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
  const { user } = useAppSelector((s) => s.auth);

  return (
    <div>
      <BaseBreadcrumb />
      <div className="mb-6">
        <Title level={4}>Xin chào, {user?.firstName || user?.username}!</Title>
        <Text type="secondary">Chào mừng bạn trở lại hệ thống quản trị HanaTalk.</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="rounded-xl">
            <Statistic
              title="Người dùng"
              value={0}
              prefix={<TeamOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="rounded-xl">
            <Statistic
              title="Roles"
              value={0}
              prefix={<SafetyOutlined className="text-green-500" />}
              valueStyle={{ color: '#22c55e' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="rounded-xl">
            <Statistic
              title="Từ điển"
              value={0}
              prefix={<DatabaseOutlined className="text-purple-500" />}
              valueStyle={{ color: '#a855f7' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="rounded-xl">
            <Statistic
              title="File lưu trữ"
              value={0}
              prefix={<FolderOutlined className="text-orange-500" />}
              valueStyle={{ color: '#f97316' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
