import { cn } from "../../utils";
import "./index.css";

export default function Divider({
  dashed = false,
  align = "center",
  children,
}) {
  const hasText = !!children;

  return (
    <div
      className={cn(
        "divider",
        dashed && "divider-dashed",
        hasText && "divider-with-text",
        hasText && `align-${align}`
      )}
    >
      {hasText && <span className="divider-text">{children}</span>}
    </div>
  );
}
