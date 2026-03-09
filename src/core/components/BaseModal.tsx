import React from 'react';
import { Modal, type ModalProps } from 'antd';

interface BaseModalProps extends ModalProps {
  title: string;
  open: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  confirmLoading?: boolean;
  children: React.ReactNode;
  width?: number | string;
  okText?: string;
  cancelText?: string;
  footer?: React.ReactNode | null;
}

const BaseModal: React.FC<BaseModalProps> = ({
  title,
  open,
  onOk,
  onCancel,
  confirmLoading = false,
  children,
  width = 600,
  okText = 'Lưu',
  cancelText = 'Hủy',
  footer,
  ...rest
}) => {
  return (
    <Modal
      title={title}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      width={width}
      okText={okText}
      cancelText={cancelText}
      footer={footer}
      destroyOnClose
      maskClosable={false}
      {...rest}
    >
      {children}
    </Modal>
  );
};

export default BaseModal;
