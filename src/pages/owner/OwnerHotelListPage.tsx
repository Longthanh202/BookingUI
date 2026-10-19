import React, { useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  useAppMutation,
  useAppQueryClient,
} from "../../hooks/useAppReactQuery";

import { ThemKhachSan } from "../../api/khachsan/khachsan.api";
import { useOwnerHotelPage, useOwnerHotelTags } from "../../hooks/useOwnerQueries";

import { KhachSanListOwnerParams } from "../../types/khachsan/KhachSan.types";
import { KhachSan as KhachSanType } from "../../types/khachsan/KhachSan";

import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";

import ConfirmationModal from "../../components/common/ConfirmationModal";
import ActionButton from "../../components/common/ActionButton";
import { showToast } from "../../components/common/Toast";
import OwnerRefreshButton from "../../components/owner/OwnerRefreshButton";
import NumberedPagination from "../../components/common/NumberedPagination";
import "../../styles/owner/OwnerWorkspacePage.css";

const initialFormValues = {
  TenKhachSan: "",
  DiaChi: "",
  ThanhPho: "",
  SoSao: "",
  GioNhanPhong: "",
  GioTraPhong: "",
  MoTa: "",
  ChinhSachHuy: "",
  ViDo: "",
  KinhDo: "",
};

const OwnerHotelListPage = () => {
  const [page, setPage] = useState(1);

  const [open, setOpen] = useState(false);

  const [uploadedImages, setUploadedImages] =
    useState<File[]>([]);

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const [formValues, setFormValues] =
    useState(initialFormValues);

  const [formErrors, setFormErrors] =
    useState<Record<string, string>>({});

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const queryClient = useAppQueryClient();
  const today = useMemo(() => new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "numeric", month: "long" }).format(new Date()), []);
  const { data: tags = [], isLoading: isTagsLoading, isError: isTagsError } = useOwnerHotelTags();

  const dto: KhachSanListOwnerParams = {
    Page: page,
    PageSize: 10,
  };

  // =====================================================
  // CREATE
  // =====================================================

  const createMutation = useAppMutation<
    any,
    unknown,
    FormData,
    unknown
  >({
    mutationFn: ThemKhachSan,

    onSuccess: () => {
      showToast("Thêm khách sạn thành công");

      queryClient.invalidateQueries({
        queryKey: ["KhachSanOwner"],
      });
      queryClient.invalidateQueries({ queryKey: ["owner-hotels"] });

      handleClose();
    },

    onError: () => {
      showToast("Thêm khách sạn thất bại");
    },
  });

  const isProcessing = createMutation.status === "pending";

  // =====================================================
  // OPEN MODAL
  // =====================================================

  const handleOpen = () => {
    setFormValues(initialFormValues);

    setFormErrors({});

    setUploadedImages([]);

    setSelectedTagIds([]);

    setOpen(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const handleClose = () => {
    setOpen(false);

    setFormValues(initialFormValues);

    setFormErrors({});

    setUploadedImages([]);

    setSelectedTagIds([]);

  };

  // =====================================================
  // IMAGE
  // =====================================================

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;

    if (!files) return;

    const newFiles = Array.from(files);

    setUploadedImages((current) => [
      ...current,
      ...newFiles,
    ]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const getImagePreviewUrl = (
    file: File
  ): string => {
    return URL.createObjectURL(file);
  };

  // =====================================================
  // VALIDATE
  // =====================================================

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formValues.TenKhachSan)
      errors.TenKhachSan =
        "Nhập tên khách sạn";

    if (!formValues.DiaChi)
      errors.DiaChi = "Nhập địa chỉ";

    if (!formValues.ThanhPho)
      errors.ThanhPho =
        "Chọn thành phố";

    if (!formValues.SoSao)
      errors.SoSao = "Chọn số sao";

    if (!formValues.ViDo.trim() || !Number.isFinite(Number(formValues.ViDo)) || Number(formValues.ViDo) < -90 || Number(formValues.ViDo) > 90)
      errors.ViDo = "Vĩ độ phải nằm trong khoảng -90 đến 90";

    if (!formValues.KinhDo.trim() || !Number.isFinite(Number(formValues.KinhDo)) || Number(formValues.KinhDo) < -180 || Number(formValues.KinhDo) > 180)
      errors.KinhDo = "Kinh độ phải nằm trong khoảng -180 đến 180";

    if (!formValues.GioNhanPhong)
      errors.GioNhanPhong =
        "Chọn giờ nhận phòng";

    if (!formValues.GioTraPhong)
      errors.GioTraPhong =
        "Chọn giờ trả phòng";

    if (!formValues.MoTa)
      errors.MoTa = "Nhập mô tả";

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast(
        "Vui lòng điền đầy đủ thông tin form."
      );

      return;
    }

    const formData = new FormData();

    formData.append(
      "TenKhachSan",
      formValues.TenKhachSan
    );

    formData.append(
      "DiaChi",
      formValues.DiaChi
    );

    formData.append(
      "ThanhPho",
      formValues.ThanhPho
    );

    formData.append(
      "SoSao",
      formValues.SoSao
    );

    formData.append(
      "GioNhanPhong",
      formValues.GioNhanPhong
    );

    formData.append(
      "GioTraPhong",
      formValues.GioTraPhong
    );

    formData.append(
      "MoTa",
      formValues.MoTa
    );

    formData.append("ChinhSachHuy", formValues.ChinhSachHuy);
    formData.append("ViDo", formValues.ViDo);
    formData.append("KinhDo", formValues.KinhDo);

    selectedTagIds.forEach((tagId) => formData.append("TagIds", tagId));

    uploadedImages.forEach((image) => {
      formData.append("Files", image);
    });

    createMutation.mutate(formData);
  };

  // =====================================================
  // EDIT
  // =====================================================

  // =====================================================
  // QUERY
  // =====================================================

  const {
    isLoading,
    data,
  } = useOwnerHotelPage(dto);

  const hotels =
    data?.data || [];
  const totalPages = Math.max(1, Number(data?.totalPage ?? data?.data?.totalPage ?? (data?.totalRow || data?.totalCount
    ? Math.ceil(Number(data.totalRow ?? data.totalCount) / 10)
    : hotels.length >= 10 ? page + 1 : page)));

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      style={{
        background: "#f8fafc",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        {/* ================================================= */}
        {/* PAGE HEADER */}
        {/* ================================================= */}

        <div className="owner-page-heading">
          <div>
            <h1>Khách sạn của tôi</h1>
            <p>Quản lý thông tin và danh sách khách sạn của bạn.</p>
          </div>
          <div className="owner-date">
            <FontAwesomeIcon icon={faCalendarDays} /> {today}
            <OwnerRefreshButton />
          </div>
        </div>

        <div className="d-flex justify-content-end mb-4">
          <ActionButton title="Thêm khách sạn" onOk={handleOpen} />
        </div>

        {/* ================================================= */}
        {/* STATISTIC */}
        {/* ================================================= */}

        <Row className="g-3 mb-4">
          <Col md={4}>
            <Card
              className="border-0 shadow-sm h-100"
              style={{
                borderRadius: 16,
              }}
            >
              <Card.Body>
                <div
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: 14,
                        marginBottom: 8,
                      }}
                    >
                      Tổng khách sạn
                    </div>

                    <h3
                      className="mb-0"
                      style={{
                        fontWeight: 800,
                      }}
                    >
                      {hotels.length}
                    </h3>
                  </div>

                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background:
                        "#eef2ff",
                      color: "#4f46e5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                    }}
                  >
                    🏨
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card
              className="border-0 shadow-sm h-100"
              style={{
                borderRadius: 16,
              }}
            >
              <Card.Body>
                <div
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: 14,
                        marginBottom: 8,
                      }}
                    >
                      Trang hiện tại
                    </div>

                    <h3
                      className="mb-0"
                      style={{
                        fontWeight: 800,
                      }}
                    >
                      {page}
                    </h3>
                  </div>

                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background:
                        "#f0fdf4",
                      color: "#16a34a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                    }}
                  >
                    📄
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card
              className="border-0 shadow-sm h-100"
              style={{
                borderRadius: 16,
              }}
            >
              <Card.Body>
                <div
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: 14,
                        marginBottom: 8,
                      }}
                    >
                      Trạng thái
                    </div>

                    <h5
                      className="mb-0"
                      style={{
                        fontWeight: 700,
                      }}
                    >
                      Đang quản lý
                    </h5>
                  </div>

                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background:
                        "#fff7ed",
                      color: "#ea580c",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                    }}
                  >
                    📊
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ================================================= */}
        {/* TABLE */}
        {/* ================================================= */}

        <Card
          className="border-0 shadow-sm"
          style={{
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          <Card.Body className="p-0">
            <div
              style={{
                padding: "20px 24px",
                borderBottom:
                  "1px solid #e5e7eb",
              }}
              className="d-flex justify-content-between align-items-center flex-wrap gap-2"
            >
              <div>
                <h5
                  className="mb-1"
                  style={{
                    fontWeight: 750,
                  }}
                >
                  Danh sách khách sạn
                </h5>

                <span
                  style={{
                    color: "#64748b",
                    fontSize: 14,
                  }}
                >
                  Click vào tên khách sạn
                  để xem chi tiết
                </span>
              </div>

              <Badge
                bg="light"
                text="dark"
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  fontWeight: 600,
                }}
              >
                Trang {page}
              </Badge>
            </div>

            {isLoading ? (
              <div
                className="text-center py-5"
              >
                <Spinner
                  animation="border"
                  variant="primary"
                />

                <div
                  className="mt-3"
                  style={{
                    color: "#64748b",
                  }}
                >
                  Đang tải danh sách
                  khách sạn...
                </div>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <Table
                    hover
                    className="mb-0 align-middle"
                  >
                    <thead
                      style={{
                        background:
                          "#f8fafc",
                      }}
                    >
                      <tr>
                        <th
                          style={{
                            padding:
                              "15px 24px",
                            color:
                              "#475569",
                            fontSize: 13,
                            fontWeight: 700,
                            border: "none",
                          }}
                        >
                          KHÁCH SẠN
                        </th>

                        <th
                          style={{
                            color:
                              "#475569",
                            fontSize: 13,
                            fontWeight: 700,
                            border: "none",
                          }}
                        >
                          THÀNH PHỐ
                        </th>

                        <th
                          style={{
                            color:
                              "#475569",
                            fontSize: 13,
                            fontWeight: 700,
                            border: "none",
                          }}
                        >
                          ĐỊA CHỈ
                        </th>

                        <th
                          style={{
                            color:
                              "#475569",
                            fontSize: 13,
                            fontWeight: 700,
                            border: "none",
                          }}
                        >
                          ĐÁNH GIÁ
                        </th>

                        <th
                          style={{
                            color:
                              "#475569",
                            fontSize: 13,
                            fontWeight: 700,
                            border: "none",
                          }}
                        >
                          NGƯỜI TẠO
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {hotels.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center"
                            style={{
                              padding:
                                "60px 20px",
                              border: "none",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 40,
                                marginBottom: 12,
                              }}
                            >
                              🏨
                            </div>

                            <h6
                              style={{
                                fontWeight: 700,
                              }}
                            >
                              Chưa có khách
                              sạn
                            </h6>

                            <p
                              className="text-secondary mb-3"
                            >
                              Hãy thêm khách
                              sạn đầu tiên
                              của bạn.
                            </p>

                            <ActionButton
                              title="Thêm khách sạn"
                              onOk={
                                handleOpen
                              }
                            />
                          </td>
                        </tr>
                      ) : (
                        hotels.map(
                          (
                            item: KhachSanType
                          ) => (
                            <tr
                              key={item.id}
                              style={{
                                cursor:
                                  "default",
                              }}
                            >
                              {/* HOTEL */}

                              <td
                                style={{
                                  padding:
                                    "18px 24px",
                                }}
                              >
                                <Link
                                  to={`${item.id}`}
                                  style={{
                                    textDecoration:
                                      "none",
                                    color:
                                      "#111827",
                                  }}
                                >
                                  <div
                                    className="d-flex align-items-center gap-3"
                                  >
                                    <div
                                      style={{
                                        width: 46,
                                        height: 46,
                                        borderRadius: 12,
                                        background:
                                          "#eef2ff",
                                        display:
                                          "flex",
                                        alignItems:
                                          "center",
                                        justifyContent:
                                          "center",
                                        fontSize: 20,
                                        flexShrink: 0,
                                      }}
                                    >
                                      🏨
                                    </div>

                                    <div>
                                      <div
                                        style={{
                                          fontWeight:
                                            700,
                                          fontSize:
                                            15,
                                          marginBottom:
                                            4,
                                          color:
                                            "#111827",
                                        }}
                                      >
                                        {
                                          item.tenKhachSan
                                        }
                                      </div>

                                      <div
                                        style={{
                                          fontSize:
                                            12,
                                          color:
                                            "#94a3b8",
                                        }}
                                      >
                                        Xem chi
                                        tiết →
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              </td>

                              {/* CITY */}

                              <td>
                                <span
                                  style={{
                                    color:
                                      "#475569",
                                    fontWeight:
                                      500,
                                  }}
                                >
                                  {
                                    item.thanhPho
                                  }
                                </span>
                              </td>

                              {/* ADDRESS */}

                              <td>
                                <div
                                  style={{
                                    maxWidth: 300,
                                    color:
                                      "#64748b",
                                    fontSize:
                                      14,
                                  }}
                                >
                                  {
                                    item.diaChi
                                  }
                                </div>
                              </td>

                              {/* STAR */}

                              <td>
                                <div
                                  className="d-flex align-items-center gap-2"
                                >
                                  <span
                                    style={{
                                      color:
                                        "#f59e0b",
                                      fontSize:
                                        15,
                                    }}
                                  >
                                    {"★".repeat(
                                      Number(
                                        item.soSao
                                      ) || 0
                                    )}
                                  </span>

                                  <span
                                    style={{
                                      color:
                                        "#64748b",
                                      fontSize:
                                        13,
                                    }}
                                  >
                                    {
                                      item.soSao
                                    }
                                    /5
                                  </span>
                                </div>
                              </td>

                              {/* OWNER */}

                              <td>
                                <div
                                  style={{
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    gap: 8,
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 32,
                                      height: 32,
                                      borderRadius:
                                        "50%",
                                      background:
                                        "#f1f5f9",
                                      display:
                                        "flex",
                                      alignItems:
                                        "center",
                                      justifyContent:
                                        "center",
                                      fontSize:
                                        14,
                                    }}
                                  >
                                    👤
                                  </div>

                                  <span
                                    style={{
                                      fontSize:
                                        14,
                                      color:
                                        "#475569",
                                    }}
                                  >
                                    {
                                      item.fullName
                                    }
                                  </span>
                                </div>
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </Table>
                </div>

                {/* PAGINATION */}

                <NumberedPagination page={page} totalPages={totalPages} disabled={isLoading} onPageChange={setPage} />
              </>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* ================================================= */}
      {/* MODAL */}
      {/* ================================================= */}

      <ConfirmationModal
        open={open}
        title="Thêm khách sạn"
        onOk={handleSubmit}
        onCancel={handleClose}
        confirmLoading={isProcessing}
        width={1200}
        className="owner-layout-modal owner-create-hotel-modal"
      >
        <Form className="owner-create-hotel-form">
          {/* ================================================= */}
          {/* BASIC INFORMATION */}
          {/* ================================================= */}

          <div
            style={{
              marginBottom: 20,
            }}
          >
            <h6
              style={{
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              Thông tin cơ bản
            </h6>

            <div
              style={{
                fontSize: 13,
                color: "#64748b",
              }}
            >
              Thông tin chung của khách sạn
            </div>
          </div>

          <Form.Group
            className="mb-3"
            controlId="hotelName"
          >
            <Form.Label>
              Tên khách sạn
            </Form.Label>

            <Form.Control
              type="text"
              placeholder="Nhập tên khách sạn"
              value={
                formValues.TenKhachSan
              }
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  TenKhachSan:
                    e.target.value,
                })
              }
              isInvalid={Boolean(
                formErrors.TenKhachSan
              )}
              disabled={isProcessing}
            />

            <Form.Control.Feedback type="invalid">
              {
                formErrors.TenKhachSan
              }
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group
            className="mb-3"
            controlId="hotelAddress"
          >
            <Form.Label>
              Địa chỉ khách sạn
            </Form.Label>

            <Form.Control
              type="text"
              placeholder="Nhập địa chỉ"
              value={
                formValues.DiaChi
              }
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  DiaChi:
                    e.target.value,
                })
              }
              isInvalid={Boolean(
                formErrors.DiaChi
              )}
              disabled={isProcessing}
            />

            <Form.Control.Feedback type="invalid">
              {formErrors.DiaChi}
            </Form.Control.Feedback>
          </Form.Group>

          <Row className="g-3">
            <Col md={6}>
              <Form.Group
                className="mb-3"
                controlId="hotelCity"
              >
                <Form.Label>
                  Thành phố
                </Form.Label>

                <Form.Select
                  value={
                    formValues.ThanhPho
                  }
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      ThanhPho:
                        e.target.value,
                    })
                  }
                  isInvalid={Boolean(
                    formErrors.ThanhPho
                  )}
                  disabled={isProcessing}
                >
                  <option value="">
                    Chọn thành phố
                  </option>

                  <option value="Hồ Chí Minh">
                    Hồ Chí Minh
                  </option>

                  <option value="Hà Nội">
                    Hà Nội
                  </option>

                  <option value="Đà Nẵng">
                    Đà Nẵng
                  </option>

                  <option value="Cần Thơ">
                    Cần Thơ
                  </option>

                  <option value="Quảng Ninh">
                    Quảng Ninh
                  </option>
                </Form.Select>

                <Form.Control.Feedback type="invalid">
                  {
                    formErrors.ThanhPho
                  }
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group
                className="mb-3"
                controlId="hotelStars"
              >
                <Form.Label>
                  Số sao
                </Form.Label>

                <Form.Select
                  value={
                    formValues.SoSao
                  }
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      SoSao:
                        e.target.value,
                    })
                  }
                  isInvalid={Boolean(
                    formErrors.SoSao
                  )}
                  disabled={isProcessing}
                >
                  <option value="">
                    Chọn số sao
                  </option>

                  {[1, 2, 3, 4, 5].map(
                    (value) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {value} sao
                      </option>
                    )
                  )}
                </Form.Select>

                <Form.Control.Feedback type="invalid">
                  {formErrors.SoSao}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="hotelTags">
            <Form.Label>Thẻ khám phá</Form.Label>
            <Form.Select
              multiple
              value={selectedTagIds}
              onChange={(event) =>
                setSelectedTagIds(
                  Array.from(event.target.selectedOptions, (option) => option.value)
                )
              }
              disabled={isProcessing || isTagsLoading || isTagsError}
              aria-describedby="hotelTagsHelp"
            >
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </Form.Select>
            <Form.Text id="hotelTagsHelp" muted>
              {isTagsLoading
                ? "Đang tải danh sách tag..."
                : isTagsError
                  ? "Không tải được danh sách tag. Vui lòng tải lại trang để thử lại."
                  : "Có thể chọn nhiều tag; giữ Ctrl (Windows) hoặc Command (Mac) khi chọn."}
            </Form.Text>
          </Form.Group>

          <Row className="g-3">
            <Col md={6}>
              <Form.Group className="mb-3" controlId="hotelLatitude">
                <Form.Label>Vĩ độ</Form.Label>
                <Form.Control
                  type="number"
                  step="any"
                  value={formValues.ViDo}
                  onChange={(e) => setFormValues({ ...formValues, ViDo: e.target.value })}
                  isInvalid={Boolean(formErrors.ViDo)}
                  disabled={isProcessing}
                />
                <Form.Control.Feedback type="invalid">{formErrors.ViDo}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="hotelLongitude">
                <Form.Label>Kinh độ</Form.Label>
                <Form.Control
                  type="number"
                  step="any"
                  value={formValues.KinhDo}
                  onChange={(e) => setFormValues({ ...formValues, KinhDo: e.target.value })}
                  isInvalid={Boolean(formErrors.KinhDo)}
                  disabled={isProcessing}
                />
                <Form.Control.Feedback type="invalid">{formErrors.KinhDo}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="hotelCancellationPolicy">
            <Form.Label>Chính sách hủy</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formValues.ChinhSachHuy}
              onChange={(e) => setFormValues({ ...formValues, ChinhSachHuy: e.target.value })}
              disabled={isProcessing}
            />
          </Form.Group>

          <Row className="g-3">
            <Col md={6}>
              <Form.Group
                className="mb-3"
                controlId="checkInTime"
              >
                <Form.Label>
                  Giờ nhận phòng
                </Form.Label>

                <Form.Control
                  type="time"
                  value={
                    formValues.GioNhanPhong
                  }
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      GioNhanPhong:
                        e.target.value,
                    })
                  }
                  isInvalid={Boolean(
                    formErrors.GioNhanPhong
                  )}
                  disabled={isProcessing}
                />

                <Form.Control.Feedback type="invalid">
                  {
                    formErrors.GioNhanPhong
                  }
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group
                className="mb-3"
                controlId="checkOutTime"
              >
                <Form.Label>
                  Giờ trả phòng
                </Form.Label>

                <Form.Control
                  type="time"
                  value={
                    formValues.GioTraPhong
                  }
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      GioTraPhong:
                        e.target.value,
                    })
                  }
                  isInvalid={Boolean(
                    formErrors.GioTraPhong
                  )}
                  disabled={isProcessing}
                />

                <Form.Control.Feedback type="invalid">
                  {
                    formErrors.GioTraPhong
                  }
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group
            className="mb-4"
            controlId="hotelDescription"
          >
            <Form.Label>
              Mô tả khách sạn
            </Form.Label>

            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Nhập mô tả khách sạn..."
              value={
                formValues.MoTa
              }
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  MoTa:
                    e.target.value,
                })
              }
              isInvalid={Boolean(
                formErrors.MoTa
              )}
              disabled={isProcessing}
            />

            <Form.Control.Feedback type="invalid">
              {formErrors.MoTa}
            </Form.Control.Feedback>
          </Form.Group>

          {/* ================================================= */}
          {/* IMAGES */}
          {/* ================================================= */}

          <Card
            className="border-0 mb-3"
            style={{
              background:
                "#f8fafc",
              borderRadius: 14,
            }}
          >
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h6
                    className="mb-1"
                    style={{
                      fontWeight: 700,
                    }}
                  >
                    Hình ảnh khách sạn
                  </h6>

                  <small className="text-secondary">
                    Tối đa 4 hình ảnh
                  </small>
                </div>

                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={
                    uploadedImages.length >=
                      4 ||
                    isProcessing
                  }
                >
                  + Tải ảnh
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={
                  handleImageUpload
                }
                disabled={
                  uploadedImages.length >=
                    4 ||
                  isProcessing
                }
                style={{
                  display: "none",
                }}
              />

              {uploadedImages.length ===
              0 ? (
                <div
                  className="text-center"
                  style={{
                    border:
                      "1px dashed #cbd5e1",
                    borderRadius: 12,
                    padding: 30,
                    color: "#64748b",
                  }}
                >
                  Chưa có hình ảnh
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(120px, 1fr))",
                    gap: 12,
                  }}
                >
                  {uploadedImages.map(
                    (file, index) => (
                      <div
                        key={index}
                        style={{
                          position:
                            "relative",
                          borderRadius:
                            12,
                          overflow:
                            "hidden",
                          border:
                            "1px solid #e2e8f0",
                        }}
                      >
                        <img
                          src={getImagePreviewUrl(
                            file
                          )}
                          alt={`preview-${index}`}
                          style={{
                            width:
                              "100%",
                            height: 110,
                            objectFit:
                              "cover",
                          }}
                        />

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            handleRemoveImage(
                              index
                            )
                          }
                          disabled={
                            isProcessing
                          }
                          style={{
                            position:
                              "absolute",
                            top: 6,
                            right: 6,
                            width: 28,
                            height: 28,
                            borderRadius:
                              "50%",
                            padding: 0,
                          }}
                        >
                          ×
                        </Button>

                        <span
                          style={{
                            position:
                              "absolute",
                            bottom: 5,
                            left: 5,
                            background:
                              "rgba(0,0,0,.65)",
                            color:
                              "#fff",
                            padding:
                              "3px 7px",
                            borderRadius:
                              6,
                            fontSize:
                              11,
                          }}
                        >
                          {index + 1}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </Card.Body>
          </Card>

        </Form>
      </ConfirmationModal>
    </div>
  );
};

export default OwnerHotelListPage;