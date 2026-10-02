import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Form } from "react-bootstrap";
import { createRoom, deleteRoom, getRoomsByRoomType, updateRoom } from "../../api/room/room.api";
import { getOwnerRoomTypes } from "../../api/loaiphong/loaiphong.api";
import { GetDanhSachKhachSanOwner } from "../../api/khachsan/khachsan.api";
import OwnerPageShell from "../../components/owner/OwnerPageShell";
import { DataTable, Field, field } from "../../components/owner/OwnerDataTable";
import { HotelSelector, RoomTypeSelector } from "../../components/owner/OwnerSelectors";

export default function RoomOwnerPage() {
  const [hotelId, setHotelId] = useState(""); const [roomTypeId, setRoomTypeId] = useState(""); const [form, setForm] = useState<Record<string, string>>({}); const [notice, setNotice] = useState("");
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const run = (request: Promise<any>) => request.then(() => setNotice("Đã cập nhật thành công.")).catch((error) => setNotice(error?.response?.data?.message || "Không thể hoàn tất thao tác."));
  const hotels = useQuery({ queryKey: ["owner-hotels"], queryFn: () => GetDanhSachKhachSanOwner({ Page: 1, PageSize: 100 }) });
  const roomTypes = useQuery({ queryKey: ["owner-room-types", hotelId], queryFn: () => getOwnerRoomTypes(hotelId), enabled: !!hotelId });
  const rooms = useQuery({ queryKey: ["owner-rooms", roomTypeId], queryFn: () => getRoomsByRoomType(roomTypeId), enabled: !!roomTypeId });
  const hotelSelect = <HotelSelector data={hotels.data} value={hotelId} onChange={setHotelId} onResetRoomType={() => setRoomTypeId("")} />;
  const typeSelect = <RoomTypeSelector data={roomTypes.data} hotelId={hotelId} value={roomTypeId} onChange={setRoomTypeId} />;
  return <OwnerPageShell title="Phòng & resource" description="Quản lý phòng, loại phòng và trạng thái khai thác." notice={notice} onDismissNotice={() => setNotice("")}><><div className="row g-2 mb-3"><div className="col-md-6">{hotelSelect}</div><div className="col-md-6">{typeSelect}</div></div><Card><Card.Body><DataTable data={rooms.data} columns={["soPhong", "tang", "trangThai"]} actions={(room) => <><Button size="sm" variant="outline-primary" onClick={() => run(updateRoom(field(room, "id"), { soPhong: field(room, "soPhong"), tang: Number(field(room, "tang") || 0), trangThai: field(room, "trangThai") }))}>Cập nhật</Button> <Button size="sm" variant="outline-danger" onClick={() => run(deleteRoom(field(room, "id")))}>Xóa</Button></>} /><div className="border-top pt-3 mt-3"><h5>Thêm phòng</h5><div className="row g-2"><Field label="Số phòng" value={form.soPhong} onChange={(value) => update("soPhong", value)} /><Field label="Tầng" type="number" value={form.tang} onChange={(value) => update("tang", value)} /><div className="col-md-3 mb-2"><Form.Label>Trạng thái</Form.Label><Form.Select value={form.trangThai || "SAN_SANG"} onChange={(event) => update("trangThai", event.target.value)}><option value="SAN_SANG">Sẵn sàng</option><option value="DA_DAT">Đã đặt</option><option value="DANG_SU_DUNG">Đang sử dụng</option><option value="BAO_TRI">Bảo trì</option><option value="TAM_NGUNG">Tạm ngưng</option></Form.Select></div></div><Button className="mt-3" disabled={!roomTypeId || !form.soPhong} onClick={() => run(createRoom({ loaiPhongId: roomTypeId, soPhong: form.soPhong, tang: Number(form.tang || 0), trangThai: form.trangThai || "SAN_SANG" }))}>Thêm phòng</Button></div></Card.Body></Card></></OwnerPageShell>;
}
