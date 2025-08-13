import { forwardRef, useEffect, useRef, useState } from "react";
import "./index.css";
import { cn } from "../../utils";
const SUPPORTED_TYPES = new Set([
  "text",
  "password",
  "number",
  "color",
  "range",
  "date",
  "time",
  "datetime-local",
  "month",
  "week",
]);
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
      type,
      ...props
    },
    ref
  ) => {
    const [isEnter, setIsEnter] = useState(false);
    const containerRef = useRef();
    const warnedRef = useRef(new Set());

    const rawType = (type ?? "text") + "";
    const lcType = rawType.toLowerCase();
    const finalType = SUPPORTED_TYPES.has(lcType) ? lcType : "text";
    if (
      finalType === "text" &&
      lcType !== "text" &&
      !warnedRef.current.has(lcType)
    ) {
      console.warn(
        `[Input] Unsupported input type "${rawType}" → falling back to "text". ` +
          `Supported: ${[...SUPPORTED_TYPES].join(", ")}`
      );
      warnedRef.current.add(lcType);
    }

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
        className={cn(
          "input-wrapper",
          { "input-type-range": type === "range" },
          { "input-type-color": type === "color" }
        )}
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
        {type === "range" && <div>{props.min ?? 0}</div>}
        <input
          type={finalType}
          data-disabled-action={disabled}
          ref={ref}
          name={props.name}
          className={cn(
            "common-input",
            { "padding-prefix": prefix },
            { "padding-suffix": suffix },
            { "no-padding": type === "range" || type === "color" },
            { "input-type-range": type === "range" },
            { "input-type-color": type === "color" }
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
        {type === "range" && <div>{props.max ?? 100}</div>}
        {prefix && type !== "range" && type !== "color" && (
          <div data-disabled-action={disabled} className="input-icon prefix">
            {prefix}
          </div>
        )}
        {suffix && type !== "range" && type !== "color" && (
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
