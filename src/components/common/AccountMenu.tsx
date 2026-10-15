import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faChevronDown, faClockRotateLeft, faGear, faRightFromBracket, faUser } from "@fortawesome/free-solid-svg-icons";
import "../../styles/components/common/AccountMenu.css";

interface AccountMenuProps {
  name?: string;
  avatar?: string;
  mode: "customer" | "owner" | "admin";
}

const AccountMenu = ({ name, avatar, mode }: AccountMenuProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const displayName = name?.trim() || "Tài khoản";
  const initial = displayName.charAt(0).toUpperCase();
  const notificationCount = 3;
  const accountPath = mode === "customer" ? "/account/profile" : "/profile";
  const notificationPath = mode === "customer" ? "/account/notifications" : `/${mode}/notifications`;

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  const goTo = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setOpen(false);
    navigate(mode === "customer" ? "/customer-login" : "/login");
  };

  return (
    <div className="account-menu" ref={menuRef}>
      <button type="button" className="account-menu__trigger" aria-expanded={open} aria-label="Mở menu tài khoản" onClick={() => setOpen((value) => !value)}>
        <span className="account-menu__avatar-wrap">
          {avatar ? <img src={avatar} alt={displayName} className="account-menu__avatar" /> : <span className="account-menu__avatar account-menu__avatar--placeholder">{initial}</span>}
          {notificationCount > 0 && <span className="account-menu__badge">{notificationCount}</span>}
        </span>
        <span className="account-menu__chevron"><FontAwesomeIcon icon={faChevronDown} /></span>
      </button>
      {open && (
        <div className="account-menu__panel">
          <div className="account-menu__heading"><strong>{displayName}</strong><span>{mode === "customer" ? "Khách hàng" : mode === "owner" ? "Chủ khách sạn" : "Quản trị viên"}</span></div>
          <button type="button" onClick={() => goTo(accountPath)}><FontAwesomeIcon icon={faUser} /> Thông tin tài khoản</button>
          {mode === "customer" && <button type="button" onClick={() => goTo("/bookings")}><FontAwesomeIcon icon={faClockRotateLeft} /> Lịch sử đặt phòng</button>}
          <button type="button" className="account-menu__notification" onClick={() => goTo(notificationPath)}><FontAwesomeIcon icon={faBell} /> Thông báo <span>{notificationCount}</span></button>
          {mode !== "customer" && <button type="button" onClick={() => goTo(notificationPath)}><FontAwesomeIcon icon={faGear} /> Trung tâm thông báo</button>}
          <div className="account-menu__divider" />
          <button type="button" className="account-menu__logout" onClick={logout}><FontAwesomeIcon icon={faRightFromBracket} /> Đăng xuất</button>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
