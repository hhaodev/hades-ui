import { cn } from "../../utils";
import "./index.css";

export default function Divider({
  dashed = false,
  align = "center",
  children,
  horizontal = true,
  vertical = false,
  style,
}) {
  const hasText = !!children;
  const isHorizontal = horizontal && !vertical;

  return (
    <div
      className={cn(
        "divider",
        `divider-${isHorizontal ? "horizontal" : "vertical"}`,
        dashed && "divider-dashed",
        hasText && isHorizontal && "divider-with-text",
        hasText && isHorizontal && `align-${align}`
      )}
      style={style}
    >
      {hasText && <span className="divider-text">{children}</span>}
    </div>
  );
}
