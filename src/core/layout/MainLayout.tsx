import {
    UserOutlined,
    HomeOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined,
    SettingOutlined,
    GroupOutlined,
    ClusterOutlined,
    StockOutlined
} from "@ant-design/icons";
import {Button, Menu, Layout, Dropdown} from 'antd';
import {useState} from "react";
import {Link, useNavigate} from "react-router";
import {deleteCookie} from "../utils/cookieUtil.ts";
import {Outlet} from "react-router-dom";
import "./style.css";
import {useDispatch, useSelector} from "react-redux";
import {clearUser} from "../../stores/sessionSlice.ts";


const { Header, Sider, Content } = Layout;

export default function MainLayout() {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.session);

    const handleLogout = () => {
        dispatch(clearUser());
        deleteCookie("token");
        navigate("/login");
    };
    const menuSaItem = [
        { key: "/page/user", label: <Link to="/page/user">Người dùng</Link>, icon: <UserOutlined /> },
        { key: "/page/role", label: <Link to="/page/role">Vai trò</Link>, icon: <SettingOutlined /> },
    ]
    const menuItems = [
        { key: "/page/dashboard", label: <Link to="/page/dashboard">Dashboard</Link>, icon: <HomeOutlined /> },
        { key: "/page/vote", label: <Link to="/page/vote">Vote</Link>, icon: <ClusterOutlined /> },
        { key: "/page/campaign", label: <Link to="/page/campaign">Chiến dịch</Link>, icon: <GroupOutlined /> },
        { key: "/page/transaction", label: <Link to="/page/transaction">Thống kê</Link>, icon: <StockOutlined /> },
    ];
    const userMenu = {
        items: [
            {
                key: "logout",
                icon: <LogoutOutlined />,
                label: "Logout",
                onClick: handleLogout,
            },
        ],
    };
    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider className={"slider-app"} collapsible collapsed={collapsed} trigger={null}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                    }}
                    className="my-3"
                >
                    <img src={'/logo.png'} style={{width: 80, height: 60, alignItems: "center"}} />
                </div>
                <Menu
                    className={"menu-app"}
                    mode="inline"
                    items={user.role == "sa" ? menuSaItem : menuItems}
                />
            </Sider>

            <Layout>
                <Header className={"header-app"}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: "16px", width: 40, height: 40 }}
                    />

                    <Dropdown menu={userMenu} placement="bottomRight">
                        <Button type="text" icon={<UserOutlined />}>
                            {user.email}
                        </Button>
                    </Dropdown>
                </Header>

                <Content className={"content-app"}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}

