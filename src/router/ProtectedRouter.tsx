import {Navigate} from "react-router-dom";
import type {JSX} from "react";
import {useAuth} from "../core/context/authContext.ts";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}