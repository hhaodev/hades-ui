import Stack from "../Stack";

export const DropdownMenu = ({ children, style, ...rest }) => {
  return (
    <Stack
      role="menu"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: 8,
        width: "100%",
        justifyContent: "centner",
        ...style,
      }}
      {...rest}
    >
      {children}
    </Stack>
  );
};
