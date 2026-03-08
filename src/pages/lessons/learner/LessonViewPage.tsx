import React, { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Card, Input, Pagination, Progress, Spin, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '~/stores/hooks.ts';
import { lessonsActions } from '~/stores/lessonsSlice.ts';
import { lessonService } from '~/api/services/lessonService.ts';
import type { Lesson } from '~/api/types';

const { Title, Paragraph, Text } = Typography;

type LessonStatus = 'done' | 'in_progress' | 'not_started';

const normalizeStatus = (status?: string): LessonStatus => {
  if (!status) return 'not_started';
  const s = status.toLowerCase();
  if (s === 'done' || s === 'completed' || s === 'finished') return 'done';
  if (s === 'in_progress' || s === 'learning' || s === 'started') return 'in_progress';
  return 'not_started';
};

const statusConfig: Record<LessonStatus, { label: string; color: string; badge: 'success' | 'processing' | 'default' }> = {
  done: { label: 'Đã hoàn thành', color: 'green', badge: 'success' },
  in_progress: { label: 'Đang học', color: 'blue', badge: 'processing' },
  not_started: { label: 'Chưa học', color: 'default', badge: 'default' },
};

const LessonViewPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { courseId } = useParams<{ courseId?: string }>();

  // Redux state for paginated mode
  const { items: reduxItems, total, page, pageSize, loading: reduxLoading } = useAppSelector((s) => s.lessons);

  // Local state for findByCourse mode
  const [courseItems, setCourseItems] = useState<Lesson[]>([]);
  const [courseLoading, setCourseLoading] = useState(false);

  const isCourseMode = Boolean(courseId);
  const loading = isCourseMode ? courseLoading : reduxLoading;

  const [keyword, setKeyword] = useState('');

  // Fetch all lessons of a course
  useEffect(() => {
    if (isCourseMode && courseId) {
      setCourseLoading(true);
      lessonService
        .findByCourse(Number(courseId))
        .then((data) => setCourseItems(Array.isArray(data.items) ? data.items : []))
        .finally(() => setCourseLoading(false))
    }
  }, [courseId, isCourseMode]);

  // Paginated fetch for standalone mode
  const fetchData = useCallback(
    (pg = 1, size = pageSize, kw = keyword) => {
      if (!isCourseMode) {
        dispatch(
          lessonsActions.fetchList({
            page: pg,
            size,
            keyword: kw || undefined,
            isActive: true,
          }),
        );
      }
    },
    [dispatch, pageSize, keyword, isCourseMode],
  );

  useEffect(() => {
    if (!isCourseMode) fetchData(1);
  }, []);

  // Client-side filter when in courseMode
  const displayItems = isCourseMode
    ? keyword
      ? courseItems.filter(
          (l) =>
            l.name.toLowerCase().includes(keyword.toLowerCase()) ||
            l.code.toLowerCase().includes(keyword.toLowerCase()),
        )
      : courseItems
    : reduxItems;

  const handleContinue = () => {
    const inProgress = displayItems.find((l) => normalizeStatus(l.learningStatus) === 'in_progress');
    if (inProgress) navigate(`/learn/${inProgress.id}`);
  };

  const handleRandom = () => {
    const notStarted = displayItems.filter((l) => normalizeStatus(l.learningStatus) === 'not_started');
    if (notStarted.length > 0) {
      const random = notStarted[Math.floor(Math.random() * notStarted.length)];
      navigate(`/learn/${random.id}`);
    }
  };

  const hasInProgress = displayItems.some((l) => normalizeStatus(l.learningStatus) === 'in_progress');
  const hasNotStarted = displayItems.some((l) => normalizeStatus(l.learningStatus) === 'not_started');

  const handleCardClick = (lesson: Lesson) => {
    navigate(`/learn/${lesson.id}`);
  };

  const globalIndex = (localIndex: number) =>
    isCourseMode ? localIndex + 1 : (page - 1) * pageSize + localIndex + 1;

  return (
    <div>
      <div className='mb-6'>
        {isCourseMode && (
          <Button
            icon={<ArrowLeftOutlined />}
            type='text'
            className='mb-2 -ml-2'
            onClick={() => navigate(-1)}
          >
            Quay lại khóa học
          </Button>
        )}
        <Title level={3} style={{ margin: 0 }}>
          Danh sách bài học
        </Title>
      </div>

      <div className='flex gap-3 mb-6 flex-wrap items-center'>
        <Input.Search
          placeholder='Tìm theo tên hoặc mã bài học...'
          allowClear
          style={{ maxWidth: 380 }}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onSearch={(val) => {
            setKeyword(val);
            if (!isCourseMode) fetchData(1, pageSize, val);
          }}
        />
        <Button
          type='primary'
          icon={<PlayCircleOutlined />}
          disabled={!hasInProgress}
          onClick={handleContinue}
        >
          Học tiếp
        </Button>
        <Button
          icon={<ThunderboltOutlined />}
          disabled={!hasNotStarted}
          onClick={handleRandom}
        >
          Học bài bất kỳ
        </Button>
      </div>

      <Spin spinning={loading}>
        <div className='flex flex-col gap-3'>
          {displayItems.map((lesson, index) => {
            const status = normalizeStatus(lesson.learningStatus);
            const { label, color, badge } = statusConfig[status];
            const num = globalIndex(index);

            return (
              <Card
                key={lesson.id}
                hoverable
                onClick={() => handleCardClick(lesson)}
                style={{ cursor: 'pointer' }}
                styles={{ body: { padding: '16px 20px' } }}
              >
                <div className='flex items-center gap-4'>
                  {/* Index */}
                  <div
                    className='flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-base'
                    style={{ background: '#6366f1', minWidth: 40 }}
                  >
                    {num}
                  </div>

                  {/* Info */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 flex-wrap mb-1'>
                      <Text strong style={{ fontSize: 15 }}>
                        {lesson.name}
                      </Text>
                      <Text type='secondary' style={{ fontSize: 12 }}>
                        ({lesson.code})
                      </Text>
                      {lesson.providerName && (
                        <Tag color='blue' style={{ fontSize: 11 }}>
                          AI: {lesson.providerName}
                        </Tag>
                      )}
                    </div>
                    <Paragraph
                      type='secondary'
                      ellipsis={{ rows: 1 }}
                      style={{ marginBottom: 0, fontSize: 13 }}
                    >
                      {lesson.description || 'Chưa có mô tả.'}
                    </Paragraph>
                    {typeof lesson.progressPercent === 'number' && lesson.progressPercent > 0 && (
                      <Progress
                        percent={lesson.progressPercent}
                        size='small'
                        strokeColor={status === 'done' ? '#52c41a' : '#6366f1'}
                        style={{ marginTop: 6, marginBottom: 0 }}
                      />
                    )}
                  </div>

                  {/* Status */}
                  <div className='flex-shrink-0'>
                    <Badge status={badge} text={<Tag color={color}>{label}</Tag>} />
                  </div>
                </div>
              </Card>
            );
          })}

          {!loading && displayItems.length === 0 && (
            <div className='text-center py-10 text-gray-400'>Không có bài học nào</div>
          )}
        </div>
      </Spin>

      {!isCourseMode && total > pageSize && (
        <div className='flex justify-center mt-6'>
          <Pagination
            current={page}
            total={total}
            pageSize={pageSize}
            showSizeChanger
            onChange={(pg, size) => fetchData(pg, size)}
          />
        </div>
      )}
    </div>
  );
};

export default LessonViewPage;
