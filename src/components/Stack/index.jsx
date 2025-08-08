import { forwardRef } from "react";

const Stack = forwardRef(
  (
    { flex, flexCol, wrap, gap, align, justify, style, wfull, ...props },
    ref
  ) => {
    const mergedStyle = {
      ...(flex && { display: "flex" }),
      ...(flexCol && { display: "flex", flexDirection: "column" }),
      ...(wrap && { display: "flex", flexWrap: "wrap" }),
      ...(align && { alignItems: align }),
      ...(justify && { justifyContent: justify }),
      ...(gap && { gap }),
      ...(wfull && { width: "100%" }),
      ...style,
    };
    return <div style={mergedStyle} ref={ref} {...props} />;
  }
);

Stack.displayName = "Stack";

export default Stack;
