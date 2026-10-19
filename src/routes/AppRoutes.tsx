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
import OwnerRegistrationPage from "../pages/auth/OwnerRegistrationPage";
import Dashboard from "../pages/dashboard/Dashboard";
import AdminLayout from "../layouts/AdminLayout";
import OwnerLayout from "../layouts/OwnerLayout";
import OwnerHotelListPage from "../pages/owner/OwnerHotelListPage";
import OwnerHotelDetailPage from "../pages/owner/OwnerHotelDetailPage";
import PrivateRoute from "./AdminRoute";
import HotelRoute from "./HotelRoute";
import CustomerRoute from "./CustomerRoute";
import OwnerCommissionPage from "../pages/commission/OwnerCommissionPage";
import DashboardOwnerPage from "../pages/owner/DashboardOwnerSummaryPage";
import BookingOwnerPage from "../pages/owner/BookingOwnerPage";
import CalendarOwnerPage from "../pages/owner/CalendarOwnerPage";
import CustomerOwnerPage from "../pages/owner/CustomerOwnerPage";
import ReportOwnerPage from "../pages/owner/ReportOwnerRevenuePage";
import NotificationOwnerPage from "../pages/owner/NotificationOwnerPage";
import CustomerAccountPage from "../pages/customer/CustomerAccountPage";
import CustomerRecoveryPage from "../pages/auth/CustomerRecoveryPage";
import RoomOwnerPage from "../pages/owner/RoomOwnerPage";
import PricingOwnerPage from "../pages/owner/PricingOwnerPage";
import ReviewOwnerPage from "../pages/owner/ReviewOwnerPage";
import WalletOwnerPage from "../pages/owner/WalletOwnerPage";
import AdvertisingOwnerPage from "../pages/owner/AdvertisingOwnerPage";
import AdminBookingsPage from "../pages/admin/AdminBookingsPage";
import AdminHotelsPage from "../pages/admin/AdminHotelsPage";
import AdminPaymentsPage from "../pages/admin/AdminPaymentsPage";
import AdminCommissionsPage from "../pages/admin/AdminCommissionsPage";
import AdminWithdrawalsPage from "../pages/admin/AdminWithdrawalsPage";
import AdminAdvertisingPage from "../pages/admin/AdminAdvertisingPage";
import AdminBannersPage from "../pages/admin/AdminBannersPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminReviewsPage from "../pages/admin/AdminReviewsPage";
import AdminTagsPage from "../pages/admin/AdminTagsPage";
import OwnerRegistrationsPage from "../pages/dashboard/OwnerRegistrationsPage";
import NotFoundPage from "../pages/NotFoundPage";

const AppRouters = () => {
    return (
        <Routes>

            {/* ================= PUBLIC ================= */}


                <Route index element={<CustomerHomePage />} />

                <Route path="search-results" element={<HotelSearchResultsPage />} />

                <Route path="login" element={<AdminLoginPage />} />

                <Route path="owner/login" element={<AdminLoginPage />} />

                <Route path="customer-login" element={<CustomerLoginPage />} />

                <Route path="register" element={<CustomerRegistrationPage />} />
                <Route path="owner/register" element={<OwnerRegistrationPage />} />

                <Route path="rooms/:id" element={<HotelDetailPage />} />

                <Route path="booking/summary" element={<BookingSummaryPage />} />

                <Route path="booking/payment" element={<PaymentPage />} />
                <Route path="forgot-password" element={<CustomerRecoveryPage />} />


            {/* ================= CUSTOMER ================= */}

            <Route element={<CustomerRoute />}>

                <Route path="bookings" element={<BookingHistoryPage />} />
                <Route path="account" element={<CustomerAccountPage />} />
                <Route path="account/:section" element={<CustomerAccountPage />} />

            </Route>

            {/* ================= HOTEL OWNER ================= */}

            <Route path="/owner" element={<HotelRoute />}>
                <Route element={<OwnerLayout />}>
                                    <Route index element={<Navigate to="dashboard" replace />} />
                                    <Route path="dashboard" element={<DashboardOwnerPage />} />
                  <Route path="hotels" element={<OwnerHotelListPage />} />
                  <Route path="hotels/:id" element={<OwnerHotelDetailPage />} />
                                    <Route path="bookings" element={<BookingOwnerPage />} />
                                    <Route path="calendar" element={<CalendarOwnerPage />} />
                                    <Route path="rooms" element={<RoomOwnerPage />} />
                                    <Route path="pricing" element={<PricingOwnerPage />} />
                                    <Route path="customers" element={<CustomerOwnerPage />} />
                                    <Route path="reports" element={<ReportOwnerPage />} />
                                    <Route path="reviews" element={<ReviewOwnerPage />} />
                                    <Route path="staff" element={<NotFoundPage />} />
                                    <Route path="notifications" element={<NotificationOwnerPage />} />
                                    <Route path="wallet" element={<WalletOwnerPage />} />
                                    <Route path="advertising" element={<AdvertisingOwnerPage />} />
                  <Route path="hoahong" element={<OwnerCommissionPage />}/>
                </Route>
            </Route>

            {/* ================= ADMIN ================= */}

            <Route path="/admin" element={<PrivateRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />

                  <Route path="hotels" element={<AdminHotelsPage />} />

                                    <Route path="hotels/:id" element={<NotFoundPage />} />
                  <Route path="bookings" element={<AdminBookingsPage />} />
                  <Route path="payments" element={<AdminPaymentsPage />} />
                  <Route path="commissions" element={<AdminCommissionsPage />} />
                  <Route path="withdrawals" element={<AdminWithdrawalsPage />} />
                  <Route path="advertising" element={<AdminAdvertisingPage />} />
                  <Route path="banners" element={<AdminBannersPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="owner-registrations" element={<OwnerRegistrationsPage />} />
                  <Route path="reviews" element={<AdminReviewsPage />} />
                  <Route path="tags" element={<AdminTagsPage />} />
                </Route>
            </Route>

            <Route
                path="*"
                element={<NotFoundPage />}
            />

        </Routes>
    );
};
export default AppRouters;