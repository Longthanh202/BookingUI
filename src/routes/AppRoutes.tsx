import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/home/HomePage";
import SearchResults from "../pages/home/SearchResults";
import HotelDetail from "../pages/home/HotelDetail";
import BookingSummary from "../pages/home/BookingSummary";
import BookingHistory from "../pages/home/BookingHistory";
import PaymentPage from "../pages/home/PaymentPage";
import Login from "../pages/login/Login";
import CustomerLogin from "../pages/login/CustomerLogin";
import Register from "../pages/login/Register";
import Dashboard from "../pages/dashboard/Dashboard";
import AdminLayout from "../layouts/AdminLayout";
import OwnerLayout from "../layouts/OwnerLayout";
import OwnerHotels from "../pages/khachsansOwner/OwnerHotels";
import OwnerHotelDetail from "../pages/khachsansOwner/OwnerHotelDetail";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./AdminRoute";
import HotelRoute from "./HotelRoute";
import CustomerRoute from "./CustomerRoute";
import HoaHongPage from "../pages/HoaHongOwner/HoaHong";

const AppRouters = () => {
    return (
        <Routes>

            {/* ================= PUBLIC ================= */}
          

                <Route index element={<HomePage />} />

                <Route path="search-results" element={<SearchResults />} />

                <Route path="login" element={<Login />} />

                <Route path="customer-login" element={<CustomerLogin />} />

                <Route path="register" element={<Register />} />

                <Route path="rooms/:id" element={<HotelDetail />} />

                <Route path="booking/summary" element={<BookingSummary />} />

                <Route path="booking/payment" element={<PaymentPage />} />


            {/* ================= CUSTOMER ================= */}

            <Route element={<CustomerRoute />}>

                <Route path="bookings" element={<BookingHistory />} />

            </Route>

            {/* ================= HOTEL OWNER ================= */}

            <Route path="/owner" element={<HotelRoute />}>
                <Route element={<OwnerLayout />}>
                  <Route index element={<Navigate to="hotels" replace />} />
                  <Route path="hotels" element={<OwnerHotels />} />
                  <Route path="hotels/:id" element={<OwnerHotelDetail />} />
                  <Route path="hoahong" element={<HoaHongPage />}/>
                </Route>
            </Route>

            {/* ================= ADMIN ================= */}

            <Route path="/admin" element={<PrivateRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />

                  <Route path="hotels" element={<OwnerHotels />} />

                  <Route path="hotels/:id" element={<OwnerHotelDetail />} />

                  {/* <Route path="payments" element={<AdminPayments />} /> */}
                </Route>
            </Route>

            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />

        </Routes>
    );
};
export default AppRouters;