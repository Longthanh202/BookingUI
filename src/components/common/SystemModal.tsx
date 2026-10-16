import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import "../../styles/SystemModal.css";

type SystemModalProps = {
  show: boolean;
  onHide: () => void;
  children: React.ReactNode;
  centered?: boolean;
  size?: "sm" | "lg" | "xl";
  className?: string;
  dialogClassName?: string;
  scrollable?: boolean;
  backdrop?: boolean | "static";
  keyboard?: boolean;
};

type ModalContextValue = { titleId: string; onHide: () => void };
const ModalContext = createContext<ModalContextValue | null>(null);

function SystemModalRoot({
  show,
  onHide,
  children,
  size,
  className = "",
  dialogClassName = "",
  backdrop = true,
  keyboard = true,
}: SystemModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onHideRef = useRef(onHide);
  onHideRef.current = onHide;

  useEffect(() => {
    if (!show) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && keyboard && backdrop !== "static") {
        onHideRef.current();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [show, keyboard, backdrop]);

  if (!show || typeof document === "undefined") return null;

  const sizeClass = size ? `stayro-modal-dialog--${size}` : "";
  const handleBackdropMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (
      event.target === event.currentTarget &&
      backdrop === true
    ) {
      onHide();
    }
  };

  return createPortal(
    <div
      className={`stayro-modal-backdrop ${className}`.trim()}
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={dialogRef}
        className={`modal-dialog stayro-modal-dialog ${sizeClass} ${dialogClassName}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="modal-content stayro-modal-content">
          <ModalContext.Provider value={{ titleId, onHide }}>
            {children}
          </ModalContext.Provider>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ModalHeader({
  children,
  closeButton = false,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { closeButton?: boolean }) {
  const context = useContext(ModalContext);
  return (
    <div className={`modal-header stayro-modal-header ${className}`.trim()} {...props}>
      <div className="stayro-modal-heading">
        {React.Children.map(children, (child) => child)}
      </div>
      {closeButton && (
        <button
          type="button"
          className="stayro-modal-close"
          aria-label="Đóng hộp thoại"
          onClick={() => context?.onHide()}
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  );
}

function ModalTitle({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const context = useContext(ModalContext);
  return (
    <h2
      id={context?.titleId}
      className={`modal-title stayro-modal-title ${className}`.trim()}
      {...props}
    >
      {children}
    </h2>
  );
}

function ModalBody({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`modal-body stayro-modal-body ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

function ModalFooter({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`modal-footer stayro-modal-footer ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

type SystemModalComponent = typeof SystemModalRoot & {
  Header: typeof ModalHeader;
  Title: typeof ModalTitle;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
};

const SystemModal = Object.assign(SystemModalRoot, {
  Header: ModalHeader,
  Title: ModalTitle,
  Body: ModalBody,
  Footer: ModalFooter,
}) as SystemModalComponent;

export default SystemModal;
