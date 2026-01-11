import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Spin, Space } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { LessonService } from '~/api/services/LessonService';
import { toast } from 'react-toastify';
import { CheckpointEditor } from './components/CheckpointEditor';
import type { Checkpoint } from './types/checkpoint';

const { TextArea } = Input;

export default function LessonFormPage() {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const isEditMode = lessonId && lessonId !== 'new';

  useEffect(() => {
    if (isEditMode) {
      fetchLessonDetail();
    }
  }, [lessonId]);

  const fetchLessonDetail = async () => {
    try {
      setInitialLoading(true);
      const response = await LessonService.getBotDetail(parseInt(lessonId!));
      
      if (response.status === 0 && response.result) {
        const taskChain = response.result.task_chain?.[0];
        
        form.setFieldsValue({
          name: response.result.name,
          description: response.result.description,
          system_prompt: taskChain?.SYSTEM_TASK_DESCRIPTION || '',
        });
        
        if (taskChain?.checkpoints) {
          setCheckpoints(taskChain.checkpoints);
        }
      } else {
        toast.error('Không thể tải thông tin bài học');
        navigate('/manage/lessons');
      }
    } catch (error) {
      console.error('Error fetching lesson detail:', error);
      toast.error('Lỗi khi tải thông tin bài học');
      navigate('/manage/lessons');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const data = {
        name: values.name,
        description: values.description,
        system_prompt: values.system_prompt || '',
        checkpoints,
      };

      if (isEditMode) {
        await LessonService.updateBot({
          id: parseInt(lessonId!),
          ...data,
        });
        toast.success('Cập nhật bài học thành công!');
      } else {
        await LessonService.createBot(data);
        toast.success('Tạo bài học mới thành công!');
      }

      navigate('/manage/lessons');
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error(isEditMode ? 'Lỗi khi cập nhật bài học' : 'Lỗi khi tạo bài học');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Đang tải thông tin bài học..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/manage/lessons')}
            className="mb-4"
          >
            Quay lại danh sách
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'}
          </h1>
        </div>

        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
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

            <Form.Item
              label="Mô tả"
              name="description"
              rules={[
                { required: true, message: 'Vui lòng nhập mô tả!' },
              ]}
            >
              <TextArea
                rows={1}
                placeholder="Nhập mô tả bài học..."
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="System Prompt"
              name="system_prompt"
              rules={[
                { required: true, message: 'Vui lòng nhập system prompt!' },
              ]}
            >
              <TextArea
                rows={12}
                placeholder="Nhập system prompt cho AI..."
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Space>
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
                  onClick={() => navigate('/manage/lessons')}
                  disabled={loading}
                >
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Card className="mt-6" title="Checkpoints">
          <CheckpointEditor 
            initialCheckpoints={checkpoints}
            onSave={(updatedCheckpoints) => setCheckpoints(updatedCheckpoints)}
          />
        </Card>

        <Card className="mt-6" title="Hướng dẫn">
          <div className="space-y-2 text-gray-600">
            <p>• <strong>System Prompt:</strong> Mô tả persona cho AI</p>
            <p>• <strong>Checkpoints:</strong> Các điểm tương tác trong bài học.</p>
            <p>• <strong>Loại Checkpoint:</strong> Narrative (câu chuyện, giới thiệu) hoặc CTA (câu hỏi, tương tác)</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
