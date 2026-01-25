import {Button, Form, Input, message} from "antd";
import {useNavigate} from "react-router";
import {AuthService} from '~/api/services/AuthService.ts';
import {ArrowLeftOutlined, UserAddOutlined} from "@ant-design/icons";
import {useState} from 'react';
import "../style.css";

export default function RegisterPage() {
    const [registerForm] = Form.useForm();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        try {
            setIsLoading(true);
            await registerForm.validateFields();
            const res: any = await AuthService.register({
                body: {
                    ...registerForm.getFieldsValue()
                },
            });
            if(res.code === 200) {
                message.success('Đăng ký thành công! Vui lòng đăng nhập.');
                navigate("/login");
            }
        } catch (err) {
            console.error(err);
            message.error('Đăng ký thất bại. Vui lòng thử lại!');
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-wrapper">
                <div className="login-form">
                    <div className="login-form-header">
                        <img className="logo-login" src="public/logo.png" alt="Logo" />
                        <h1 className="login-form-title">Đăng Ký Tài Khoản</h1>
                        <p className="login-form-subtitle">Tạo một tài khoản mới để bắt đầu</p>
                    </div>

                    <Form
                        form={registerForm}
                        layout="vertical"
                        onFinish={handleRegister}
                        autoComplete="off"
                    >
                        <Form.Item
                            name="email"
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
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                            ]}
                        >
                            <Input.Password placeholder="Nhập mật khẩu" />
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