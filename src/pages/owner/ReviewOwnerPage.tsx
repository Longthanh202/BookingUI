import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Form, Table } from "react-bootstrap";
import { GetDanhSachKhachSanOwner } from "../../api/khachsan/khachsan.api";
import { getOwnerHotelReviews, reportOwnerReview, respondToOwnerReview } from "../../api/review/review.api";
import OwnerPageShell from "../../components/owner/OwnerPageShell";
import NumberedPagination from "../../components/common/NumberedPagination";
import { field, rows } from "../../components/owner/OwnerDataTable";
import { HotelSelector } from "../../components/owner/OwnerSelectors";

export default function ReviewOwnerPage() {
  const [hotelId, setHotelId] = useState("");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [reports, setReports] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const client = useQueryClient();
  const hotels = useQuery({
    queryKey: ["owner-hotels"],
    queryFn: () => GetDanhSachKhachSanOwner({ Page: 1, PageSize: 100 }),
  });
  const reviews = useQuery({
    queryKey: ["owner-reviews", hotelId],
    queryFn: () => getOwnerHotelReviews(hotelId),
    enabled: Boolean(hotelId),
  });
  const reviewRows = rows(reviews.data);
  const totalPages = Math.max(1, Math.ceil(reviewRows.length / pageSize));
  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);
  const run = async (request: Promise<unknown>) => {
    try {
      await request;
      setNotice("Đã gửi thao tác thành công.");
      await client.invalidateQueries({ queryKey: ["owner-reviews", hotelId] });
    } catch (error: any) {
      setNotice(error?.response?.data?.message || "Không thể hoàn tất thao tác.");
    }
  };

  return (
    <OwnerPageShell title="Đánh giá của khách" description="Phản hồi đánh giá và báo cáo nội dung vi phạm." notice={notice} onDismissNotice={() => setNotice("")}>
      <>
        <div className="mb-3">
          <HotelSelector data={hotels.data} value={hotelId} onChange={(value) => { setHotelId(value); setPage(1); }} />
        </div>
        <Card>
          <Card.Body>
          {!hotelId ? (
            <p className="text-muted mb-0">Chọn khách sạn để xem đánh giá.</p>
          ) : reviews.isLoading ? (
            <p className="text-muted mb-0">Đang tải đánh giá...</p>
          ) : reviews.isError ? (
            <p className="text-danger mb-0">Không thể tải đánh giá.</p>
          ) : (
            <Table responsive className="owner-table align-middle">
              <thead><tr><th>Đánh giá</th><th>Phản hồi Owner</th><th>Báo cáo</th></tr></thead>
              <tbody>
                {reviewRows.slice((page - 1) * pageSize, page * pageSize).map((review: any, index) => {
                  const id = String(field(review, "id", "reviewId"));
                  return (
                    <tr key={id || index}>
                      <td>
                        <strong>{field(review, "soSao", "rating")} sao</strong>
                        <div>{field(review, "noiDung", "content")}</div>
                        <small className="text-muted">{field(review, "createdAt")}</small>
                      </td>
                      <td>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          aria-label="Phản hồi đánh giá"
                          value={responses[id] ?? String(field(review, "response", "ownerResponse") === "-" ? "" : field(review, "response", "ownerResponse"))}
                          onChange={(event) => setResponses((current) => ({ ...current, [id]: event.target.value }))}
                        />
                        <Button
                          size="sm"
                          className="mt-2"
                          disabled={!responses[id]?.trim()}
                          onClick={() => run(respondToOwnerReview(id, { response: responses[id].trim() }))}
                        >Gửi phản hồi</Button>
                      </td>
                      <td>
                        <Form.Control
                          aria-label="Lý do báo cáo"
                          placeholder="Lý do báo cáo"
                          value={reports[id] || ""}
                          onChange={(event) => setReports((current) => ({ ...current, [id]: event.target.value }))}
                        />
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="mt-2"
                          disabled={!reports[id]?.trim()}
                          onClick={() => run(reportOwnerReview(id, { reason: reports[id].trim() }))}
                        >Báo cáo review</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
          {hotelId && !reviews.isLoading && !reviews.isError && (
            <NumberedPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
          </Card.Body>
        </Card>
      </>
    </OwnerPageShell>
  );
}
