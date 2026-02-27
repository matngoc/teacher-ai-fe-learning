import React, { useEffect } from 'react';
import { Form, Input, Select } from 'antd';
import BaseModal from '../../core/components/BaseModal';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { dictionaryActions } from '../../stores/dictionarySlice';
import type { CreateDictionaryDto, UpdateDictionaryDto, Dictionary } from '../../api/types';

interface DictionaryFormModalProps {
  open: boolean;
  record: Dictionary | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DICT_TYPE_OPTIONS = [
  { label: 'Motivation', value: 'MOTIVATION' },
  { label: 'English Level', value: 'ENGLISH_LEVEL' },
  { label: 'Favourite Topic', value: 'FAVOURITE_TOPIC' },
];

const DictionaryFormModal: React.FC<DictionaryFormModalProps> = ({ open, record, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((s) => s.dictionary);
  const [form] = Form.useForm();
  const isEdit = !!record;


  useEffect(() => {
    if (open && record) {
      form.setFieldsValue(record);
    } else if (!open) {
      form.resetFields();
    }
  }, [open, record, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (isEdit && record) {
        const { value, description } = values;
        const result = await dispatch(dictionaryActions.updateItem({ id: record.id, data: { value, description } as UpdateDictionaryDto }));
        if (dictionaryActions.updateItem.fulfilled.match(result)) {
          onSuccess();
        }
      } else {
        const result = await dispatch(dictionaryActions.createItem(values as CreateDictionaryDto));
        if (dictionaryActions.createItem.fulfilled.match(result)) {
          onSuccess();
        }
      }
    } catch {
      // form validation
    }
  };

  return (
    <BaseModal
      title={isEdit ? 'Chỉnh sửa từ điển' : 'Thêm mục từ điển'}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item label="Key" name="key" rules={[{ required: true, message: 'Vui lòng nhập key!' }]}>
          <Input placeholder="vd: motivation_study" disabled={isEdit} />
        </Form.Item>
        <Form.Item label="Value" name="value" rules={[{ required: true, message: 'Vui lòng nhập value!' }]}>
          <Input placeholder="Giá trị hiển thị" />
        </Form.Item>
        <Form.Item label="Loại" name="type">
          <Select placeholder="Chọn loại" allowClear options={DICT_TYPE_OPTIONS} disabled={isEdit} />
        </Form.Item>
        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={2} placeholder="Mô tả thêm" />
        </Form.Item>
      </Form>
    </BaseModal>
  );
};

export default DictionaryFormModal;
