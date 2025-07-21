import { forwardRef } from "react";
import Stack from "../Stack";
import EllipsisWithTooltip from "../EllipsisWithTooltip";

export const DropdownItem = forwardRef(
  ({ children, onClick, row = 1, style, checked = false, ...rest }, ref) => {
    const defaultBg = "var(--hadesui-bg-color)";
    const hoverBg = "var(--hadesui-bg-btn-text)";

    const handleMouseEnter = (e) => {
      if (!checked) {
        e.currentTarget.style.background = hoverBg;
      }
    };

    const handleMouseLeave = (e) => {
      if (!checked) {
        e.currentTarget.style.background = defaultBg;
      }
    };

    return (
      <Stack
        ref={ref}
        role="menuitem"
        tabIndex={0}
        onClick={onClick}
        style={{
          width: "100%",
          padding: "8px 12px",
          transition: "background 0.2s",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          background: checked ? hoverBg : defaultBg,
          height: "50px",
          cursor: onClick ? "pointer" : "auto",
          ...style,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...rest}
      >
        <EllipsisWithTooltip row={row}>{children}</EllipsisWithTooltip>
      </Stack>
    );
  }
);

DropdownItem.displayName = "DropdownItem";
