import { forwardRef } from "react";
import Stack from "../Stack";
import Ellipsis from "../Ellipsis";

export const DropdownItem = forwardRef(
  (
    {
      children,
      onClick,
      row = 1,
      style,
      checked = false,
      view = false,
      ...rest
    },
    ref
  ) => {
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
        onClick={(e) => (view ? undefined : onClick(e))}
        style={{
          width: "100%",
          padding: "8px 12px",
          transition: "background 0.2s",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          background: checked ? hoverBg : defaultBg,
          height: "40px",
          minHeight: "40px",
          cursor: onClick ? "pointer" : "auto",
          fontSize: 14,
          ...style,
        }}
        onMouseEnter={(e) => (view ? undefined : handleMouseEnter(e))}
        onMouseLeave={(e) => (view ? undefined : handleMouseLeave(e))}
        {...rest}
      >
        <Ellipsis row={row}>{children}</Ellipsis>
      </Stack>
    );
  }
);

DropdownItem.displayName = "DropdownItem";
