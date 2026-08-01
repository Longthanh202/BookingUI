import { Navigate, Outlet } from "react-router-dom";
import { getUser } from "../utils/auth/auth";

const CustomerRoute = () => {

    const user = getUser();

    if (!user)
        return <Navigate to="/login" replace />;

    if (user.Role !== "CUSTOMER")
        return <Navigate to="/" replace />;

    return <Outlet />;
};

export default CustomerRoute;