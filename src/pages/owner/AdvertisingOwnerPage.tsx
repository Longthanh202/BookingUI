import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card } from "react-bootstrap";
import { createAdvertisingOrder, getAdvertisingPackages, getOwnerAdvertising, confirmAdvertisingPayment } from "../../api/advertising/advertising.api";
import { GetDanhSachKhachSanOwner } from "../../api/khachsan/khachsan.api";
import OwnerPageShell from "../../components/owner/OwnerPageShell";
import { DataTable, field, rows } from "../../components/owner/OwnerDataTable";
import { HotelSelector } from "../../components/owner/OwnerSelectors";

export default function AdvertisingOwnerPage() {
  const [hotelId, setHotelId] = useState(""); const [notice, setNotice] = useState("");
  const run = (request: Promise<any>) => request.then(() => setNotice("Đã cập nhật thành công.")).catch((error) => setNotice(error?.response?.data?.message || "Không thể hoàn tất thao tác."));
  const hotels = useQuery({ queryKey: ["owner-hotels"], queryFn: () => GetDanhSachKhachSanOwner({ Page: 1, PageSize: 100 }) });
  const packages = useQuery({ queryKey: ["advertising-packages"], queryFn: getAdvertisingPackages });
  const campaigns = useQuery({ queryKey: ["advertising-owner"], queryFn: getOwnerAdvertising });
  return <OwnerPageShell title="Quảng cáo property" description="Chọn gói quảng cáo và theo dõi các chiến dịch đang chạy." notice={notice} onDismissNotice={() => setNotice("")}><><div className="mb-3"><HotelSelector data={hotels.data} value={hotelId} onChange={setHotelId} /></div><Card className="owner-advertising-card"><Card.Body><h5>Gói quảng cáo</h5><div className="row g-3">{rows(packages.data).map((item: any, index) => <div className="col-md-4" key={field(item, "id") || index}><Card className={`owner-ad-package owner-ad-package-${index % 3} h-100`}><Card.Body><div className="owner-ad-badge">GÓI {index + 1}</div><h5>{field(item, "tenGoi", "name")}</h5><p>{field(item, "soNgay", "days")} ngày hiển thị</p><strong>{Number(field(item, "gia", "price") === "-" ? 0 : field(item, "gia", "price")).toLocaleString("vi-VN")} đ</strong><Button className="d-block mt-3" disabled={!hotelId} onClick={() => run(createAdvertisingOrder({ khachSanId: hotelId, goiQuangCaoId: Number(field(item, "id")) }))}>Tạo đơn quảng cáo</Button></Card.Body></Card></div>)}</div></Card.Body></Card><DataTable data={campaigns.data} columns={["goiQuangCaoId", "trangThai", "ngayKetThuc"]} actionLabel="Xác nhận thanh toán" onAction={(item) => run(confirmAdvertisingPayment(field(item, "id")))} /></></OwnerPageShell>;
}
