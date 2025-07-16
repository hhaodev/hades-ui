import { forwardRef } from "react";

const Stack = forwardRef(({ ...props }, ref) => {
  return <div ref={ref} {...props} />;
});

Stack.displayName = "Stack";

export default Stack;
