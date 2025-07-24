import { forwardRef, useRef, useImperativeHandle } from "react";
import "./index.css";
import { cn } from "../../utils";

const Button = forwardRef(
  (
    {
      children,
      theme = "primary", // 'primary' | 'default' | 'link' | 'text' | 'dashed' | 'icon'
      disabled = false,
      loading = false,
      onClick,
      className = "",
      type = "button",
      ...rest
    },
    ref
  ) => {
    const innerRef = useRef(null);
    const isDisabled = disabled || loading;

    useImperativeHandle(ref, () => innerRef.current);

    const handleClick = (e) => {
      const btn = innerRef.current;
      if (!btn) return;
      if (theme !== "link" && theme !== "text") {
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
        className={cn(
          "hds-btn",
          `hds-btn-${theme}`,
          { "hds-btn-disabled": isDisabled },
          { "hds-btn-loading": loading },
          className
        )}
        onClick={isDisabled ? undefined : handleClick}
        disabled={isDisabled}
        type={type}
        {...rest}
      >
        {loading && <span className="hds-btn-spinner" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
