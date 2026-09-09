import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

type ModalProps = {
  open: boolean;
  title: string;
  onOk: () => void;
  onCancel: () => void;
  confirmLoading?: boolean;
  width?: number;
  children: React.ReactNode;
};

const ConfirmationModal = ({
  open,
  title,
  onOk,
  onCancel,
  confirmLoading = false,
  width = 900,
  children,
}: ModalProps) => {
  const size = width >= 1000 ? "xl" : "lg";

  return (
    <Modal
      show={open}
      onHide={onCancel}
      centered
      size={size}
      dialogClassName="base-modal-dialog modal-xl"
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "65vh", overflowY: "auto" }}>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Hủy
        </Button>
        <Button variant="primary" onClick={onOk} disabled={confirmLoading}>
          {confirmLoading ? "Đang lưu..." : "Lưu"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
