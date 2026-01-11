import MainLayout from "../core/layout/MainLayout";
import RolePage from "../pages/admin/role";
import PrivateRoute from "./ProtectedRouter.tsx";
import UserPage from "../pages/admin/user";
import LearnerPage from "../pages/learner";
import LessonManagePage from "../pages/manage/lessons";
import LessonFormPage from "../pages/manage/lessons/form";

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

export const ManageRouter = {
    path: "/manage",
    element: (
        <PrivateRoute>
            <MainLayout />
        </PrivateRoute>
    ),
    children: [
        { path: "/manage/lessons", element: <LessonManagePage /> },
        { path: "/manage/lessons/new", element: <LessonFormPage /> },
        { path: "/manage/lessons/:lessonId", element: <LessonFormPage /> },
    ],
};