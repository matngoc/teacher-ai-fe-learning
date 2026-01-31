import {Button, Form, Input, message, InputNumber, Select} from "antd";
import {useNavigate} from "react-router";
import {AuthService} from '~/api/services/AuthService.ts';
import {ArrowLeftOutlined, UserAddOutlined} from "@ant-design/icons";
import {useState} from 'react';
import "../style.css";
import { toast } from 'react-toastify'

export default function RegisterPage() {
    const [registerForm] = Form.useForm();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        try {
            setIsLoading(true);
            await registerForm.validateFields();
            const formValues = registerForm.getFieldsValue();

            // Convert motivation array to JSON string
            const requestBody = {
                ...formValues,
                motivation: JSON.stringify(formValues.motivation || []),
                favouriteTopic: JSON.stringify(formValues.favouriteTopic || [])
            };

            AuthService.register({
                body: requestBody,
            }).then((res) => {
                if(res) {
                    toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
                    navigate("/login");
                } else {
                    toast.error(res.message || 'Đăng ký thất bại. Vui lòng thử lại!');
                }
            }).catch((_err) => {
                toast.error('Đăng ký thất bại. Vui lòng thử lại!');
            }).finally(() => {
                setIsLoading(false);
            });
        } catch (err) {
            toast.error('Đăng ký thất bại. Vui lòng thử lại!');
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-wrapper">
                <div className="register-form">
                    <div className="login-form-header">
                        <img className="logo-login" src="/logo.png" alt="Logo" />
                        <h1 className="login-form-title">Đăng Ký Tài Khoản</h1>
                        <p className="login-form-subtitle">Tạo một tài khoản mới để bắt đầu</p>
                    </div>
                    <Form
                        form={registerForm}
                        layout="vertical"
                        onFinish={handleRegister}
                        autoComplete="off"
                        initialValues={{
                            motivation: [],
                            favouriteTopic: []
                        }}
                    >
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' }
                            ]}
                        >
                            <Input
                                placeholder="Nhập địa chỉ email"
                                type="email"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                            ]}
                        >
                            <Input.Password placeholder="Nhập mật khẩu" />
                        </Form.Item>

                        <Form.Item
                            name="fullName"
                            label="Tên đầy đủ"
                            rules={[
                                { required: true, message: 'Vui lòng nhập họ tên!' }
                            ]}
                        >
                            <Input placeholder="Nhập họ và tên đầy đủ" />
                        </Form.Item>

                        <Form.Item
                            name="age"
                            label="Tuổi"
                            rules={[
                                { required: true, message: 'Vui lòng nhập tuổi!' },
                                { type: 'number', min: 1, max: 120, message: 'Tuổi không hợp lệ!' }
                            ]}
                        >
                            <InputNumber
                                placeholder="Nhập tuổi của bạn"
                                style={{ width: '100%' }}
                                min={1}
                                max={120}
                            />
                        </Form.Item>

                        <Form.Item
                            name="job"
                            label="Công việc hiện tại"
                            rules={[
                                { required: true, message: 'Vui lòng nhập công việc hiện tại!' }
                            ]}
                        >
                            <Input placeholder="Nhập công việc hiện tại của bạn" />
                        </Form.Item>

                        <Form.Item
                            name="motivation"
                            label="Bạn học tiếng Anh với mục đích gì?"
                            rules={[
                                { required: true, message: 'Vui lòng chọn ít nhất một mục đích!' }
                            ]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Chọn mục đích học tiếng Anh"
                                maxTagCount="responsive"
                            >
                                <Select.Option value="work_communication">Giao tiếp trong công việc</Select.Option>
                                <Select.Option value="interview_promotion">Phỏng vấn / thăng tiến</Select.Option>
                                <Select.Option value="daily_communication">Giao tiếp hàng ngày</Select.Option>
                                <Select.Option value="travel_international">Du lịch / sinh hoạt quốc tế</Select.Option>
                                <Select.Option value="study_abroad">Học tập / du học</Select.Option>
                                <Select.Option value="confidence_with_foreigners">Tự tin nói chuyện với người nước ngoài</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="englishLevel"
                            label="Trình độ giao tiếp tiếng Anh hiện tại"
                            rules={[
                                { required: true, message: 'Vui lòng chọn trình độ tiếng Anh!' }
                            ]}
                        >
                            <Select placeholder="Chọn trình độ tiếng Anh">
                                <Select.Option value="beginner">Gần như không nói được</Select.Option>
                                <Select.Option value="elementary">Nói được câu đơn giản nhưng rất ngập ngừng</Select.Option>
                                <Select.Option value="pre_intermediate">Giao tiếp được trong tình huống quen thuộc</Select.Option>
                                <Select.Option value="intermediate">Khá tự tin khi giao tiếp</Select.Option>
                                <Select.Option value="advanced">Rất tự tin</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="favouriteTopic"
                            label="Chủ đề khiến bạn hứng thú khi luyện nói tiếng Anh (chọn tối đa 3)"
                            rules={[
                                { required: true, message: 'Vui lòng chọn ít nhất một chủ đề!' },
                                {
                                    validator: (_, value) => {
                                        if (value && value.length > 3) {
                                            return Promise.reject(new Error('Chỉ được chọn tối đa 3 chủ đề!'));
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Chọn chủ đề yêu thích (tối đa 3)"
                                maxTagCount="responsive"
                            >
                                <Select.Option value="work_career">Công việc & sự nghiệp</Select.Option>
                                <Select.Option value="daily_life">Đời sống hàng ngày</Select.Option>
                                <Select.Option value="travel">Du lịch</Select.Option>
                                <Select.Option value="self_development">Tâm lý – phát triển bản thân</Select.Option>
                                <Select.Option value="entertainment">Giải trí (phim, nhạc, mạng xã hội)</Select.Option>
                                <Select.Option value="business_startup">Kinh doanh / khởi nghiệp</Select.Option>
                            </Select>
                        </Form.Item>

                        <div className="login-buttons">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isLoading}
                            >
                                <UserAddOutlined /> Đăng Ký
                            </Button>
                            <Button
                                type="default"
                                onClick={() => navigate("/login")}
                                disabled={isLoading}
                            >
                                <ArrowLeftOutlined /> Quay Lại Đăng Nhập
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
}