import { forwardRef } from "react";
import "./index.css";
import { cn } from "../../utils";

const Input = forwardRef(
  (
    { prefix, suffix, error, "data-border-red-error": borderRed, ...props },
    ref
  ) => {
    return (
      <div data-border-red-error={!!error} className="input-wrapper">
        {prefix && <div className="input-icon prefix">{prefix}</div>}

        <input
          ref={ref}
          name={props.name}
          className={"common-input"}
          {...props}
        />

        {suffix && <div className="input-icon suffix">{suffix}</div>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
