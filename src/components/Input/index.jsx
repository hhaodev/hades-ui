import { forwardRef, useEffect, useRef, useState } from "react";
import "./index.css";
import { cn } from "../../utils";

const Input = forwardRef(
  (
    {
      prefix,
      suffix,
      error,
      "data-border-red-error": borderRed,
      disabled = false,
      onBlur,
      onFocus,
      ...props
    },
    ref
  ) => {
    const [isEnter, setIsEnter] = useState(false);
    const containerRef = useRef();

    useEffect(() => {
      if (!isEnter && containerRef.current) {
        const el = containerRef.current;
        el.style.borderColor = "var(--hadesui-border-color)";
      }
    }, [isEnter]);

    return (
      <div
        ref={containerRef}
        data-disabled-action={disabled}
        data-border-red-error={borderRed}
        className="input-wrapper"
        onMouseEnter={(e) => {
          if (!disabled && !isEnter) {
            e.currentTarget.style.borderColor = "var(--hadesui-blue-6)";
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isEnter) {
            e.currentTarget.style.borderColor = "var(--hadesui-border-color)";
          }
        }}
      >
        <input
          data-disabled-action={disabled}
          ref={ref}
          name={props.name}
          className={cn(
            "common-input",
            { "padding-prefix": prefix },
            { "padding-suffix": suffix }
          )}
          onFocus={(e) => {
            onFocus?.(e);
            setIsEnter(true);
          }}
          onBlur={(e) => {
            onBlur?.(e);
            setIsEnter(false);
          }}
          {...props}
        />
        {prefix && (
          <div data-disabled-action={disabled} className="input-icon prefix">
            {prefix}
          </div>
        )}
        {suffix && (
          <div data-disabled-action={disabled} className="input-icon suffix">
            {suffix}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
