
import { forwardRef } from "react";
import "./index.css";

const Input = forwardRef(({ error, ...props }, ref) => {
  return (
    <input
      ref={ref}
      name={props.name}
      data-border-red-error={!!error}
      className="common-input"
      {...props}
    />
  );
});

Input.displayName = "Input";
export default Input;
