import {useEffect } from "react";
import {Button, Form, type FormProps, Input } from "antd";
import {useWatch} from "antd/es/form/Form";
import {FormOutlined, LoginOutlined} from "@ant-design/icons";
import {AuthService} from "../../../api/services/AuthService";
import "../style.css";
import {useAuth} from "../../../core/context/authContext.ts";
import {useNavigate} from "react-router";
import type {UserProfile} from "../../../stores/userSlice.ts";
import {useDispatch} from "react-redux";
import {setUser} from "../../../stores/sessionSlice.ts";

export default function LoginPage() {
    const [loginForm] = Form.useForm();
    const pass_w = useWatch('password', loginForm);
    const navigate = useNavigate();
    const { login } = useAuth();
    const dispatch = useDispatch();

    useEffect(() => {
        loginForm.setFieldsValue({
            password: typeof window !== "undefined" ? navigator.userAgent : ""
        })
    }, [pass_w]);

    const handleLogin = async () => {
        try {
            await loginForm.validateFields();
            await AuthService.login({
                body: {
                    ...loginForm.getFieldsValue()
                },
            }).then((res: any) => {
                login(res.access_token);
            });
            await AuthService.profile().then((res: UserProfile) => {
                dispatch(setUser({
                    userId: res.userId,
                    email: res.email,
                    role: res.role,
                    roleId: res.roleId,
                }));
                navigate("/page/dashboard");
            });

        } catch (err) {
            console.error(err);
        }
    };
    const onFinishFailed: FormProps['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <div className="login-container">
            <div className={'login-form'}>
                <Form
                    form={loginForm}
                    labelCol={{span: 6}}
                    labelAlign={'left'}
                    initialValues={{ remember: true }}
                    onFinish={handleLogin}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <div className={'flex justify-center w-full'}>
                        <img className={'logo-login'} src={'public/logo.png'} />
                    </div>

                    <h1 className="primary-header-text">Đăng nhập</h1>
                    <Form.Item
                        required
                        name="email"
                        rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
                    >
                        <Input placeholder={'Email'}/>
                    </Form.Item>
                    <Form.Item
                        required
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password readOnly />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className={'w-full'}>
                            <LoginOutlined /> Đăng nhập
                        </Button>
                        <Button type="default" className={'w-full mt-3'}
                                onClick={() => {navigate('/register')}}
                        >
                            <FormOutlined /> Đăng ký tài khoản
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}