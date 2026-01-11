
import type {JSX} from "react";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
    // const { isAuthenticated } = useAuth();

    // if (!isAuthenticated) {
    //     return <Navigate to="/login" replace />;
    // }

    return children;
}