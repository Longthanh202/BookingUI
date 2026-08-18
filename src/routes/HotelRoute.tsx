import { Navigate, Outlet } from "react-router-dom";
import { getUser } from "../utils/auth/auth";

const HotelRoute = () => {

    const user = getUser();

    if (!user)
        return <Navigate to="/login" replace />;

    if (user.Role !== "OWNER") {
        if (user.Role === "ADMIN") return <Navigate to="/admin" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default HotelRoute;