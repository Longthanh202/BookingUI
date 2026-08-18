import { Navigate, Outlet } from "react-router-dom";
import { getUser } from "../utils/auth/auth";

const AdminRoute = () => {

    const user = getUser();

    if (!user)
        return <Navigate to="/login" replace />;

    if (user.Role !== "ADMIN") {
        if (user.Role === "OWNER") return <Navigate to="/owner" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;