import React, { useCallback, useEffect, useState } from 'react';
import { Select, Tag, Card, Row, Col, Input, Typography, Pagination } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { coursesActions } from '../../stores/coursesSlice';
import type { Course } from '../../api/types';

const { Title, Paragraph } = Typography;
const { Search } = Input;

const LEVEL_LABELS: Record<string, { label: string; color: string }> = {
  BEGINNER: { label: 'Beginner', color: 'green' },
  ELEMENTARY: { label: 'Elementary', color: 'cyan' },
  INTERMEDIATE: { label: 'Intermediate', color: 'blue' },
  UPPER_INTERMEDIATE: { label: 'Upper Intermediate', color: 'geekblue' },
  ADVANCED: { label: 'Advanced', color: 'purple' },
};

const LEVEL_OPTIONS = [
  { label: 'Tất cả cấp độ', value: '' },
  { label: 'Beginner', value: 'BEGINNER' },
  { label: 'Elementary', value: 'ELEMENTARY' },
  { label: 'Intermediate', value: 'INTERMEDIATE' },
  { label: 'Upper Intermediate', value: 'UPPER_INTERMEDIATE' },
  { label: 'Advanced', value: 'ADVANCED' },
];

const CoursesViewPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, total, page, pageSize, loading } = useAppSelector((s) => s.courses);
  const [keyword, setKeyword] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('');

  const fetchData = useCallback(
    (pg = 1, size = pageSize, kw = keyword, level = levelFilter) => {
      dispatch(
        coursesActions.fetchList({
          page: pg,
          size,
          keyword: kw || undefined,
          level: (level || undefined) as Course['level'],
          isActive: true,
        }),
      );
    },
    [dispatch, pageSize, keyword, levelFilter],
  );

  useEffect(() => {
    fetchData(1);
  }, []);

  const handleSearch = (val: string) => {
    setKeyword(val);
    fetchData(1, pageSize, val, levelFilter);
  };

  const handleLevelFilter = (val: string) => {
    setLevelFilter(val);
    fetchData(1, pageSize, keyword, val);
  };

  return (
    <div>
      <div className="mb-6">
        <Title level={3} className="!mb-1">Khóa học</Title>
        <Paragraph type="secondary">Danh sách các khóa học đang có sẵn</Paragraph>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <Search
          placeholder="Tìm kiếm khóa học..."
          allowClear
          onSearch={handleSearch}
          prefix={<SearchOutlined />}
          style={{ maxWidth: 320 }}
        />
        <Select
          value={levelFilter}
          style={{ minWidth: 180 }}
          onChange={handleLevelFilter}
          options={LEVEL_OPTIONS}
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Đang tải...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-10 text-gray-400">Không có khóa học nào</div>
      ) : (
        <Row gutter={[16, 16]}>
          {items.map((course) => (
            <Col key={course.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                cover={
                  course.imageUrl ? (
                    <img
                      alt={course.name}
                      src={course.imageUrl}
                      style={{ height: 160, objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        height: 160,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ color: '#fff', fontSize: 32 }}>📚</span>
                    </div>
                  )
                }
                bodyStyle={{ padding: '12px 16px' }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <Title level={5} className="!mb-0 !text-sm line-clamp-2">
                    {course.name}
                  </Title>
                </div>
                <div className="flex gap-1 flex-wrap mt-1">
                  <Tag color="default" className="text-xs">{course.code}</Tag>
                  {course.level && (
                    <Tag color={LEVEL_LABELS[course.level]?.color} className="text-xs">
                      {LEVEL_LABELS[course.level]?.label ?? course.level}
                    </Tag>
                  )}
                </div>
                {course.description && (
                  <Paragraph
                    type="secondary"
                    className="!mb-0 !text-xs mt-2"
                    ellipsis={{ rows: 2 }}
                  >
                    {course.description}
                  </Paragraph>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {total > pageSize && (
        <div className="flex justify-center mt-6">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={(pg: number, size: number) => fetchData(pg, size)}
            showSizeChanger
          />
        </div>
      )}
    </div>
  );
};

export default CoursesViewPage;
