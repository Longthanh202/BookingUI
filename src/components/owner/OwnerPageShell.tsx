import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faRotate } from "@fortawesome/free-solid-svg-icons";
import "../../styles/owner/OwnerWorkspacePage.css";
import "../../styles/owner/OwnerPageShell.css";

type OwnerPageShellProps = {
  title: string;
  description: string;
  notice?: string;
  onDismissNotice?: () => void;
  children: JSX.Element;
};

export default function OwnerPageShell({ title, description, notice, onDismissNotice, children }: OwnerPageShellProps) {
  const client = useQueryClient();
  const today = useMemo(() => new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "numeric", month: "long" }).format(new Date()), []);

  return <div className="owner-workspace owner-operations">
    <div className="owner-page-heading">
      <div><h1>{title}</h1><p>{description}</p></div>
      <div className="owner-date"><FontAwesomeIcon icon={faCalendarDays} /> {today}<Button variant="light" title="Làm mới" onClick={() => client.invalidateQueries()}><FontAwesomeIcon icon={faRotate} /></Button></div>
    </div>
    {notice && <Alert variant="success" dismissible onClose={onDismissNotice}>{notice}</Alert>}
    {children}
  </div>;
}
