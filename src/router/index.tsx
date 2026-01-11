import { createBrowserRouter } from "react-router-dom";
import NotFoundPage from "../components/NotFoundPage";
import {MainRouter} from "./MainRouter";
import {AuthRouter} from "./AuthRouter";
import { LessonChooser } from "../pages/learner/LessonChooser";
import LearnerPage from "../pages/learner";

const router = createBrowserRouter([
    MainRouter,
    AuthRouter,
    // Public route for lesson selection
    {
        path: "/learn/choose",
        element: <LessonChooser />,
    },
    {
        path: "/learn/:id",
        element: <LearnerPage />,
    },
    { path: "*", element: <NotFoundPage /> },

]);

export default router;
