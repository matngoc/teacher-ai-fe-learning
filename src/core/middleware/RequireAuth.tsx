import { Navigate, Outlet } from "react-router-dom";
import {getCookie} from "../utils/cookieUtil";

export default function RequireAuth() {
    const token = getCookie("token");
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
}