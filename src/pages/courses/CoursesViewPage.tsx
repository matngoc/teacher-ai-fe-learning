import React, { useCallback, useEffect, useState } from 'react';
import { Select, Tag, Card, Row, Col, Input, Typography, Pagination, Button } from 'antd';
import { PlayCircleOutlined, SearchOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '~/stores/hooks.ts';
import { coursesActions } from '~/stores/coursesSlice.ts';
import type { Course } from '~/api/types.ts';

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
  const navigate = useNavigate();
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
        <Paragraph type="secondary">Danh sách các khóa học</Paragraph>
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
                onClick={() => navigate(`/user/courses/${course.id}/lessons`)}
                style={{ cursor: 'pointer' }}
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
                {(() => {
                  const lessons = course.lessons ?? [];
                  const totalLessons = lessons.length;
                  const completedCount = lessons.filter((l) => l.learningStatus === 'completed').length;
                  const inProgressLesson = lessons.find((l) => l.learningStatus === 'in_progress');
                  const notStartedLessons = lessons.filter((l) => !l.learningStatus || l.learningStatus === 'not_started');

                  const handleContinue = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (inProgressLesson) navigate(`/learn/${inProgressLesson.id}`);
                  };

                  const handleRandom = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (notStartedLessons.length > 0) {
                      const random = notStartedLessons[Math.floor(Math.random() * notStartedLessons.length)];
                      navigate(`/learn/${random.id}`);
                    }
                  };

                  return totalLessons > 0 ? (
                    <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>📖 Tổng số bài:</span>
                        <Tag color="blue" className="!m-0 text-xs">{totalLessons} bài</Tag>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>✅ Đã hoàn thành:</span>
                        <Tag color="green" className="!m-0 text-xs">{completedCount} bài</Tag>
                      </div>
                      {inProgressLesson && (
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>🔄 Đang học:</span>
                          <Tag color="orange" className="!m-0 text-xs" style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {inProgressLesson.name}
                          </Tag>
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="small"
                          type="primary"
                          icon={<PlayCircleOutlined />}
                          disabled={!inProgressLesson}
                          onClick={handleContinue}
                          style={{ flex: 1, fontSize: 12 }}
                        >
                          Học tiếp
                        </Button>
                        <Button
                          size="small"
                          icon={<ThunderboltOutlined />}
                          disabled={notStartedLessons.length === 0}
                          onClick={handleRandom}
                          style={{ flex: 1, fontSize: 12 }}
                        >
                          Bài bất kỳ
                        </Button>
                      </div>
                    </div>
                  ) : null;
                })()}
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
