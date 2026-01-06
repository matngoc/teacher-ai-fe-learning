import MainLayout from "../core/layout/MainLayout";
import RolePage from "../pages/admin/role";
import PrivateRoute from "./ProtectedRouter.tsx";
import UserPage from "../pages/admin/user";
import LearnerPage from "../pages/learner";

export const MainRouter = {
    path: "/page",
    element: (
        <PrivateRoute>
            <MainLayout />
        </PrivateRoute>
    ),
    children: [
        { path: "/page/role", element: <RolePage /> },
        { path: "/page/user", element: <UserPage /> },
        { path: "/page/learn", element: <LearnerPage /> },
    ],
};