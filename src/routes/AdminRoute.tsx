import { Navigate, Outlet } from "react-router-dom";
import { getUser } from "../utils/auth/auth";

const AdminRoute = () => {

    const user = getUser();

    if (!user)
        return <Navigate to="/admin/login" replace />;

    if (user.Role !== "ADMIN")
        return <Navigate to="/" replace />;

    return <Outlet />;
};

export default AdminRoute;