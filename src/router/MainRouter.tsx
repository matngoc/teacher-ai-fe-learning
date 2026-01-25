import MainLayout from "../core/layout/MainLayout";
import RolePage from "../pages/admin/role";
import PrivateRoute from "./ProtectedRouter.tsx";
import UserPage from "../pages/admin/user";
import LessonManagePage from "../pages/manage/lessons";
import LessonFormPage from "../pages/manage/lessons/form";
import { LessonChooser } from '~/pages/learner/LessonChooser.tsx'
import HomePage from '~/pages/admin/home'

export const MainRouter = {
    path: "/",
    element: (
        <PrivateRoute>
            <MainLayout />
        </PrivateRoute>
    ),
    children: [
        { path: "/page/home", element: <HomePage /> },
        { path: "/page/role", element: <RolePage /> },
        { path: "/page/user", element: <UserPage /> },
        { path: "/learn/choose", element: <LessonChooser /> },
        { path: "/manage/lessons", element: <LessonManagePage /> },
        { path: "/manage/lessons/new", element: <LessonFormPage /> },
        { path: "/manage/lessons/:lessonId", element: <LessonFormPage /> },
    ],
};