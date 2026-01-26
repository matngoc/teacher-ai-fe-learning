import { Modal, Form } from "antd";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from '~/stores';
import type { AppDispatch } from '~/stores';
import {useEffect, useState} from "react";
import {userActions} from '~/stores/userSlice.ts';
import {BaseTableCrud} from '~/core/components/table';
import type {ColumnsType} from "antd/es/table";
import DateUtil from "../../../core/utils/dateUtil.ts";
import {CreateOrUpdateUserForm} from "./CreatorOrUpdateForm.tsx";
import {CloseOutlined, CheckOutlined} from "@ant-design/icons";

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
            key: "email",
            width: 200,
        },
        {
            title: "Tên đầy đủ",
            dataIndex: "fullName",
            key: "fullName",
            width: 150,
        },
        {
            title: "Tuổi",
            dataIndex: "age",
            key: "age",
            align: "center",
            width: 80,
        },
        {
            title: "Công việc",
            dataIndex: "job",
            key: "job",
            width: 150,
        },
        {
            title: "Trình độ tiếng Anh",
            dataIndex: "englishLevel",
            key: "englishLevel",
            width: 150,
            render: (value) => {
                const levels: Record<string, string> = {
                    'beginner': 'Gần như không nói được',
                    'elementary': 'Nói được câu đơn giản',
                    'pre_intermediate': 'Giao tiếp tình huống quen thuộc',
                    'intermediate': 'Khá tự tin',
                    'advanced': 'Rất tự tin'
                };
                return levels[value] || value;
            }
        },
        {
            title: "Mục đích học",
            dataIndex: "motivation",
            key: "motivation",
            width: 200,
            render: (value) => {
                try {
                    const motivations = JSON.parse(value || '[]');
                    const motivationLabels: Record<string, string> = {
                        'work_communication': 'Giao tiếp công việc',
                        'interview_promotion': 'Phỏng vấn/thăng tiến',
                        'daily_communication': 'Giao tiếp hàng ngày',
                        'travel_international': 'Du lịch',
                        'study_abroad': 'Học tập/du học',
                        'confidence_with_foreigners': 'Tự tin với người nước ngoài'
                    };
                    return motivations.map((m: string) => motivationLabels[m] || m).join(', ');
                } catch {
                    return value;
                }
            }
        },
        {
            title: "Chủ đề yêu thích",
            dataIndex: "favouriteTopic",
            key: "favouriteTopic",
            width: 200,
            render: (value) => {
                try {
                    const topics = JSON.parse(value || '[]');
                    const topicLabels: Record<string, string> = {
                        'work_career': 'Công việc & sự nghiệp',
                        'daily_life': 'Đời sống hàng ngày',
                        'travel': 'Du lịch',
                        'self_development': 'Tâm lý - phát triển bản thân',
                        'entertainment': 'Giải trí',
                        'business_startup': 'Kinh doanh/khởi nghiệp'
                    };
                    return topics.map((t: string) => topicLabels[t] || t).join(', ');
                } catch {
                    return value;
                }
            }
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            width: 150,
        },
        {
            title: "Ngày tạo",
            dataIndex: "creationTime",
            key: "creationTime",
            align: "center",
            width: 120,
            render: _value => DateUtil.toFormat(_value, 'DD/MM/YYYY')
        },
        {
            title: "Cập nhật gần nhất",
            dataIndex: "modificationTime",
            key: "modificationTime",
            align: "center",
            width: 150,
            render: _value => _value ? DateUtil.toFormat(_value, 'DD/MM/YYYY HH:mm') : "-"
        },
        {
            title: "Vai trò",
            key: "role",
            width: 120,
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
              pageSize={pageSize}
              loading={loading}
              scroll={{ x: 1800 }}
              breadcrumbs={[
                  {
                      href: '/page/user',
                      title: 'Người dùng',
                  },
              ]}
              onFilterChange={(kw) => dispatch(userActions.applyFilters(kw))}
              onResetFilter={() => dispatch(userActions.resetFilters())}
              onPageChange={(p) => dispatch(userActions.setPage(p))}
              onPageSizeChange={(size) => dispatch(userActions.setPageSize(size))}
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
                width={800}
                style={{ top: 30 }}
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
