import React, { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import InputGroup from "react-bootstrap/InputGroup";
import { getBanners } from "../../../../api/home/home.api";
import { useProvinces } from "../../../../hooks/useProvinces";
import { HotelFilterParams } from "../../../../types/khachsan/KhachSan.types";
import DatePicker from "react-datepicker";
import "./SearchBanner.css";

const controlStyle: React.CSSProperties = {
  height: 40,
  borderRadius: 14,
  fontSize: 16,
  padding: "0 16px",
  border: "3px solid #C6E2FF",
};


const CustomDateInput = React.forwardRef<HTMLInputElement, any>(
  ({ value, onClick }, ref) => (
    <Form.Control
      ref={ref}
      value={value}
      onClick={onClick}
      readOnly
      style={controlStyle}
      placeholder="Chọn ngày nhận và trả phòng"
    />
  ),
);

type Props = {
  filter: HotelFilterParams;
  setFilter: React.Dispatch<React.SetStateAction<HotelFilterParams>>;
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

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

const SearchBanner = ({ filter, setFilter }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: provincesData = [] } = useProvinces();
  const { data: banners = [], isLoading } = useQuery<any[]>({
    queryKey: ["homeBanners"],
    queryFn: getBanners,
    staleTime: 1000 * 60 * 5,
  });

  const tomorrow = formatDate(getTomorrow());
  const defaultEndDate = getNextDay(tomorrow);

  useEffect(() => {
    setValues({
      province: filter.ProvinceCode || "",
      startDate: filter.NgayNhanPhong || tomorrow,
      endDate:
        filter.NgayTraPhong ||
        (filter.NgayNhanPhong
          ? getNextDay(filter.NgayNhanPhong)
          : defaultEndDate),
      guests: filter.SoKhach || 2,
    });
  }, [filter, tomorrow, defaultEndDate]);

  const [values, setValues] = useState({
    province: "",
    startDate: tomorrow,
    endDate: defaultEndDate,
    guests: 2,
  });
  const [provinceQuery, setProvinceQuery] = useState("");
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const provinceDropdownRef = React.useRef<HTMLDivElement | null>(null);

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(values.startDate),
    new Date(values.endDate),
  ]);

  const [startDate, endDate] = dateRange;

  useEffect(() => {
    setDateRange([new Date(values.startDate), new Date(values.endDate)]);
  }, [values.startDate, values.endDate]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        provinceDropdownRef.current &&
        !provinceDropdownRef.current.contains(event.target as Node)
      ) {
        setShowProvinceDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProvinceOptions = (provincesData as any[])
    .filter((p) => {
      const name = String(
        p?.name ?? p?.Name ?? p?.ProvinceName ?? "",
      ).toLowerCase();
      const code = String(
        p?.code ?? p?.Code ?? p?.ProvinceCode ?? "",
      ).toLowerCase();
      const query = provinceQuery.trim().toLowerCase();
      if (!query) return true;
      return name.includes(query) || code.includes(query);
    })
    .slice(0, 10);

  const selectedProvinceLabel =
    (provincesData as any[]).find(
      (p) =>
        String(p?.code ?? p?.Code ?? p?.ProvinceCode ?? p?.id) ===
        values.province,
    )?.name ??
    (provincesData as any[]).find(
      (p) =>
        String(p?.code ?? p?.Code ?? p?.ProvinceCode ?? p?.id) ===
        values.province,
    )?.ProvinceName ??
    (provincesData as any[]).find(
      (p) =>
        String(p?.code ?? p?.Code ?? p?.ProvinceCode ?? p?.id) ===
        values.province,
    )?.Name ??
    "Chọn tỉnh thành";

  const onSearch = () => {
    const newFilter: HotelFilterParams = {
      Keyword: "",
      ProvinceCode: values.province || null,
      SoKhach: values.guests || null,
      NgayNhanPhong: values.startDate || null,
      NgayTraPhong: values.endDate || null,
      Page: 1,
    };

    setFilter(newFilter);

    const params = createSearchParams({
      ProvinceCode: newFilter.ProvinceCode || "",
      SoKhach: newFilter.SoKhach?.toString() || "",
      NgayNhanPhong: newFilter.NgayNhanPhong || "",
      NgayTraPhong: newFilter.NgayTraPhong || "",
    });

    navigate({ pathname: "/search-results", search: params.toString() });
  };

  return (
    <div style={{ marginTop: 16, marginBottom: 32 }}>
      <Card
        body
        style={{
          borderRadius: 24,
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #0f172a 0%, #2563eb 60%, #7c3aed 100%)",
          color: "#fff",
        }}
      >
        <Card.Body>
          <Row className="g-4">
            <Col xs={12} lg={6}>
              <div>
                <h2 style={{ color: "#fff", marginBottom: 16 }}>
                  Tìm phòng lý tưởng cho chuyến đi của bạn
                </h2>
                <p style={{ color: "rgba(255,255,255,0.85)", maxWidth: 520 }}>
                  Chọn tỉnh thành, thời gian thuê phòng và số người ở để tìm
                  nhanh các khách sạn và homestay đang được nhiều người ưu
                  thích.
                </p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    marginTop: 24,
                  }}
                >
                  {isLoading ? (
                    <Spinner animation="border" variant="light" />
                  ) : (
                    banners.slice(0, 2).map((banner: any) => (
                      <Card
                        key={banner.id}
                        body
                        style={{
                          flex: 1,
                          minWidth: 160,
                          borderRadius: 20,
                          background: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.16)",
                          color: "#fff",
                        }}
                      >
                        <h5 style={{ color: "#fff", marginBottom: 8 }}>
                          {banner.title}
                        </h5>
                        <p style={{ color: "rgba(255,255,255,0.75)" }}>
                          {banner.subtitle}
                        </p>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </Col>

            <Col xs={12} lg={6}>
              <Card
                style={{
                  borderRadius: 20,
                  padding: 24,
                  boxShadow: "0 24px 64px rgba(15, 23, 42, 0.18)",
                }}
              >
                <Form>
                  <Form.Group
                    className="mb-3"
                    controlId="provinceSelect"
                    ref={provinceDropdownRef as any}
                  >
                    <Form.Label style={{ color: "#000" }}>
                      Tỉnh thành
                    </Form.Label>
                    <div style={{ position: "relative" }}>
                      <Button
                        variant="outline-secondary"
                        className="w-100 text-start item-form-search"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: "#fff",
                          color: "#000",
                        }}
                        onClick={() =>
                          setShowProvinceDropdown(!showProvinceDropdown)
                        }
                        type="button"
                      >
                        <span>{selectedProvinceLabel}</span>
                        <span>▼</span>
                      </Button>

                      {showProvinceDropdown && (
                        <div
                          style={{
                            position: "absolute",
                            top: 40,
                            left: 0,
                            right: 0,
                            borderRadius: 16,
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
                            style={{                            
                              border: "none",
                              borderRadius: 0,
                              boxShadow: "none",
                            }}
                            className = "item-form-search"
                          />
                          <div style={{ maxHeight: 260, overflowY: "auto" }}>
                            {filteredProvinceOptions.length === 0 ? (
                              <div style={{ padding: 16, color: "#6b7280" }}>
                                Không tìm thấy tỉnh phù hợp
                              </div>
                            ) : (
                              filteredProvinceOptions.map((p) => {
                                const value =
                                  p?.code ??
                                  p?.Code ??
                                  p?.ProvinceCode ??
                                  p?.id;
                                const label =
                                  p?.name ??
                                  p?.Name ??
                                  p?.ProvinceName ??
                                  String(value);
                                return (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => {
                                      setValues({
                                        ...values,
                                        province: String(value),
                                      });
                                      setShowProvinceDropdown(false);
                                    }}
                                    style={{
                                      width: "100%",
                                      border: "none",
                                      background: "transparent",
                                      textAlign: "left",
                                      padding: "14px 16px",
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

                  <Form.Group className="mb-3">
                    <Form.Label>Ngày nhận - Ngày trả</Form.Label>

                    <DatePicker
                      selectsRange
                      startDate={startDate}
                      endDate={endDate}
                      monthsShown={2}
                      minDate={new Date()}
                      wrapperClassName="w-100"
                      className="form-control hotel-datepicker"
                      portalId="root"
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Chọn ngày nhận và trả phòng"                    
                      onChange={(update) => {
                        setDateRange(update);

                        if (update[0] && update[1]) {
                          setValues({
                            ...values,
                            startDate: formatDate(update[0]),
                            endDate: formatDate(update[1]),
                          });
                        }
                      }}
                      customInput={<CustomDateInput />}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="guestCount">
                    <Form.Label style={{ color: "#000" }}>
                      Số lượng người ở
                    </Form.Label>
                    <InputGroup
                      style={{
                        width: 220,
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <Button
                        type="button"
                        onClick={() =>
                          setValues({
                            ...values,
                            guests: Math.max(1, values.guests - 1),
                          })
                        }
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          padding: 0,
                          backgroundColor: "#0d6efd",
                          borderColor: "#0d6efd",
                          color: "#fff",
                          fontSize: 22,
                          fontWeight: "bold",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        −
                      </Button>

                      <Form.Control
                        readOnly
                        value={`${values.guests} khách`}
                        style={{
                          ...controlStyle,
                          textAlign: "center",
                        }}
                      />

                      <Button
                        type="button"
                        onClick={() =>
                          setValues({
                            ...values,
                            guests: Math.min(10, values.guests + 1),
                          })
                        }
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          padding: 0,
                          backgroundColor: "#0d6efd",
                          borderColor: "#0d6efd",
                          color: "#fff",
                          fontSize: 22,
                          fontWeight: "bold",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        +
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-100"
                    onClick={onSearch}
                  >
                    Tìm kiếm
                  </Button>
                </Form>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
            marginTop: 24,
          }}
        >
          {isLoading ? (
            <Spinner animation="border" />
          ) : (
            banners.map((banner: any) => (
              <Card
                key={banner.id}
                className="overflow-hidden"
                style={{ borderRadius: 20 }}
              >
                <div
                  style={{
                    height: 180,
                    backgroundImage: `url(${banner.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <Card.Body>
                  <h4>{banner.title}</h4>
                  <p className="text-secondary">{banner.subtitle}</p>
                </Card.Body>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBanner;
