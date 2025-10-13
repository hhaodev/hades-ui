import { forwardRef, isValidElement } from "react";
import Ellipsis from "../Ellipsis";
import Stack from "../Stack";

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
    const hoverBg = "var(--hadesui-bg-selected-color)";

    const handleMouseEnter = (e) => {
      if (!checked) {
        e.currentTarget.style.background = hoverBg;
      }
      if (isValidElement(children) && children.props?.onMouseEnter) {
        children.props.onMouseEnter(e);
      }
    };

    const handleMouseLeave = (e) => {
      if (!checked) {
        e.currentTarget.style.background = defaultBg;
      }
      if (isValidElement(children) && children.props?.onMouseLeave) {
        children.props.onMouseLeave(e);
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
