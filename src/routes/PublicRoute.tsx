import { Navigate, Outlet } from "react-router-dom";
import { getUser } from "../utils/auth/auth";

const PublicRoute = () => {

    const user = getUser();

    if (!user)
        return <Outlet />;

    switch (user.Role) {

        case "ADMIN":
            return <Navigate to="/admin" replace />;

        case "HOTEL":
            return <Navigate to="/hotel" replace />;

        default:
            return <Navigate to="/" replace />;
    }
};

export default PublicRoute;