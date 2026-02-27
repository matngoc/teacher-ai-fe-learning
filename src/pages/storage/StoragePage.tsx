import React, { useState } from 'react';
import {
  Button,
  Card,
  Col,
  message,
  Popconfirm,
  Row,
  Space,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import {
  CopyOutlined,
  DeleteOutlined,
  EyeOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import BasePageHeader from '../../core/components/BasePageHeader';
import { storageService } from '../../api/services/storageService';

const { Dragger } = Upload;
const { Text } = Typography;

interface UploadedFile {
  id: number;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url?: string;
  presignedUrl?: string;
}

const StoragePage: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleUploadSingle = async (file: File) => {
    setUploading(true);
    try {
      const res = await storageService.uploadOne(file);
      setUploadedFiles((prev) => [res, ...prev]);
      message.success(`Upload thành công: ${file.name}`);
    } catch {
      message.error('Upload thất bại!');
    } finally {
      setUploading(false);
    }
    return false;
  };

  const handleUploadMultiple = async () => {
    if (!fileList.length) return;
    setUploading(true);
    try {
      const files = fileList.map((f) => f.originFileObj as File).filter(Boolean);
      const results = await storageService.uploadMultiple(files);
      setUploadedFiles((prev) => [...(Array.isArray(results) ? results : [results]), ...prev]);
      setFileList([]);
      message.success(`Upload ${files.length} file thành công!`);
    } catch {
      message.error('Upload thất bại!');
    } finally {
      setUploading(false);
    }
  };

  const handleGetPresigned = async (id: number) => {
    try {
      const res = await storageService.getPresignedUrl(id);
      const url = res.url || res;
      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, presignedUrl: url } : f)),
      );
      message.success('Đã lấy presigned URL!');
    } catch {
      message.error('Lấy URL thất bại!');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await storageService.deleteFile(id);
      setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
      message.success('Xóa file thành công!');
    } catch {
      message.error('Xóa file thất bại!');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Đã sao chép URL!');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <BasePageHeader title="Lưu trữ File (MinIO)" />

      <Row gutter={[16, 16]}>
        {/* Single upload */}
        <Col xs={24} md={12}>
          <Card title="Upload 1 File" className="h-full">
            <Dragger
              accept="*"
              showUploadList={false}
              beforeUpload={handleUploadSingle}
              disabled={uploading}
            >
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">Kéo thả hoặc click để upload</p>
              <p className="ant-upload-hint">Hỗ trợ tất cả định dạng file</p>
            </Dragger>
          </Card>
        </Col>

        {/* Multiple upload */}
        <Col xs={24} md={12}>
          <Card title="Upload Nhiều File" className="h-full">
            <Dragger
              multiple
              fileList={fileList}
              onChange={({ fileList: fl }) => setFileList(fl)}
              beforeUpload={() => false}
              disabled={uploading}
            >
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">Kéo thả nhiều file cùng lúc</p>
            </Dragger>
            <Button
              type="primary"
              className="mt-3 w-full"
              onClick={handleUploadMultiple}
              loading={uploading}
              disabled={!fileList.length}
            >
              Upload {fileList.length} file
            </Button>
          </Card>
        </Col>
      </Row>

      {/* File list */}
      {uploadedFiles.length > 0 && (
        <Card title="Danh sách file đã upload" className="mt-4">
          <Space direction="vertical" className="w-full" size="small">
            {uploadedFiles.map((file) => (
              <Card key={file.id} size="small" className="bg-gray-50">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{file.originalName || file.filename}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      <Tag>{file.mimeType}</Tag>
                      <span>{formatSize(file.size)}</span>
                    </div>
                    {file.presignedUrl && (
                      <div className="mt-2 flex items-center gap-2">
                        <Text type="secondary" className="text-xs truncate max-w-xs">{file.presignedUrl}</Text>
                        <Tooltip title="Sao chép URL">
                          <Button size="small" icon={<CopyOutlined />} onClick={() => copyToClipboard(file.presignedUrl!)} />
                        </Tooltip>
                      </div>
                    )}
                  </div>
                  <Space>
                    <Tooltip title="Lấy presigned URL">
                      <Button icon={<EyeOutlined />} size="small" onClick={() => handleGetPresigned(file.id)} />
                    </Tooltip>
                    <Popconfirm title="Xóa file này?" onConfirm={() => handleDelete(file.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
                      <Tooltip title="Xóa file">
                        <Button icon={<DeleteOutlined />} size="small" danger />
                      </Tooltip>
                    </Popconfirm>
                  </Space>
                </div>
              </Card>
            ))}
          </Space>
        </Card>
      )}
    </div>
  );
};

export default StoragePage;
