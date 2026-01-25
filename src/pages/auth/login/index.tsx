import {Button, Form, Input, message} from "antd";
import {FormOutlined, LoginOutlined} from "@ant-design/icons";
import {AuthService} from '~/api/services/AuthService.ts';
import "../style.css";
import {useAuth} from '~/core/context/authContext.ts';
import {useNavigate} from "react-router";
import type {UserProfile} from '~/stores/userSlice.ts';
import {useDispatch} from "react-redux";
import {setUser} from '~/stores/sessionSlice.ts';
import {useState} from 'react';
import { toast } from 'react-toastify'

export default function LoginPage() {
    const [loginForm] = Form.useForm();
    const navigate = useNavigate();
    const { login } = useAuth();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setIsLoading(true);
            await loginForm.validateFields();

            const loginRes: any = await AuthService.login({
                body: {
                    ...loginForm.getFieldsValue()
                },
            });

            login(loginRes.access_token);

            const profileRes: UserProfile = await AuthService.profile();
            dispatch(setUser({
                userId: profileRes.userId,
                email: profileRes.email,
                role: profileRes.role,
                roleId: profileRes.roleId,
            }));

            toast.success('Đăng nhập thành công!');
            navigate("/page/home");
        } catch (err) {
            toast.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!');
            setIsLoading(false);
        }
    };

    const handleRegisterClick = () => {
        navigate('/register');
    };

    return (
        <div className="login-container">
            <div className="login-wrapper">
                <div className="login-form">
                    <div className="login-form-header">
                        <img className="logo-login" src="public/logo.png" alt="Logo" />
                        <h1 className="login-form-title">Đăng Nhập</h1>
                        <p className="login-form-subtitle">Chào mừng bạn quay trở lại với Hana!</p>
                    </div>

                    <Form
                        form={loginForm}
                        layout="vertical"
                        onFinish={handleLogin}
                        autoComplete="off"
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                // { type: 'email', message: 'Email không hợp lệ!' }
                            ]}
                        >
                            <Input
                                placeholder="Nhập địa chỉ email"
                                // type="email"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                // { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
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
                                <LoginOutlined /> Đăng Nhập
                            </Button>
                            <Button
                                type="default"
                                onClick={handleRegisterClick}
                                disabled={isLoading}
                            >
                                <FormOutlined /> Tạo Tài Khoản Mới
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
}