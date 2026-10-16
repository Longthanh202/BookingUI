import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Form } from "react-bootstrap";
import { createRoomPrice, getRoomPrices } from "../../api/room/room.api";
import { getOwnerRoomTypes } from "../../api/loaiphong/loaiphong.api";
import { GetDanhSachKhachSanOwner } from "../../api/khachsan/khachsan.api";
import {
  createOwnerPromotion,
  deleteOwnerPromotion,
  getOwnerPromotions,
  PromotionRequest,
  updateOwnerPromotion,
} from "../../api/promotion/promotion.api";
import OwnerPageShell from "../../components/owner/OwnerPageShell";
import { DataTable, Field, field } from "../../components/owner/OwnerDataTable";
import { HotelSelector, RoomTypeSelector } from "../../components/owner/OwnerSelectors";

const toDateTimeLocal = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function PricingOwnerPage() {
  const [hotelId, setHotelId] = useState("");
  const [roomTypeId, setRoomTypeId] = useState("");
  const [form, setForm] = useState<Record<string, string>>({});
  const [promotionId, setPromotionId] = useState("");
  const [promotion, setPromotion] = useState<Record<string, string>>({ discountType: "PERCENT" });
  const [notice, setNotice] = useState("");
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const updatePromotion = (key: string, value: string) => setPromotion((current) => ({ ...current, [key]: value }));
  const run = (request: Promise<any>) => request
    .then(() => setNotice("Đã cập nhật thành công."))
    .catch((error) => setNotice(error?.response?.data?.message || "Không thể hoàn tất thao tác."));

  const hotels = useQuery({
    queryKey: ["owner-hotels"],
    queryFn: () => GetDanhSachKhachSanOwner({ Page: 1, PageSize: 100 }),
  });
  const roomTypes = useQuery({
    queryKey: ["owner-room-types", hotelId],
    queryFn: () => getOwnerRoomTypes(hotelId),
    enabled: Boolean(hotelId),
  });
  const prices = useQuery({
    queryKey: ["room-prices", roomTypeId],
    queryFn: () => getRoomPrices(roomTypeId),
    enabled: Boolean(roomTypeId),
  });
  const promotions = useQuery({
    queryKey: ["owner-promotions", hotelId],
    queryFn: () => getOwnerPromotions(hotelId),
    enabled: Boolean(hotelId),
  });

  const promotionPayload: PromotionRequest = {
    code: promotion.code || "",
    name: promotion.name || "",
    discountType: (promotion.discountType as "PERCENT" | "FIXED") || "PERCENT",
    discountValue: Number(promotion.discountValue),
    minBookingAmount: Number(promotion.minBookingAmount || 0),
    maxDiscountAmount: promotion.maxDiscountAmount ? Number(promotion.maxDiscountAmount) : null,
    startsAt: promotion.startsAt ? new Date(promotion.startsAt).toISOString() : "",
    endsAt: promotion.endsAt ? new Date(promotion.endsAt).toISOString() : "",
  };

  const savePromotion = async () => {
    if (!promotionPayload.code || !promotionPayload.name || !promotionPayload.startsAt || !promotionPayload.endsAt) {
      setNotice("Nhập mã, tên và thời gian áp dụng khuyến mãi.");
      return;
    }
    try {
      if (promotionId) await updateOwnerPromotion(promotionId, promotionPayload);
      else await createOwnerPromotion(hotelId, promotionPayload);
      setNotice("Đã lưu khuyến mãi.");
      setPromotionId("");
      setPromotion({ discountType: "PERCENT" });
      await promotions.refetch();
    } catch (error: any) {
      setNotice(error?.response?.data?.message || "Không thể lưu khuyến mãi.");
    }
  };

  const editPromotion = (item: any) => {
    setPromotionId(String(field(item, "id")));
    setPromotion({
      code: String(field(item, "code") === "-" ? "" : field(item, "code")),
      name: String(field(item, "name") === "-" ? "" : field(item, "name")),
      discountType: String(field(item, "discountType") === "-" ? "PERCENT" : field(item, "discountType")),
      discountValue: String(field(item, "discountValue") === "-" ? "" : field(item, "discountValue")),
      minBookingAmount: String(field(item, "minBookingAmount") === "-" ? "" : field(item, "minBookingAmount")),
      maxDiscountAmount: String(field(item, "maxDiscountAmount") === "-" ? "" : field(item, "maxDiscountAmount")),
      startsAt: toDateTimeLocal(String(field(item, "startsAt") === "-" ? "" : field(item, "startsAt"))),
      endsAt: toDateTimeLocal(String(field(item, "endsAt") === "-" ? "" : field(item, "endsAt"))),
    });
  };

  return (
    <OwnerPageShell
      title="Giá & khuyến mãi"
      description="Thiết lập giá theo khách sạn, loại phòng và thời gian áp dụng."
      notice={notice}
      onDismissNotice={() => setNotice("")}
    >
      <>
        <div className="row g-2 mb-3">
          <div className="col-md-6">
            <HotelSelector
              data={hotels.data}
              value={hotelId}
              onChange={(value) => {
                setHotelId(value);
                setRoomTypeId("");
                setPromotionId("");
                setPromotion({ discountType: "PERCENT" });
              }}
              onResetRoomType={() => setRoomTypeId("")}
            />
          </div>
          <div className="col-md-6">
            <RoomTypeSelector data={roomTypes.data} hotelId={hotelId} value={roomTypeId} onChange={setRoomTypeId} />
          </div>
        </div>

        <Card className="mb-4">
          <Card.Body>
            <h5>Lịch sử giá</h5>
            <DataTable data={prices.data} columns={["gia", "ngayBatDau", "ngayKetThuc"]} money={["gia"]} />
            <div className="border-top pt-3 mt-3">
              <h5>Thêm giá cho loại phòng</h5>
              <div className="row g-2">
                <Field label="Giá" type="number" value={form.gia} onChange={(value) => update("gia", value)} />
                <Field label="Ngày bắt đầu" type="datetime-local" value={form.ngayBatDau} onChange={(value) => update("ngayBatDau", value)} />
                <Field label="Ngày kết thúc (không bắt buộc)" type="datetime-local" value={form.ngayKetThuc} onChange={(value) => update("ngayKetThuc", value)} />
              </div>
              <Button
                className="mt-3"
                disabled={!roomTypeId || !form.gia || !form.ngayBatDau}
                onClick={() => run(createRoomPrice({
                  loaiPhongId: roomTypeId,
                  gia: Number(form.gia),
                  ngayBatDau: form.ngayBatDau,
                  ngayKetThuc: form.ngayKetThuc || null,
                }))}
              >
                Thêm lịch giá
              </Button>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="mb-1">Khuyến mãi</h5>
                <small className="text-muted">Tạo, chỉnh sửa hoặc tắt khuyến mãi của khách sạn.</small>
              </div>
            </div>
            {hotelId ? (
              <>
                <div className="row g-2 mb-3">
                  <div className="col-md-2"><Form.Control aria-label="Mã khuyến mãi" placeholder="Mã" value={promotion.code || ""} onChange={(event) => updatePromotion("code", event.target.value)} /></div>
                  <div className="col-md-3"><Form.Control aria-label="Tên khuyến mãi" placeholder="Tên khuyến mãi" value={promotion.name || ""} onChange={(event) => updatePromotion("name", event.target.value)} /></div>
                  <div className="col-md-2"><Form.Select aria-label="Loại giảm" value={promotion.discountType || "PERCENT"} onChange={(event) => updatePromotion("discountType", event.target.value)}><option value="PERCENT">Phần trăm</option><option value="FIXED">Số tiền cố định</option></Form.Select></div>
                  <div className="col-md-2"><Form.Control aria-label="Giá trị giảm" type="number" placeholder="Giá trị giảm" value={promotion.discountValue || ""} onChange={(event) => updatePromotion("discountValue", event.target.value)} /></div>
                  <div className="col-md-3"><Form.Control aria-label="Đơn tối thiểu" type="number" placeholder="Đơn tối thiểu" value={promotion.minBookingAmount || ""} onChange={(event) => updatePromotion("minBookingAmount", event.target.value)} /></div>
                  <div className="col-md-3"><Form.Control aria-label="Giảm tối đa" type="number" placeholder="Giảm tối đa (tuỳ chọn)" value={promotion.maxDiscountAmount || ""} onChange={(event) => updatePromotion("maxDiscountAmount", event.target.value)} /></div>
                  <div className="col-md-3"><Form.Control aria-label="Bắt đầu" type="datetime-local" value={promotion.startsAt || ""} onChange={(event) => updatePromotion("startsAt", event.target.value)} /></div>
                  <div className="col-md-3"><Form.Control aria-label="Kết thúc" type="datetime-local" value={promotion.endsAt || ""} onChange={(event) => updatePromotion("endsAt", event.target.value)} /></div>
                  <div className="col-md-3 d-flex gap-2">
                    <Button onClick={savePromotion}>{promotionId ? "Cập nhật" : "Tạo khuyến mãi"}</Button>
                    {promotionId && <Button variant="outline-secondary" onClick={() => { setPromotionId(""); setPromotion({ discountType: "PERCENT" }); }}>Hủy sửa</Button>}
                  </div>
                </div>
                {promotions.isLoading ? <p>Đang tải khuyến mãi...</p> : promotions.isError ? (
                  <p className="text-danger">Không thể tải khuyến mãi.</p>
                ) : (
                  <DataTable
                    data={promotions.data}
                    columns={["code", "name", "discountType", "discountValue", "startsAt", "endsAt"]}
                    actions={(item) => (
                      <>
                        <Button size="sm" variant="outline-primary" onClick={() => editPromotion(item)}>Sửa</Button>
                        <Button size="sm" variant="outline-danger" className="ms-2" onClick={() => run(deleteOwnerPromotion(String(field(item, "id"))).then(() => promotions.refetch()))}>Tắt</Button>
                      </>
                    )}
                  />
                )}
              </>
            ) : (
              <p className="text-muted mb-0">Chọn khách sạn để quản lý khuyến mãi.</p>
            )}
          </Card.Body>
        </Card>
      </>
    </OwnerPageShell>
  );
}
