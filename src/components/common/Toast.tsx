import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCircleExclamation, faInfo, faXmark } from "@fortawesome/free-solid-svg-icons";
import "../../styles/components/common/Toast.css";

export type ToastTone = "success" | "error" | "info";
export type ToastMessage = { message: string; tone: ToastTone };

const TOAST_EVENT = "stayro:toast";

export const showToast = (message: string, tone: ToastTone = "info") => {
  window.dispatchEvent(new CustomEvent<ToastMessage>(TOAST_EVENT, { detail: { message, tone } }));
};

const Toast = () => {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timeoutRef = useRef<number>();

  useEffect(() => {
    const handleToast = (event: Event) => {
      setToast((event as CustomEvent<ToastMessage>).detail);
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setToast(null), 3600);
    };
    window.addEventListener(TOAST_EVENT, handleToast);
    return () => {
      window.removeEventListener(TOAST_EVENT, handleToast);
      window.clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!toast) return null;

  const icon = toast.tone === "success" ? faCheck : toast.tone === "error" ? faCircleExclamation : faInfo;
  return (
    <div className={`stayro-toast stayro-toast--${toast.tone}`} role="status">
      <span className="stayro-toast__icon"><FontAwesomeIcon icon={icon} /></span>
      <span className="stayro-toast__message">{toast.message}</span>
      <button type="button" className="stayro-toast__close" aria-label="Đóng thông báo" onClick={() => setToast(null)}>
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </div>
  );
};

export default Toast;
