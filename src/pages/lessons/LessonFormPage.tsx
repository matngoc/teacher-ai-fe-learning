import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Spin,
  Switch,
  Typography,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { lessonsActions } from '../../stores/lessonsSlice';
import { lessonService } from '../../api/services/lessonService';
import { courseService } from '../../api/services/courseService';
import { useToastMessages } from '../../core/hooks/useToastMessages';
import { CheckpointEditor } from './components/CheckpointEditor';
import type { Checkpoint } from './types/checkpoint';
import type { Course, CreateLessonDto, UpdateLessonDto } from '../../api/types';

const { TextArea } = Input;
const { Title } = Typography;

export default function LessonFormPage() {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const dispatch = useAppDispatch();
  const { loading, successMessage, error } = useAppSelector((s) => s.lessons);

  const [form] = Form.useForm();
  const [initialLoading, setInitialLoading] = useState(false);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [courseOptions, setCourseOptions] = useState<{ label: string; value: number }[]>([]);

  const isEditMode = !!lessonId && lessonId !== 'new';

  // Back path helper - detect prefix from current URL
  const getBackPath = () => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) return '/admin/lessons';
    if (path.startsWith('/super-admin')) return '/super-admin/lessons';
    return '/admin/lessons';
  };

  // Toast messages
  useToastMessages(
    successMessage,
    error,
    () => dispatch(lessonsActions.clearSuccessMessage()),
    () => dispatch(lessonsActions.clearError()),
  );

  // Load active courses for select
  useEffect(() => {
    courseService.findActive().then((res: any) => {
      if(res?.items){
        setCourseOptions(res.items.map((c: Course) => ({ label: `${c.code} – ${c.name}`, value: c.id })));
      }
    });
  }, []);

  // Load lesson detail in edit mode
  useEffect(() => {
    if (isEditMode && lessonId) {
      setInitialLoading(true);
      lessonService
        .findOne(parseInt(lessonId))
        .then((lesson) => {
          form.setFieldsValue({
            courseId: lesson.courseId,
            code: lesson.code,
            name: lesson.name,
            description: lesson.description,
            providerName: lesson.providerName,
            systemPrompt: lesson.systemPrompt,
            generationParams: lesson.generationParams,
            formatOutput: lesson.formatOutput,
            isActive: lesson.isActive,
          });

          // Parse taskChain JSON string -> checkpoints array
          if (lesson.taskChain) {
            try {
              const parsed = JSON.parse(lesson.taskChain);
              // Support both array of checkpoints or { checkpoints: [...] }
              if (Array.isArray(parsed)) {
                setCheckpoints(parsed);
              } else if (parsed?.checkpoints) {
                setCheckpoints(parsed.checkpoints);
              } else if (parsed?.[0]?.checkpoints) {
                setCheckpoints(parsed[0].checkpoints);
              }
            } catch {
              // taskChain not valid JSON - ignore
            }
          }
        })
        .catch(() => {
          navigate(getBackPath());
        })
        .finally(() => setInitialLoading(false));
    } else {
      form.setFieldsValue({ isActive: true });
    }
  }, [lessonId]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    // Serialize checkpoints back to taskChain JSON string
    const taskChain = checkpoints.length > 0 ? JSON.stringify(checkpoints) : undefined;

    if (isEditMode && lessonId) {
      const { code: _code, ...rest } = values;
      const updateData: UpdateLessonDto = {
        ...(rest as UpdateLessonDto),
        taskChain,
      };
      const result = await dispatch(
        lessonsActions.updateItem({ id: parseInt(lessonId), data: updateData }),
      );
      if (lessonsActions.updateItem.fulfilled.match(result)) {
        // Stay on page after update (like original LessonFormPage.tsx behavior)
      }
    } else {
      const createData: CreateLessonDto = {
        ...(values as any as CreateLessonDto),
        taskChain,
      };
      const result = await dispatch(lessonsActions.createItem(createData));
      if (lessonsActions.createItem.fulfilled.match(result)) {
        navigate(getBackPath());
      }
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" tip="Đang tải thông tin bài học..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(getBackPath())}
            className="mb-4"
          >
            Quay lại danh sách
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            {isEditMode ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'}
          </Title>
        </div>

        {/* Main form */}
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            {/* Row 1: Khóa học + Mã bài học */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <Form.Item
                label="Khóa học"
                name="courseId"
                rules={[{ required: true, message: 'Vui lòng chọn khóa học!' }]}
              >
                <Select
                  placeholder="Chọn khóa học"
                  options={courseOptions}
                  showSearch
                  optionFilterProp="label"
                  disabled={isEditMode}
                />
              </Form.Item>

              <Form.Item
                label="Mã bài học"
                name="code"
                rules={[{ required: !isEditMode, message: 'Vui lòng nhập mã bài học!' }]}
              >
                <Input placeholder="Ví dụ: LESSON-001" disabled={isEditMode} />
              </Form.Item>
            </div>

            {/* Tên bài học */}
            <Form.Item
              label="Tên bài học"
              name="name"
              rules={[
                { required: true, message: 'Vui lòng nhập tên bài học!' },
                { min: 3, message: 'Tên bài học phải có ít nhất 3 ký tự!' },
              ]}
            >
              <Input size="large" placeholder="Nhập tên bài học..." />
            </Form.Item>

            {/* Mô tả */}
            <Form.Item
              label="Mô tả"
              name="description"
            >
              <TextArea rows={2} placeholder="Nhập mô tả bài học..." />
            </Form.Item>

            {/* Row 2: Provider + Format Output */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <Form.Item label="Nhà cung cấp AI" name="providerName">
                <Input placeholder="Ví dụ: openai" />
              </Form.Item>

              <Form.Item label="Format Output" name="formatOutput">
                <Input placeholder="Định dạng đầu ra..." />
              </Form.Item>
            </div>

            {/* System Prompt */}
            <Form.Item label="System Prompt" name="systemPrompt">
              <TextArea
                rows={10}
                placeholder="Nhập system prompt cho AI..."
                className="font-mono text-sm"
              />
            </Form.Item>

            {/* Generation Params */}
            <Form.Item label="Generation Params (JSON)" name="generationParams">
              <TextArea
                rows={3}
                placeholder='{"temperature": 0.7, "max_tokens": 1024}'
                className="font-mono text-sm"
              />
            </Form.Item>

            {/* Trạng thái */}
            <Form.Item label="Đang hoạt động" name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>

            {/* Actions */}
            <Form.Item style={{ marginBottom: 0 }}>
              <div className="flex gap-3">
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  {isEditMode ? 'Cập nhật' : 'Tạo mới'}
                </Button>
                <Button
                  size="large"
                  onClick={() => navigate(getBackPath())}
                  disabled={loading}
                >
                  Hủy
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>

        {/* Checkpoint Editor */}
        <Card className="mt-6" title="Checkpoints">
          <CheckpointEditor
            initialCheckpoints={checkpoints}
            onSave={(updated) => setCheckpoints(updated)}
          />
        </Card>

        {/* Hướng dẫn */}
        <Card className="mt-6" title="Hướng dẫn">
          <div className="space-y-2 text-gray-600">
            <p>• <strong>System Prompt:</strong> Mô tả persona và hành vi của AI trong bài học.</p>
            <p>• <strong>Generation Params:</strong> Tham số điều chỉnh cách AI sinh nội dung (JSON).</p>
            <p>• <strong>Checkpoints:</strong> Các điểm tương tác trong bài học.</p>
            <p>• <strong>Loại Checkpoint:</strong> Narrative (câu chuyện, giới thiệu) hoặc CTA (câu hỏi, tương tác), CTA-Pronunciation (luyện phát âm).</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
