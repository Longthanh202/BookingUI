import { useState } from "react";
import { QueryKey, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/Button";
import { showToast } from "../common/Toast";
import "../../styles/owner/OwnerRefreshButton.css";

type OwnerRefreshButtonProps = {
  queryKey?: QueryKey;
};

export default function OwnerRefreshButton({ queryKey }: OwnerRefreshButtonProps) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await queryClient.refetchQueries(
        { type: "active", queryKey },
        { throwOnError: true }
      );
    } catch {
      showToast("Không thể làm mới dữ liệu. Vui lòng thử lại.", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      className="owner-refresh-button"
      variant="light"
      title={isRefreshing ? "Đang làm mới" : "Làm mới"}
      aria-label={isRefreshing ? "Đang làm mới dữ liệu" : "Làm mới dữ liệu"}
      aria-busy={isRefreshing}
      disabled={isRefreshing}
      onClick={refresh}
    >
      <FontAwesomeIcon
        icon={faRotate}
        className={isRefreshing ? "owner-refresh-icon is-refreshing" : "owner-refresh-icon"}
      />
    </Button>
  );
}
