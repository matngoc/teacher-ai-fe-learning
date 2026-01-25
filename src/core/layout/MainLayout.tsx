import {
    UserOutlined,
    LogoutOutlined,
    SettingOutlined,
    StockOutlined,
    HomeOutlined
} from '@ant-design/icons'
import {Button, Menu, Layout, Dropdown} from 'antd';
import {Link, useNavigate} from "react-router";
import {deleteCookie} from "../utils/cookieUtil.ts";
import {Outlet} from "react-router-dom";
import "./style.css";
import {useDispatch, useSelector} from "react-redux";
import {clearUser} from '~/stores/sessionSlice.ts';


const { Header, Content } = Layout;

export default function MainLayout() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.session);

    const handleLogout = () => {
        dispatch(clearUser());
        deleteCookie("token");
        navigate("/login");
    };
    const menuSaItem = [
        { key: "/page/home", label: <Link to="/page/home">Trang chủ</Link>, icon: <HomeOutlined /> },
        { key: "/page/user", label: <Link to="/page/user">Người dùng</Link>, icon: <UserOutlined /> },
        { key: "/page/role", label: <Link to="/page/role">Vai trò</Link>, icon: <SettingOutlined /> },
        { key: "/learn/choose", label: <Link to="/learn/choose">Người học</Link>, icon: <UserOutlined /> },
        { key: "/manage/lessons", label: <Link to="/manage/lessons">Bài học</Link>, icon: <StockOutlined /> },
    ]
    const menuItems = [
        { key: "/page/home", label: <Link to="/page/home">Trang chủ</Link>, icon: <HomeOutlined /> },
        { key: "/learn/choose", label: <Link to="/learn/choose">Người học</Link>, icon: <UserOutlined /> },
        { key: "/manage/lessons", label: <Link to="/manage/lessons">Bài học</Link>, icon: <StockOutlined /> },
    ];
    const userMenu = {
        items: [
            {
                key: "logout",
                icon: <LogoutOutlined />,
                label: "Đăng xuất",
                onClick: handleLogout,
            },
        ],
    };
    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Header className={"header-app"}>
                <div className="header-left">
                    <img src={'/logo.png'} className="header-logo" alt="Logo" />
                    <Menu
                        className={"menu-app"}
                        mode="horizontal"
                        items={user.role == "sa" ? menuSaItem : menuItems}
                        style={{ flex: 1, minWidth: 0, border: 'none' }}
                    />
                </div>

                <Dropdown menu={userMenu} placement="bottomRight">
                    <Button type="text" icon={<UserOutlined />} className="user-button">
                        {user.email}
                    </Button>
                </Dropdown>
            </Header>

            <Content className={"content-app"}>
                <Outlet />
            </Content>
        </Layout>
    );
}

