import { createBrowserRouter } from "react-router-dom";
import NotFoundPage from "../components/NotFoundPage";
import {MainRouter} from "./MainRouter";
import {AuthRouter} from "./AuthRouter";

const router = createBrowserRouter([
    MainRouter,
    AuthRouter,
    { path: "*", element: <NotFoundPage /> },

]);

export default router;
