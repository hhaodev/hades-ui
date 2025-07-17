import EllipsisWithTooltip from "../EllipsisWithTooltip";
import Stack from "../Stack";

export const DropdownItem = ({
  children,
  onClick,
  row = 1,
  style,
  ...rest
}) => {
  return (
    <Stack
      role="menuitem"
      tabIndex={0}
      onClick={onClick}
      style={{
        width: "100%",
        padding: "8px 12px",
        cursor: "pointer",
        transition: "background 0.2s",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--hadesui-bg-btn-text)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--hadesui-bg-color)";
      }}
      {...rest}
    >
      <EllipsisWithTooltip row={row}>{children}</EllipsisWithTooltip>
    </Stack>
  );
};
