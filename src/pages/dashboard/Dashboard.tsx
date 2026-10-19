import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet, faBullhorn, faHotel, faClipboardList, faCreditCard, faUser, faImage, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import {
    useAdminPendingAdvertising,
    useAdminPendingCommissions,
    useAdminPendingWithdrawals,
} from "../../hooks/useAdminQueries";

const getRows = (value: any): any[] => {
    const data = value?.data ?? value;
    if (Array.isArray(data)) return data;
    return data?.items ?? data?.results ?? data?.data ?? [];
};

const Dashboard = () => {
    const withdrawals = useAdminPendingWithdrawals();
    const advertising = useAdminPendingAdvertising();
    const commissions = useAdminPendingCommissions();
    const queues = [
        { title: "Yêu cầu rút tiền", note: "Kiểm tra trước khi xác nhận chi trả", path: "/admin/withdrawals", icon: faWallet, query: withdrawals },
        { title: "Chiến dịch quảng cáo", note: "Đơn đang đợi phê duyệt", path: "/admin/advertising", icon: faBullhorn, query: advertising },
        { title: "Hoa hồng chờ xử lý", note: "Theo dõi các khoản cần đối soát", path: "/admin/commissions", icon: faCreditCard, query: commissions },
    ];
    const shortcuts = [
        { label: "Tìm đặt phòng", path: "/admin/bookings", icon: faClipboardList },
        { label: "Quản lý khách sạn", path: "/admin/hotels", icon: faHotel },
        { label: "Tài khoản người dùng", path: "/admin/users", icon: faUser },
        { label: "Nội dung banner", path: "/admin/banners", icon: faImage },
    ];

    return <div>
        <div className="admin-page-intro">
            <div><span className="admin-kicker">Trung tâm vận hành</span><h2>Chào mừng trở lại</h2><p>Các hàng đợi đang chờ xử lý trên toàn hệ thống Stayro.</p></div>
        </div>
        <div className="admin-dashboard-grid">
            {queues.map(({ title, query }) => <section className="admin-metric" key={title}>
                <div className="admin-metric-label">{title}</div>
                <div className="admin-metric-value">{query.isPending ? "—" : query.isError ? "!" : getRows(query.data).length}</div>
                <div className="admin-metric-note">{query.isError ? "Không thể tải dữ liệu" : "Bản ghi đang chờ"}</div>
            </section>)}
        </div>
        <div className="admin-dashboard-lower">
            <section className="admin-panel">
                <div className="admin-panel-heading"><div><h3>Hàng đợi cần chú ý</h3><p>Số liệu được tải từ API quản trị hiện có</p></div></div>
                <div className="admin-panel-body">
                    {queues.map(({ title, note, path, icon, query }) => <Link className="admin-queue-row" to={path} key={path}>
                        <span className="admin-queue-icon"><FontAwesomeIcon icon={icon} /></span>
                        <span className="admin-queue-copy"><strong>{title}</strong><small>{note}</small></span>
                        <span className="admin-queue-count">{query.isPending ? "…" : query.isError ? "!" : getRows(query.data).length}</span>
                        <FontAwesomeIcon icon={faArrowRight} size="sm" />
                    </Link>)}
                </div>
            </section>
            <section className="admin-panel">
                <div className="admin-panel-heading"><div><h3>Truy cập nhanh</h3><p>Các khu vực quản trị thường dùng</p></div></div>
                <div className="admin-panel-body"><div className="admin-shortcut-grid">
                    {shortcuts.map((shortcut) => <Link className="admin-shortcut" to={shortcut.path} key={shortcut.path}><FontAwesomeIcon icon={shortcut.icon} /><span>{shortcut.label}</span></Link>)}
                </div></div>
            </section>
        </div>
    </div>;
};

export default Dashboard;