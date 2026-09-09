import { Navigate, Route, Routes } from "react-router-dom";
import CustomerHomePage from "../pages/customer/CustomerHomePage";
import HotelSearchResultsPage from "../pages/customer/HotelSearchResultsPage";
import HotelDetailPage from "../pages/customer/HotelDetailPage";
import BookingSummaryPage from "../pages/customer/BookingSummaryPage";
import BookingHistoryPage from "../pages/customer/BookingHistoryPage";
import PaymentPage from "../pages/customer/PaymentPage";
import AdminLoginPage from "../pages/auth/AdminLoginPage";
import CustomerLoginPage from "../pages/auth/CustomerLoginPage";
import CustomerRegistrationPage from "../pages/auth/CustomerRegistrationPage";
import Dashboard from "../pages/dashboard/Dashboard";
import AdminLayout from "../layouts/AdminLayout";
import OwnerLayout from "../layouts/OwnerLayout";
import OwnerHotelListPage from "../pages/owner/OwnerHotelListPage";
import OwnerHotelDetailPage from "../pages/owner/OwnerHotelDetailPage";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./AdminRoute";
import HotelRoute from "./HotelRoute";
import CustomerRoute from "./CustomerRoute";
import OwnerCommissionPage from "../pages/commission/OwnerCommissionPage";

const AppRouters = () => {
    return (
        <Routes>

            {/* ================= PUBLIC ================= */}
          

                <Route index element={<CustomerHomePage />} />

                <Route path="search-results" element={<HotelSearchResultsPage />} />

                <Route path="login" element={<AdminLoginPage />} />

                <Route path="customer-login" element={<CustomerLoginPage />} />

                <Route path="register" element={<CustomerRegistrationPage />} />

                <Route path="rooms/:id" element={<HotelDetailPage />} />

                <Route path="booking/summary" element={<BookingSummaryPage />} />

                <Route path="booking/payment" element={<PaymentPage />} />


            {/* ================= CUSTOMER ================= */}

            <Route element={<CustomerRoute />}>

                <Route path="bookings" element={<BookingHistoryPage />} />

            </Route>

            {/* ================= HOTEL OWNER ================= */}

            <Route path="/owner" element={<HotelRoute />}>
                <Route element={<OwnerLayout />}>
                  <Route index element={<Navigate to="hotels" replace />} />
                  <Route path="hotels" element={<OwnerHotelListPage />} />
                  <Route path="hotels/:id" element={<OwnerHotelDetailPage />} />
                  <Route path="hoahong" element={<OwnerCommissionPage />}/>
                </Route>
            </Route>

            {/* ================= ADMIN ================= */}

            <Route path="/admin" element={<PrivateRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />

                  <Route path="hotels" element={<OwnerHotelListPage />} />

                  <Route path="hotels/:id" element={<OwnerHotelDetailPage />} />

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