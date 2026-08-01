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

const BaseModal = ({
  open,
  title,
  onOk,
  onCancel,
  confirmLoading = false,
  width = 600,
  children,
}: ModalProps) => {
  return (
    <Modal show={open} onHide={onCancel} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
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

export default BaseModal;
