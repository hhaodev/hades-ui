import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  forwardRef,
  isValidElement,
  cloneElement,
} from "react";
import { createPortal } from "react-dom";
import Stack from "../Stack";

const Tooltip = forwardRef(
  (
    {
      title,
      children,
      placement = "top",
      offset = 8,
      className = "",
      style = {},
    },
    ref
  ) => {
    const triggerRef = useRef(null);
    const tooltipRef = useRef(null);
    const [visible, setVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const hideTimer = useRef(null);
    const hideTimer2 = useRef(null);

    const mergedRef = (el) => {
      triggerRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    };

    const show = () => {
      clearTimeout(hideTimer.current);
      clearTimeout(hideTimer2.current);
      setShouldRender(true);
      setTimeout(() => setVisible(true), 50);
    };

    const hide = () => {
      clearTimeout(hideTimer.current);
      clearTimeout(hideTimer2.current);
      hideTimer.current = setTimeout(() => {
        setShouldRender(false);
      }, 200);
      hideTimer2.current = setTimeout(() => {
        setVisible(false);
      }, 100);
    };

    const updatePosition = () => {
      const trigger = triggerRef.current;
      const tooltip = tooltipRef.current;
      if (!trigger || !tooltip) return;

      const triggerRect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;

      let top, left;

      if (placement === "top") {
        top = triggerRect.top - tooltipRect.height - offset + scrollY;
      } else {
        top = triggerRect.bottom + offset + scrollY;
      }

      const rawLeft =
        triggerRect.left +
        triggerRect.width / 2 -
        tooltipRect.width / 2 +
        scrollX;

      const maxLeft = window.innerWidth - tooltipRect.width - 8;
      const minLeft = 8;

      left = Math.min(Math.max(rawLeft, minLeft), maxLeft);

      setPosition({
        top: Math.round(top),
        left: Math.round(left),
      });
    };

    useLayoutEffect(() => {
      if (!shouldRender) return;
      updatePosition();
    }, [shouldRender]);

    useEffect(() => {
      if (!visible) return;
      const handle = () => updatePosition();
      window.addEventListener("resize", handle);
      window.addEventListener("scroll", handle, true);
      return () => {
        window.removeEventListener("resize", handle);
        window.removeEventListener("scroll", handle, true);
      };
    }, [visible]);

    const triggerEvents = {
      onMouseEnter: show,
      onMouseLeave: hide,
      onFocus: show,
      onBlur: hide,
    };

    let triggerNode = null;

    if (typeof children === "function") {
      triggerNode = children(mergedRef, triggerEvents);
    } else if (isValidElement(children)) {
      triggerNode = cloneElement(children, {
        ref: (el) => {
          mergedRef(el);
          const childRef = children.ref;
          if (typeof childRef === "function") childRef(el);
          else if (childRef) childRef.current = el;
        },
        ...triggerEvents,
      });
    } else {
      console.warn("[Tooltip] children must be an element or function");
      return null;
    }

    return (
      <>
        {triggerNode}
        {shouldRender &&
          title &&
          createPortal(
            <Stack
              ref={tooltipRef}
              onMouseEnter={show}
              onMouseLeave={hide}
              style={{
                position: "absolute",
                top: position.top,
                left: position.left,
                background: "var(--hadesui-tooltip-color)",
                color: "var(--hadesui-tooltiptext-color)",
                padding: "4px 8px",
                fontSize: 12,
                borderRadius: 4,
                whiteSpace: "nowrap",
                pointerEvents: "auto",
                opacity: visible ? 1 : 0,
                transform: visible
                  ? "translateY(0)"
                  : placement === "top"
                  ? "translateY(4px)"
                  : "translateY(-4px)",
                transition: "opacity 0.2s ease, transform 0.2s ease",
                ...style,
              }}
              className={className}
              onClick={(e) => e.stopPropagation()}
            >
              {title}
            </Stack>,
            document.body
          )}
      </>
    );
  }
);

Tooltip.displayName = "Tooltip";
export default Tooltip;
