import React, { useEffect, useRef } from 'react';
import { Form, Input, Select, Switch } from 'antd';
import BaseModal from '../../core/components/BaseModal';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { coursesActions } from '../../stores/coursesSlice';
import type { Course, CreateCourseDto, UpdateCourseDto } from '../../api/types';

const LEVEL_OPTIONS = [
  { label: 'Beginner', value: 'BEGINNER' },
  { label: 'Elementary', value: 'ELEMENTARY' },
  { label: 'Intermediate', value: 'INTERMEDIATE' },
  { label: 'Upper Intermediate', value: 'UPPER_INTERMEDIATE' },
  { label: 'Advanced', value: 'ADVANCED' },
];

interface CourseFormModalProps {
  open: boolean;
  record: Course | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CourseFormModal: React.FC<CourseFormModalProps> = ({ open, record, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((s) => s.courses); // successMessage/error NOT consumed here
  const [form] = Form.useForm();
  const isEdit = !!record;
  const prevOpen = useRef(false);


  useEffect(() => {
    prevOpen.current = open;
    if (!open) {
      form.resetFields();
    } else if (record) {
      form.setFieldsValue({ ...record });
    } else {
      form.setFieldsValue({ isActive: true });
    }
  }, [open, record, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (isEdit && record) {
        const { code: _, ...updateData } = values;
        const result = await dispatch(
          coursesActions.updateItem({ id: record.id, data: updateData as UpdateCourseDto }),
        );
        if (coursesActions.updateItem.fulfilled.match(result)) {
          onSuccess();
        }
      } else {
        const result = await dispatch(coursesActions.createItem(values as CreateCourseDto));
        if (coursesActions.createItem.fulfilled.match(result)) {
          onSuccess();
        }
      }
    } catch {
      // form validation error
    }
  };

  return (
    <BaseModal
      title={isEdit ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          label="Tên khóa học"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên khóa học!' }]}
        >
          <Input placeholder="Ví dụ: English for Beginners" />
        </Form.Item>

        <Form.Item
          label="Mã khóa học"
          name="code"
          rules={[
            { required: !isEdit, message: 'Vui lòng nhập mã khóa học!' },
            { pattern: /^[a-zA-Z0-9-]+$/, message: 'Mã chỉ chứa chữ, số và dấu gạch ngang!' },
          ]}
        >
          <Input placeholder="Ví dụ: ENG-001" disabled={isEdit} />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={3} placeholder="Mô tả khóa học..." />
        </Form.Item>

        <Form.Item label="Cấp độ" name="level">
          <Select placeholder="Chọn cấp độ" allowClear options={LEVEL_OPTIONS} />
        </Form.Item>

        <Form.Item label="URL hình ảnh" name="imageUrl">
          <Input placeholder="https://example.com/image.jpg" />
        </Form.Item>

        <Form.Item label="Đang hoạt động" name="isActive" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </BaseModal>
  );
};

export default CourseFormModal;
