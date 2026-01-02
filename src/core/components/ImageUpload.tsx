import { useState } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import {message, Upload} from 'antd';
import type { GetProp, UploadProps } from 'antd';
import {CoreService} from "../../api/services/CoreService.ts";

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
};

const beforeUpload = (file: FileType) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        message.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
};

export const UploadImage = ({
                                value,
                                onChange,
                            }: {
    value?: string;
    onChange?: (value: string) => void;
}) => {
    const [loading, setLoading] = useState(false);


    const customRequest: UploadProps['customRequest'] = async (options) => {
        const { file, onSuccess, onError } = options;
        const formData = new FormData();
        formData.append('file', file as Blob);

        try {
            const res = await CoreService.upload({ file: formData.get('file') });
            const imageUrl = `${import.meta.env.VITE_API_URL}/${res.filePath}`;

            message.success('Upload thành công');
            onChange?.(imageUrl);

            onSuccess?.(res, file as any);
        } catch (err) {
            message.error('Upload thất bại');
            onError?.(err as any);
        }
    };

    const handleChange: UploadProps['onChange'] = (info) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            getBase64(info.file.originFileObj as FileType, () => {
                setLoading(false);
            });
        }
    };

    const uploadButton = (
        <button style={{ border: 0, background: 'none', color: "gray" }} type="button">
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8, fontSize: 12 }}>Tải ảnh lên</div>
        </button>
    );

    return (
        <Upload
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            customRequest={customRequest}
            beforeUpload={beforeUpload}
            onChange={handleChange}
        >
            {value ? (
                <img draggable={false} src={value} alt="avatar" style={{ width: '100%' }} />
            ) : (
                uploadButton
            )}
        </Upload>
    );
};