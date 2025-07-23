import { forwardRef } from "react";

const Stack = forwardRef(
  ({ flex, flexCol, gap, align, justify, style, ...props }, ref) => {
    const mergedStyle = {
      ...(flex && { display: "flex" }),
      ...(flexCol && { display: "flex", flexDirection: "column" }),
      ...(align && { alignItems: align }),
      ...(justify && { justifyContent: justify }),
      ...(gap && { gap }),
      ...style,
    };
    return <div style={mergedStyle} ref={ref} {...props} />;
  }
);

Stack.displayName = "Stack";

export default Stack;
