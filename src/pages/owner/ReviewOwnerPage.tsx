import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "react-bootstrap";
import { GetDanhSachKhachSanOwner } from "../../api/khachsan/khachsan.api";
import { getOwnerHotelReviews } from "../../api/review/review.api";
import OwnerPageShell from "../../components/owner/OwnerPageShell";
import { DataTable } from "../../components/owner/OwnerDataTable";
import { HotelSelector } from "../../components/owner/OwnerSelectors";

export default function ReviewOwnerPage() {
  const [hotelId, setHotelId] = useState(""); const [notice, setNotice] = useState("");
  const hotels = useQuery({ queryKey: ["owner-hotels"], queryFn: () => GetDanhSachKhachSanOwner({ Page: 1, PageSize: 100 }) });
  const reviews = useQuery({ queryKey: ["owner-reviews", hotelId], queryFn: () => getOwnerHotelReviews(hotelId), enabled: !!hotelId });
  return <OwnerPageShell title="Đánh giá của khách" description="Theo dõi phản hồi và chất lượng trải nghiệm tại property." notice={notice} onDismissNotice={() => setNotice("")}><><div className="mb-3"><HotelSelector data={hotels.data} value={hotelId} onChange={setHotelId} /></div><Card><Card.Body><DataTable data={reviews.data} columns={["soSao", "noiDung", "createdAt"]} /></Card.Body></Card></></OwnerPageShell>;
}
