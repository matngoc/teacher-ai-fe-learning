import {useDispatch, useSelector} from "react-redux";
import type { RootState } from "../../../stores";
import type { AppDispatch } from "../../../stores";
import {useEffect, useState} from "react";
import {Form, Input, Modal} from "antd";
import {BaseTableCrud} from "../../../core/components/table";
import {roleActions} from "../../../stores/roleSlice.ts";

export default function RolePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { list, total, loading, page, filters, pageSize } = useSelector((s: RootState) => s.role);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(roleActions.getPage({page: page, filters: filters, size: pageSize}));
  }, [page, filters, pageSize]);

  const columns = [
    { dataIndex: "_id", key: "_id", hidden: true },
    { title: "Tên vai trò", dataIndex: "name", key: "name" },
    { title: "Mô tả", dataIndex: "description", key: "description" }
  ];

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editRecord) {
      await dispatch(roleActions.updateData({ id: editRecord._id, data: values }));
    } else {
      await dispatch(roleActions.createData(values));
    }
    setModalOpen(false);
    setEditRecord(null);
    form.resetFields();
  };

  return (
      <>
        <BaseTableCrud
            columns={columns}
            data={list}
            total={total}
            page={page}
            loading={loading}
            onFilterChange={(kw) => dispatch(roleActions.applyFilters(kw))}
            onResetFilter={() => dispatch(roleActions.resetFilters())}
            onPageChange={(p) => dispatch(roleActions.setPage(p))}
            onCreate={() => setModalOpen(true)}
            onEdit={(record) => {
              setEditRecord(record);
              form.setFieldsValue(record);
              setModalOpen(true);
            }}
            onDelete={(id) => dispatch(roleActions.deleteData(id))}
        />

        <Modal
            title={editRecord ? "Sửa vai trò" : "Thêm vai trò"}
            open={isModalOpen}
            onOk={handleSubmit}
            cancelText={"Đóng"}
            okText={"Lưu"}
            onCancel={() => {
              setModalOpen(false);
              setEditRecord(null);
              form.resetFields();
            }}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="Tên vai trò" rules={[{ required: true, message: "Tên vai trò bắt buộc nhập" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Mô tả" >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </>
  );
}