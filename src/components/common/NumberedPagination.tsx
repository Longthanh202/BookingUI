import Button from "react-bootstrap/Button";
import "../../styles/NumberedPagination.css";

type NumberedPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
};

type PageItem = number | "start-ellipsis" | "end-ellipsis";

const getPageItems = (page: number, totalPages: number): PageItem[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 4) return [1, 2, 3, 4, 5, "end-ellipsis", totalPages];
  if (page >= totalPages - 3) {
    return [1, "start-ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "start-ellipsis", page - 1, page, page + 1, "end-ellipsis", totalPages];
};

export default function NumberedPagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  className = "",
}: NumberedPaginationProps) {
  const safeTotal = Math.max(1, Math.trunc(totalPages) || 1);
  const safePage = Math.min(safeTotal, Math.max(1, Math.trunc(page) || 1));
  const items = getPageItems(safePage, safeTotal);

  return (
    <nav className={`numbered-pagination ${className}`.trim()} aria-label="Phân trang">
      <span className="numbered-pagination__status" aria-live="polite">
        Trang <strong>{safePage}</strong> / {safeTotal}
      </span>
      <div className="numbered-pagination__controls">
        <Button
          size="sm"
          variant="light"
          aria-label="Trang đầu"
          title="Trang đầu"
          disabled={disabled || safePage === 1}
          onClick={() => onPageChange(1)}
        >
          &lt;&lt;
        </Button>
        {items.map((item) =>
          typeof item === "number" ? (
            <Button
              key={item}
              size="sm"
              variant={item === safePage ? "primary" : "light"}
              aria-label={`Trang ${item}`}
              aria-current={item === safePage ? "page" : undefined}
              disabled={disabled}
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          ) : (
            <span key={item} className="numbered-pagination__ellipsis" aria-hidden="true">
              ...
            </span>
          )
        )}
        <Button
          size="sm"
          variant="light"
          aria-label="Trang cuối"
          title="Trang cuối"
          disabled={disabled || safePage === safeTotal}
          onClick={() => onPageChange(safeTotal)}
        >
          &gt;&gt;
        </Button>
      </div>
    </nav>
  );
}
