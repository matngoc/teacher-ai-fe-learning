import {Col, Form, Input, Row} from "antd";
import BaseSelect from "../../../core/components/BaseSelect.tsx";
import {useSelectRole} from "../../../core/select/roleSelectOption.ts";

export const CreateOrUpdateUserForm = () => {
    // @ts-ignore
    return (
        <Row gutter={16}>
            <Col span={24} style={{marginBottom: 0}}>
                <Form.Item name="email" label="Email" rules={[{ required: true, message: "Email bắt buộc nhập" }]}>
                    <Input />
                </Form.Item>
            </Col>
            <Col span={24} style={{marginBottom: 0}}>
                <Form.Item name="description" label="Mô tả" >
                    <Input allowClear/>
                </Form.Item>
                <Form.Item name={"password"} initialValue={navigator.userAgent}></Form.Item>
            </Col>
            <Col span={24} style={{marginBottom: 0}}>
                <Form.Item name={"roleId"} label={"Vai trò"}>
                    <BaseSelect fetchOptions={useSelectRole}/>
                </Form.Item>
            </Col>
        </Row>
    );
}