import AuthLayout from "../core/layout/AuthLayout";
import LoginPage from "../pages/auth/login";
import RegisterPage from "../pages/auth/register";

export const AuthRouter = {
    path: "/",
    element: <AuthLayout />,
    children: [
        { path: "/login", element: <LoginPage /> },
        { path: "/register", element: <RegisterPage /> },
    ],
};
