import {Col, Form, Input, Row, InputNumber, Select} from "antd";
import BaseSelect from "../../../core/components/BaseSelect.tsx";
import {useSelectRole} from '~/core/select/roleSelectOption.ts';

export const CreateOrUpdateUserForm = () => {
    // @ts-ignore
    return (
        <Row gutter={16}>
            <Col span={12} style={{marginBottom: 0}}>
                <Form.Item name="email" label="Email" rules={[{ required: true, message: "Email bắt buộc nhập" }]}>
                    <Input />
                </Form.Item>
            </Col>
          <Col span={12} style={{marginBottom: 0}}>
            <Form.Item name={"roleId"} label={"Vai trò"}>
              <BaseSelect fetchOptions={useSelectRole}/>
            </Form.Item>
          </Col>
            <Col span={12} style={{marginBottom: 0}}>
                <Form.Item name="fullName" label="Tên đầy đủ" rules={[{ required: true, message: "Tên đầy đủ bắt buộc nhập" }]}>
                    <Input />
                </Form.Item>
            </Col>

            <Col span={4} style={{marginBottom: 0}}>
                <Form.Item name="age" label="Tuổi" rules={[{ required: true, message: "Tuổi bắt buộc nhập" }]}>
                    <InputNumber style={{ width: '100%' }} min={1} max={120} />
                </Form.Item>
            </Col>

            <Col span={8} style={{marginBottom: 0}}>
                <Form.Item name="job" label="Công việc hiện tại" rules={[{ required: true, message: "Công việc bắt buộc nhập" }]}>
                    <Input />
                </Form.Item>
            </Col>

            <Col span={24} style={{marginBottom: 0}}>
                <Form.Item name="englishLevel" label="Trình độ tiếng Anh" rules={[{ required: true, message: "Trình độ bắt buộc chọn" }]}>
                    <Select placeholder="Chọn trình độ tiếng Anh">
                        <Select.Option value="beginner">Gần như không nói được</Select.Option>
                        <Select.Option value="elementary">Nói được câu đơn giản</Select.Option>
                        <Select.Option value="pre_intermediate">Giao tiếp tình huống quen thuộc</Select.Option>
                        <Select.Option value="intermediate">Khá tự tin</Select.Option>
                        <Select.Option value="advanced">Rất tự tin</Select.Option>
                    </Select>
                </Form.Item>
            </Col>

            <Col span={24} style={{marginBottom: 0}}>
                <Form.Item
                    name="motivation"
                    label="Mục đích học tiếng Anh"
                    rules={[{ required: true, message: "Mục đích bắt buộc chọn" }]}
                    getValueFromEvent={(selectedValues) => JSON.stringify(selectedValues)}
                    getValueProps={(value) => ({ value: typeof value === 'string' ? JSON.parse(value || '[]') : value })}
                >
                    <Select
                        mode="multiple"
                        placeholder="Chọn mục đích học tiếng Anh"
                        maxTagCount="responsive"
                    >
                        <Select.Option value="work_communication">Giao tiếp công việc</Select.Option>
                        <Select.Option value="interview_promotion">Phỏng vấn/thăng tiến</Select.Option>
                        <Select.Option value="daily_communication">Giao tiếp hàng ngày</Select.Option>
                        <Select.Option value="travel_international">Du lịch</Select.Option>
                        <Select.Option value="study_abroad">Học tập/du học</Select.Option>
                        <Select.Option value="confidence_with_foreigners">Tự tin với người nước ngoài</Select.Option>
                    </Select>
                </Form.Item>
            </Col>

            <Col span={24} style={{marginBottom: 0}}>
                <Form.Item
                    name="favouriteTopic"
                    label="Chủ đề yêu thích (tối đa 3)"
                    rules={[
                        { required: true, message: "Chủ đề bắt buộc chọn" },
                        {
                            validator: (_, value) => {
                                const topics = typeof value === 'string' ? JSON.parse(value || '[]') : value;
                                if (topics && topics.length > 3) {
                                    return Promise.reject(new Error('Chỉ được chọn tối đa 3 chủ đề!'));
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                    getValueFromEvent={(selectedValues) => JSON.stringify(selectedValues)}
                    getValueProps={(value) => ({ value: typeof value === 'string' ? JSON.parse(value || '[]') : value })}
                >
                    <Select
                        mode="multiple"
                        placeholder="Chọn chủ đề yêu thích (tối đa 3)"
                        maxTagCount="responsive"
                    >
                        <Select.Option value="work_career">Công việc & sự nghiệp</Select.Option>
                        <Select.Option value="daily_life">Đời sống hàng ngày</Select.Option>
                        <Select.Option value="travel">Du lịch</Select.Option>
                        <Select.Option value="self_development">Tâm lý - phát triển bản thân</Select.Option>
                        <Select.Option value="entertainment">Giải trí</Select.Option>
                        <Select.Option value="business_startup">Kinh doanh/khởi nghiệp</Select.Option>
                    </Select>
                </Form.Item>
            </Col>
        </Row>
    );
}