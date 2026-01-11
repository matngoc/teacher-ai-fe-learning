import React, { useEffect, useState } from 'react';
import { Button, Table, Input, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { LessonService } from '~/api/services/LessonService';
import type { BotListResponse } from '~/api/services/LessonService';
import { toast } from 'react-toastify';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;

interface LessonItem {
  id: number;
  name: string;
  description: string;
}

export default function LessonManagePage() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchLessons();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = lessons.filter(lesson =>
        lesson.name.toLowerCase().includes(searchText.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredLessons(filtered);
    } else {
      setFilteredLessons(lessons);
    }
  }, [searchText, lessons]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await LessonService.fetchBotList();
      
      if (response.status === 0 && response.result) {
        setLessons(response.result);
        setFilteredLessons(response.result);
      } else {
        toast.error('Failed to fetch lessons');
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error('Error fetching lessons');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<LessonItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
    },
    {
      title: 'Tên bài học',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_: any, record: LessonItem) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/manage/lessons/${record.id}`)}
        >
          Sửa
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý bài học</h1>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate('/manage/lessons/new')}
          >
            Thêm bài học mới
          </Button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <Search
            placeholder="Tìm kiếm bài học theo tên hoặc mô tả..."
            allowClear
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ maxWidth: 500 }}
          />
        </div>

        {/* Stats */}
        <div className="mb-4">
          <Space>
            <Tag color="blue">Tổng số: {lessons.length} bài học</Tag>
            {searchText && (
              <Tag color="green">Tìm thấy: {filteredLessons.length} kết quả</Tag>
            )}
          </Space>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredLessons}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} bài học`,
          }}
        />
      </div>
    </div>
  );
}
