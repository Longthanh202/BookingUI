import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card } from "react-bootstrap";
import { createRoomPrice, getRoomPrices } from "../../api/room/room.api";
import { getOwnerRoomTypes } from "../../api/loaiphong/loaiphong.api";
import { GetDanhSachKhachSanOwner } from "../../api/khachsan/khachsan.api";
import OwnerPageShell from "../../components/owner/OwnerPageShell";
import { DataTable, Field } from "../../components/owner/OwnerDataTable";
import { HotelSelector, RoomTypeSelector } from "../../components/owner/OwnerSelectors";

export default function PricingOwnerPage() {
  const [hotelId, setHotelId] = useState(""); const [roomTypeId, setRoomTypeId] = useState(""); const [form, setForm] = useState<Record<string, string>>({}); const [notice, setNotice] = useState("");
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const run = (request: Promise<any>) => request.then(() => setNotice("Đã cập nhật thành công.")).catch((error) => setNotice(error?.response?.data?.message || "Không thể hoàn tất thao tác."));
  const hotels = useQuery({ queryKey: ["owner-hotels"], queryFn: () => GetDanhSachKhachSanOwner({ Page: 1, PageSize: 100 }) });
  const roomTypes = useQuery({ queryKey: ["owner-room-types", hotelId], queryFn: () => getOwnerRoomTypes(hotelId), enabled: !!hotelId });
  const prices = useQuery({ queryKey: ["room-prices", roomTypeId], queryFn: () => getRoomPrices(roomTypeId), enabled: !!roomTypeId });
  return <OwnerPageShell title="Giá & khuyến mãi" description="Thiết lập giá theo khách sạn, loại phòng và thời gian áp dụng." notice={notice} onDismissNotice={() => setNotice("")}><><div className="row g-2 mb-3"><div className="col-md-6"><HotelSelector data={hotels.data} value={hotelId} onChange={setHotelId} onResetRoomType={() => setRoomTypeId("")} /></div><div className="col-md-6"><RoomTypeSelector data={roomTypes.data} hotelId={hotelId} value={roomTypeId} onChange={setRoomTypeId} /></div></div><Card><Card.Body><h5>Lịch sử giá</h5><DataTable data={prices.data} columns={["gia", "ngayBatDau", "ngayKetThuc"]} money={["gia"]} /><div className="border-top pt-3 mt-3"><h5>Thêm giá cho loại phòng</h5><div className="row g-2"><Field label="Giá" type="number" value={form.gia} onChange={(value) => update("gia", value)} /><Field label="Ngày bắt đầu" type="datetime-local" value={form.ngayBatDau} onChange={(value) => update("ngayBatDau", value)} /><Field label="Ngày kết thúc" type="datetime-local" value={form.ngayKetThuc} onChange={(value) => update("ngayKetThuc", value)} /></div><Button className="mt-3" disabled={!roomTypeId || !form.gia} onClick={() => run(createRoomPrice({ loaiPhongId: roomTypeId, gia: Number(form.gia), ngayBatDau: form.ngayBatDau, ngayKetThuc: form.ngayKetThuc }))}>Thêm lịch giá</Button></div></Card.Body></Card></></OwnerPageShell>;
}
