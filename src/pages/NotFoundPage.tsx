import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faHouse, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import "../styles/NotFoundPage.css";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-illustration" aria-hidden="true">
          <span className="not-found-number">404</span>
          <FontAwesomeIcon icon={faMagnifyingGlass} className="not-found-search" />
        </div>
        <p className="not-found-eyebrow">KHÔNG TÌM THẤY TRANG</p>
        <h1>Trang này chưa sẵn sàng</h1>
        <p className="not-found-description">
          Địa chỉ có thể không tồn tại, đã thay đổi hoặc chức năng này chưa được triển khai.
        </p>
        <div className="not-found-actions">
          <button type="button" className="not-found-button not-found-button--secondary" onClick={() => navigate(-1)}>
            <FontAwesomeIcon icon={faArrowLeft} />
            Quay lại
          </button>
          <Link to="/" className="not-found-button not-found-button--primary">
            <FontAwesomeIcon icon={faHouse} />
            Về trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}
