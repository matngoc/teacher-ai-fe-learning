import { Modal, Form } from "antd";
import { useSelector, useDispatch } from "react-redux";
import type {AppDispatch, RootState} from "../../../stores";
import {useEffect, useState} from "react";
import {userActions} from "../../../stores/userSlice.ts";
import {BaseTableCrud} from "../../../core/components/table";
import type {ColumnsType} from "antd/es/table";
import DateUtil from "../../../core/utils/dateUtil.ts";
import {CreateOrUpdateUserForm} from "./CreatorOrUpdateForm.tsx";

export default function UserPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { list, total, loading, page, filters, pageSize } = useSelector((s: RootState) => s.user);

    const [isModalOpen, setModalOpen] = useState(false);
    const [editRecord, setEditRecord] = useState<any>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        dispatch(userActions.getPage({page: page, filters: filters, size: pageSize}));
    }, [page, filters, pageSize]);

    const columns: ColumnsType<any> = [
        {
            title: "ID",
            dataIndex: "_id",
            key: "_id",
            hidden: true
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email"
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description"
        },
        {
            title: "Ngày tạo",
            dataIndex: "creationTime",
            key: "creationTime",
            align: "center",
            render: _value => DateUtil.toFormat(_value, 'DD/MM/YYYY')
        },
        {
            title: "Cập nhật gần nhất",
            dataIndex: "modificationTime",
            key: "modificationTime",
            align: "center",
            render: _value => _value ? DateUtil.toFormat(_value, 'DD/MM/YYYY HH:mm') : "-"
        },
        {
            title: "Vai trò",
            key: "role",
            render: (_value: any, record: any) => <p>{record.roleId?.name}</p>
        },
    ];

    const handleSubmit = async () => {
        const values = await form.validateFields();
        if (editRecord) {
            await dispatch(userActions.updateData({ id: editRecord._id, data: values }));
        } else {
            await dispatch(userActions.createData(values));
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
                onFilterChange={(kw) => dispatch(userActions.applyFilters(kw))}
                onResetFilter={() => dispatch(userActions.resetFilters())}
                onPageChange={(p) => dispatch(userActions.setPage(p))}
                onCreate={() => setModalOpen(true)}
                onEdit={(record) => {
                    setEditRecord(record);
                    form.setFieldsValue(record);
                    setModalOpen(true);
                }}
                onDelete={(id) => dispatch(userActions.deleteData(id))}
            />

            <Modal
                title={editRecord ? "Sửa người dùng" : "Thêm người dùng"}
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
                    <CreateOrUpdateUserForm />
                </Form>
            </Modal>
        </>
    );
}
