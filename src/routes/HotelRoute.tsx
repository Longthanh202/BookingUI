import { Navigate, Outlet } from "react-router-dom";
import { getUser } from "../utils/auth/auth";

const HotelRoute = () => {

    const user = getUser();

    if (!user)
        return <Navigate to="/hotel/login" replace />;

    if (user.Role !== "HOTEL")
        return <Navigate to="/" replace />;

    return <Outlet />;
};

export default HotelRoute;