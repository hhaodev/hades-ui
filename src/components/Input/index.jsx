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
        <input
          ref={ref}
          name={props.name}
          className={cn(
            "common-input",
            { "padding-prefix": prefix },
            { "padding-suffix": suffix }
          )}
          {...props}
        />
        {prefix && <div className="input-icon prefix">{prefix}</div>}
        {suffix && <div className="input-icon suffix">{suffix}</div>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
