import { Navigate, Outlet } from "react-router-dom";
import { getUser } from "../utils/auth/auth";

const CustomerRoute = () => {
    const user = getUser();
    if (!user) {
        return <Navigate to="/customer-login" replace />;
    }

    if (user.Role !== "CUSTOMER") {
        if (user.Role === "ADMIN") {
            return <Navigate to="/admin" replace />;
        }

        if (user.Role === "OWNER") {
            return <Navigate to="/owner" replace />;
        }

        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default CustomerRoute;