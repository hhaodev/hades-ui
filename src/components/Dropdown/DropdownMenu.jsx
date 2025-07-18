import { forwardRef } from "react";
import Stack from "../Stack";

export const DropdownMenu = forwardRef(({ children, style, ...rest }, ref) => {
  return (
    <Stack
      ref={ref}
      role="menu"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: 8,
        width: "100%",
        ...style,
      }}
      {...rest}
    >
      {children}
    </Stack>
  );
});

DropdownMenu.displayName = "DropdownMenu";
