import { Navigate, Outlet } from "react-router-dom";
import {getCookie} from "../utils/cookieUtil";

export default function RedirectIfAuth() {
    const token = getCookie("token");
    if (token) {
        return <Navigate to="/dashboard" replace />;
    }
    return <Outlet />;
}