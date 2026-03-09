import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Spin,
  Tag,
} from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '~/stores/hooks.ts';
import { getProfileThunk, updateProfileThunk } from '~/stores/authSlice.ts';
import BasePageHeader from '../../core/components/BasePageHeader';
import { dictionaryService } from '~/api/services/dictionaryService.ts';
import type { Dictionary, UpdateProfileDto } from '~/api/types.ts';

const statusColor: Record<string, string> = {
  ACTIVE: 'green',
  LOCKED: 'orange',
  DELETED: 'red',
};

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((s) => s.auth);
  const [editOpen, setEditOpen] = useState(false);
  const [form] = Form.useForm<UpdateProfileDto>();

  const [motivationOptions, setMotivationOptions] = useState<Dictionary[]>([]);
  const [englishLevelOptions, setEnglishLevelOptions] = useState<Dictionary[]>([]);
  const [favouriteTopicOptions, setFavouriteTopicOptions] = useState<Dictionary[]>([]);

  useEffect(() => {
    dispatch(getProfileThunk());
  }, [dispatch]);

  useEffect(() => {
    dictionaryService.findByType('MOTIVATION').then((items: Dictionary[]) =>
      setMotivationOptions(Array.isArray(items) ? items : (items as { items?: Dictionary[] }).items ?? []),
    );
    dictionaryService.findByType('ENGLISH_LEVEL').then((items: Dictionary[]) =>
      setEnglishLevelOptions(Array.isArray(items) ? items : (items as { items?: Dictionary[] }).items ?? []),
    );
    dictionaryService.findByType('FAVOURITE_TOPIC').then((items: Dictionary[]) =>
      setFavouriteTopicOptions(Array.isArray(items) ? items : (items as { items?: Dictionary[] }).items ?? []),
    );
  }, []);

  const openEdit = () => {
    form.setFieldsValue({
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      age: user?.age,
      job: user?.job,
      avatarUrl: user?.avatarUrl,
      motivation: user?.motivation,
      englishLevel: user?.englishLevel,
      favouriteTopic: user?.favouriteTopic,
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await dispatch(updateProfileThunk(values)).unwrap();
      message.success('Cập nhật thông tin thành công');
      setEditOpen(false);
    } catch (err: unknown) {
      const msg = typeof err === 'string' ? err : (err as { message?: string })?.message;
      if (msg) message.error(msg);
    }
  };

  if (!user) return <Spin className="flex justify-center mt-12" />;

  return (
    <div>
      <BasePageHeader
        title="Hồ sơ cá nhân"
        extra={
          <Button type="primary" icon={<EditOutlined />} onClick={openEdit}>
            Chỉnh sửa
          </Button>
        }
      />

      <Card>
        <div className="flex items-center gap-6 mb-6">
          <Avatar size={80} src={user.avatarUrl} icon={<UserOutlined />} className="bg-blue-500" />
          <div>
            <div className="text-xl font-semibold">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-gray-500">@{user.username}</div>
            <Tag color={statusColor[user.status] || 'default'} className="mt-1">
              {user.status}
            </Tag>
          </div>
        </div>

        <Descriptions bordered column={2}>
          <Descriptions.Item label="Tên đăng nhập">{user.username}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email || '—'}</Descriptions.Item>
          <Descriptions.Item label="Họ">{user.firstName || '—'}</Descriptions.Item>
          <Descriptions.Item label="Tên">{user.lastName || '—'}</Descriptions.Item>
          <Descriptions.Item label="Tuổi">{user.age ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Nghề nghiệp">{user.job || '—'}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={statusColor[user.status]}>{user.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Roles">
            {user.roles?.map((r) => (
              <Tag key={r.id} color="blue">
                {r.name}
              </Tag>
            )) || '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Động lực học">
            {motivationOptions.find((o) => o.value === user.motivation)?.key || user.motivation || '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Trình độ tiếng Anh">
            {englishLevelOptions.find((o) => o.value === user.englishLevel)?.key || user.englishLevel || '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Chủ đề yêu thích">
            {favouriteTopicOptions.find((o) => o.value === user.favouriteTopic)?.key ||
              user.favouriteTopic ||
              '—'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Cập nhật hồ sơ"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={handleSave}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={loading}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Họ" name="firstName">
                <Input placeholder="Nhập họ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tên" name="lastName">
                <Input placeholder="Nhập tên" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Tuổi" name="age">
                <InputNumber min={1} max={120} placeholder="Nhập tuổi" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Nghề nghiệp" name="job">
                <Input placeholder="Nhập nghề nghiệp" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Avatar URL" name="avatarUrl">
            <Input placeholder="https://example.com/avatar.jpg" />
          </Form.Item>

          <Form.Item label="Động lực học" name="motivation">
            <Select
              allowClear
              placeholder="Chọn động lực"
              options={motivationOptions.map((o) => ({ label: o.key, value: o.value }))}
            />
          </Form.Item>

          <Form.Item label="Trình độ tiếng Anh" name="englishLevel">
            <Select
              allowClear
              placeholder="Chọn trình độ"
              options={englishLevelOptions.map((o) => ({ label: o.key, value: o.value }))}
            />
          </Form.Item>

          <Form.Item label="Chủ đề yêu thích" name="favouriteTopic">
            <Select
              allowClear
              placeholder="Chọn chủ đề"
              options={favouriteTopicOptions.map((o) => ({ label: o.key, value: o.value }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
