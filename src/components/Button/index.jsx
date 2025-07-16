import { forwardRef, useRef, useImperativeHandle } from "react";
import "./index.css";

const Button = forwardRef(
  (
    {
      children,
      type = "primary", // 'primary' | 'default' | 'link' | 'text' | 'dashed'
      disabled = false,
      loading = false,
      onClick,
      className = "",
      ...rest
    },
    ref
  ) => {
    const innerRef = useRef(null);
    const isDisabled = disabled || loading;

    useImperativeHandle(ref, () => innerRef.current);

    const classes = [
      "hds-btn",
      `hds-btn-${type}`,
      isDisabled ? "hds-btn-disabled" : "",
      loading ? "hds-btn-loading" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const handleClick = (e) => {
      const btn = innerRef.current;
      if (!btn) return;
      if (type !== "link" && type !== "text") {
        btn.classList.remove("hds-btn-wave-effect");
        void btn.offsetWidth;
        btn.classList.add("hds-btn-wave-effect");

        const cleanup = () => {
          btn.classList.remove("hds-btn-wave-effect");
          btn.removeEventListener("animationend", cleanup);
        };

        btn.addEventListener("animationend", cleanup);
      }

      onClick?.(e);
    };

    return (
      <button
        ref={innerRef}
        className={classes}
        onClick={isDisabled ? undefined : handleClick}
        disabled={isDisabled}
        {...rest}
      >
        {loading && <span className="hds-btn-spinner" />}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
