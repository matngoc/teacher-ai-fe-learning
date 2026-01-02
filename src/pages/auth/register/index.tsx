import {Button, Form, type FormProps, Input} from "antd";
import {useWatch} from "antd/es/form/Form";
import {useNavigate} from "react-router";
import {useEffect} from "react";
import {AuthService} from "../../../api/services/AuthService.ts";
import {ArrowLeftOutlined, LoginOutlined} from "@ant-design/icons";
import "../style.css";

export default function RegisterPage() {
    const [registerForm] = Form.useForm();
    const pass_w = useWatch('password', registerForm);
    const navigate = useNavigate();

    useEffect(() => {
        registerForm.setFieldsValue({
            password: typeof window !== "undefined" ? navigator.userAgent : ""
        })
    }, [pass_w]);

    const handleLogin = async () => {
        try {
            await registerForm.validateFields();
            await AuthService.register({
                body: {
                    ...registerForm.getFieldsValue()
                },
            }).then((res: any) => {
                if(res.code === 200) {
                    navigate("/login");
                }
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
                    form={registerForm}
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

                    <h1 className="primary-header-text">Đăng ký</h1>
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
                        <Button className={'w-full mb-3'} onClick={() => {navigate("/login")}}>
                            <ArrowLeftOutlined /> Quay lại
                        </Button>
                        <Button type="primary" htmlType="submit" className={'w-full'}>
                            <LoginOutlined /> Đăng ký
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}