import { useMemo } from "react";
import { Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import OwnerRefreshButton from "./OwnerRefreshButton";
import "../../styles/owner/OwnerWorkspacePage.css";
import "../../styles/owner/OwnerPageShell.css";

type OwnerPageShellProps = {
  title: string;
  description: string;
  notice?: string;
  onDismissNotice?: () => void;
  centerTitle?: boolean;
  children: JSX.Element;
};

export default function OwnerPageShell({ title, description, notice, onDismissNotice, centerTitle = false, children }: OwnerPageShellProps) {
  const today = useMemo(() => new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "numeric", month: "long" }).format(new Date()), []);

  return <div className="owner-workspace owner-operations">
    <div className={`owner-page-heading${centerTitle ? " owner-page-heading-centered" : ""}`}>
      <div><h1>{title}</h1><p>{description}</p></div>
      <div className="owner-date"><FontAwesomeIcon icon={faCalendarDays} /> {today}<OwnerRefreshButton /></div>
    </div>
    {notice && <Alert variant="success" dismissible onClose={onDismissNotice}>{notice}</Alert>}
    {children}
  </div>;
}
