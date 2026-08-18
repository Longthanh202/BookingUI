import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import DatePicker from "react-datepicker";
import { HotelFilterParams } from "../../../../types/khachsan/KhachSan.types";
import { useProvinces } from "../../../../hooks/useProvinces";
import "./SearchTopBar.css";

const quickFilters = [
  {
    label: "Khuyến mãi hot",
    filter: { Keyword: "", ProvinceCode: null, SoKhach: 2, NgayNhanPhong: null, NgayTraPhong: null, Page: 1 },
  },
  {
    label: "Gia đình",
    filter: { Keyword: "", ProvinceCode: null, SoKhach: 4, NgayNhanPhong: null, NgayTraPhong: null, Page: 1 },
  },
  {
    label: "Gần trung tâm",
    filter: { Keyword: "", ProvinceCode: "2", SoKhach: 2, NgayNhanPhong: null, NgayTraPhong: null, Page: 1 },
  },
  {
    label: "Cặp đôi",
    filter: { Keyword: "", ProvinceCode: "1", SoKhach: 2, NgayNhanPhong: null, NgayTraPhong: null, Page: 1 },
  },
];

type Props = {
  filter: HotelFilterParams;
  setFilter: React.Dispatch<React.SetStateAction<HotelFilterParams>>;
};

const formatDate = (date: Date) => date.toISOString().split("T")[0];
const getTomorrow = () => {
  const next = new Date();
  next.setDate(next.getDate() + 1);
  return next;
};
const getNextDay = (dateString: string) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1);
  return formatDate(date);
};

const CustomDateInput = React.forwardRef<HTMLInputElement, any>(
  ({ value, onClick }, ref) => (
    <Form.Control
      ref={ref}
      value={value}
      onClick={onClick}
      readOnly
      placeholder="Chọn ngày nhận và trả phòng"
      style={{ minHeight: 48, borderRadius: 12, cursor: "pointer" }}
    />
  ),
);
CustomDateInput.displayName = "CustomDateInput";

const SearchTopBar = ({ filter, setFilter }: Props) => {
  const [keyword, setKeyword] = useState(filter.Keyword || "");
  const [province, setProvince] = useState<string | null>(filter.ProvinceCode || null);
  const [provinceQuery, setProvinceQuery] = useState("");
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [guests, setGuests] = useState<number | null>(filter.SoKhach || 2);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    filter.NgayNhanPhong ? new Date(filter.NgayNhanPhong) : new Date(),
    filter.NgayTraPhong ? new Date(filter.NgayTraPhong) : getTomorrow(),
  ]);
  const [checkin, setCheckin] = useState<string>(filter.NgayNhanPhong || formatDate(new Date()));
  const [checkout, setCheckout] = useState<string>(filter.NgayTraPhong || formatDate(getTomorrow()));
  const { data: provincesData = [] } = useProvinces();
  const provinceDropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const tomorrow = formatDate(getTomorrow());

  useEffect(() => {
    setKeyword(filter.Keyword || "");
    setProvince(filter.ProvinceCode || null);
    setGuests(filter.SoKhach || 2);

    const startDate = filter.NgayNhanPhong ? new Date(filter.NgayNhanPhong) : new Date();
    const endDate = filter.NgayTraPhong ? new Date(filter.NgayTraPhong) : getTomorrow();

    setDateRange([startDate, endDate]);
    setCheckin(formatDate(startDate));
    setCheckout(formatDate(endDate));
  }, [filter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (provinceDropdownRef.current && !provinceDropdownRef.current.contains(event.target as Node)) {
        setShowProvinceDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const [start, end] = dateRange;
    if (start) {
      setCheckin(formatDate(start));
    }
    if (end) {
      setCheckout(formatDate(end));
    }

    if (start && end && end <= start) {
      const next = getNextDay(formatDate(start));
      const nextDate = new Date(next);
      setDateRange([start, nextDate]);
      setCheckout(next);
    }
  }, [dateRange]);

  const filteredProvinceOptions = (provincesData as any[])
    .filter((p) => {
      const name = String(p?.name ?? p?.Name ?? p?.ProvinceName ?? "").toLowerCase();
      const code = String(p?.code ?? p?.Code ?? p?.ProvinceCode ?? "").toLowerCase();
      const query = provinceQuery.trim().toLowerCase();
      if (!query) return true;
      return name.includes(query) || code.includes(query);
    })
    .sort((a, b) => {
      const query = provinceQuery.trim().toLowerCase();
      if (!query) return 0;
      const aName = String(a?.name ?? a?.Name ?? a?.ProvinceName ?? "").toLowerCase();
      const bName = String(b?.name ?? b?.Name ?? b?.ProvinceName ?? "").toLowerCase();
      const aIndex = aName.indexOf(query);
      const bIndex = bName.indexOf(query);
      return aIndex - bIndex;
    })
    .slice(0, 12);

  const selectedProvinceLabel =
    (provincesData as any[])
      .find((p) => String(p?.code ?? p?.Code ?? p?.ProvinceCode ?? p?.id) === province)
      ?.name ??
    (provincesData as any[])
      .find((p) => String(p?.code ?? p?.Code ?? p?.ProvinceCode ?? p?.id) === province)
      ?.ProvinceName ??
    (provincesData as any[])
      .find((p) => String(p?.code ?? p?.Code ?? p?.ProvinceCode ?? p?.id) === province)
      ?.Name ??
    "Chọn tỉnh thành";

  const onSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newFilter: HotelFilterParams = {
      Keyword: keyword,
      ProvinceCode: province || null,
      SoKhach: guests || null,
      NgayNhanPhong: checkin || formatDate(new Date()),
      NgayTraPhong: checkout || formatDate(getTomorrow()),
      Page: 1,
    };

    setFilter(newFilter);

    const params = new URLSearchParams({
      Keyword: newFilter.Keyword || "",
      ProvinceCode: newFilter.ProvinceCode || "",
      SoKhach: newFilter.SoKhach?.toString() || "",
      NgayNhanPhong: newFilter.NgayNhanPhong || "",
      NgayTraPhong: newFilter.NgayTraPhong || "",
    });

    navigate({ pathname: "/search-results", search: params.toString() });
  };

  const applyQuickFilter = (preset: typeof quickFilters[number]) => {
    setFilter(preset.filter);
    setKeyword(preset.filter.Keyword || "");
    setProvince(preset.filter.ProvinceCode || null);
    setGuests(preset.filter.SoKhach || 2);
    setCheckin("");
    setCheckout("");
    window.alert(`Đã chọn: ${preset.label}`);
  };

  return (
    <div className="search-topbar">
      <div className="search-topbar__inner">
        <Form onSubmit={onSearch} className="search-topbar__form">
            <Row className="g-2 align-items-end">
              <Col xs={12} md={8}>
                <Form.Group controlId="keyword" className="mb-0">
                  <Form.Control
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Từ khóa, khách sạn..."
                    style={{ minHeight: 48, borderRadius: 12 }}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={4} lg={2}>
                <Button type="submit" variant="primary" className="w-100" style={{ minHeight: 48, borderRadius: 12 }}>
                  Tìm ngay
                </Button>
              </Col>
            </Row>

            <Row className="g-2 align-items-end">
              <Col xs={12} sm={6} lg={3}>
                <Form.Group controlId="province" className="mb-0">
                  <Form.Label className="mb-1">Tỉnh thành</Form.Label>
                  <div ref={provinceDropdownRef} style={{ position: "relative" }}>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      className="w-100 text-start"
                      onClick={() => setShowProvinceDropdown((prev) => !prev)}
                      style={{
                        minHeight: 48,
                        borderRadius: 12,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: "#fff",
                        color: "#000",
                        padding: "0 14px",
                      }}
                    >
                      <span>{selectedProvinceLabel}</span>
                      <span style={{ fontSize: 16, opacity: 0.7 }}>&#9662;</span>
                    </Button>
                    {showProvinceDropdown && (
                      <div
                        style={{
                          position: "absolute",
                          top: 54,
                          left: 0,
                          right: 0,
                          borderRadius: 14,
                          background: "#fff",
                          boxShadow: "0 12px 32px rgba(15, 23, 42, 0.16)",
                          zIndex: 50,
                          overflow: "hidden",
                        }}
                      >
                        <Form.Control
                          type="search"
                          placeholder="Nhập tỉnh thành..."
                          value={provinceQuery}
                          onChange={(e) => setProvinceQuery(e.target.value)}
                          autoFocus
                          style={{ height: 48, borderRadius: 0, border: "none", boxShadow: "none" }}
                        />
                        <div style={{ maxHeight: 220, overflowY: "auto" }}>
                          {filteredProvinceOptions.length === 0 ? (
                            <div style={{ padding: 12, color: "#6b7280" }}>Không tìm thấy tỉnh phù hợp</div>
                          ) : (
                            filteredProvinceOptions.map((p) => {
                              const value = p?.code ?? p?.Code ?? p?.ProvinceCode ?? p?.id;
                              const label = p?.name ?? p?.Name ?? p?.ProvinceName ?? String(value);
                              return (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => {
                                    setProvince(String(value));
                                    setShowProvinceDropdown(false);
                                    setProvinceQuery("");
                                  }}
                                  style={{
                                    width: "100%",
                                    border: "none",
                                    background: "transparent",
                                    textAlign: "left",
                                    padding: "12px 14px",
                                    cursor: "pointer",
                                    color: "#111827",
                                  }}
                                >
                                  {label}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} lg={4}>
                <Form.Group controlId="dateRange" className="mb-0">
                  <Form.Label className="mb-1">Ngày nhận - Ngày trả</Form.Label>
                  <DatePicker
                    selectsRange
                    startDate={dateRange[0]}
                    endDate={dateRange[1]}
                    minDate={new Date()}
                    monthsShown={2}
                    wrapperClassName="w-100"
                    className="form-control"
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Chọn ngày nhận và trả phòng"
                    onChange={(update) => {
                      setDateRange(update as [Date | null, Date | null]);
                      if (update[0]) setCheckin(formatDate(update[0]));
                      if (update[1]) setCheckout(formatDate(update[1]));
                    }}
                    customInput={<CustomDateInput />}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <Form.Group controlId="guests" className="mb-0">
                  <Form.Label className="mb-1">Số người</Form.Label>
                  <div style={{ display: "flex", gap: 8, width: "100%" }}>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => setGuests(Math.max(1, (guests || 1) - 1))}
                      style={{ minWidth: 48, minHeight: 48, borderRadius: 12 }}
                    >
                      -
                    </Button>
                    <Form.Control
                      readOnly
                      value={`${guests || 1} khách`}
                      style={{ textAlign: "center", minHeight: 48, borderRadius: 12 }}
                    />
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => setGuests(Math.min(10, (guests || 1) + 1))}
                      style={{ minWidth: 48, minHeight: 48, borderRadius: 12 }}
                    >
                      +
                    </Button>
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 16px" }}>
        <div className="search-topbar__quick-filters">
          {quickFilters.map((item) => (
            <Button key={item.label} className="search-topbar__quick-filter" variant="outline-secondary" onClick={() => applyQuickFilter(item)}>
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchTopBar;
