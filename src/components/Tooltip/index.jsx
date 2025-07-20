import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  isValidElement,
  cloneElement,
  Fragment,
} from "react";
import { createPortal } from "react-dom";
import {
  computePosition,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/dom";
import Stack from "../Stack";

function TooltipPortal({ children }) {
  const portalNodeRef = useRef(null);

  if (!portalNodeRef.current) {
    const div = document.createElement("div");
    div.setAttribute("data-tooltip-portal", "true");
    document.body?.appendChild(div);
    portalNodeRef.current = div;
  }

  useEffect(() => {
    return () => {
      if (portalNodeRef.current) {
        document.body?.removeChild(portalNodeRef.current);
      }
    };
  }, []);

  return createPortal(children, portalNodeRef.current);
}

function getInitialTransform(placement) {
  if (placement.startsWith("top")) return "translateY(8px)";
  if (placement.startsWith("bottom")) return "translateY(-8px)";
  if (placement.startsWith("left")) return "translateX(8px)";
  if (placement.startsWith("right")) return "translateX(-8px)";
  return "translate(0, 0)";
}

const Tooltip = forwardRef(
  (
    {
      tooltip,
      children,
      placement = "top",
      offset: offsetValue = 8,
      className = "",
      style = {},
      trigger = "hover",
    },
    ref
  ) => {
    const triggerRef = useRef(null);
    const tooltipRef = useRef(null);
    const [visible, setVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [positionStyle, setPositionStyle] = useState({});
    const cleanupRef = useRef(null);
    const hideTimer = useRef(null);
    const hideTimer2 = useRef(null);

    useEffect(() => {
      if (!trigger.includes("click") || !visible) return;

      const handleClickOutside = (e) => {
        if (
          !tooltipRef.current?.contains(e.target) &&
          !triggerRef.current?.contains(e.target)
        ) {
          hide();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [visible, trigger]);

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
      hideTimer.current = setTimeout(() => setShouldRender(false), 200);
      hideTimer2.current = setTimeout(() => setVisible(false), 100);
    };

    useEffect(() => {
      if (!shouldRender || !triggerRef.current || !tooltipRef.current) return;
      const cleanup = autoUpdate(triggerRef.current, tooltipRef.current, () => {
        computePosition(triggerRef.current, tooltipRef.current, {
          placement,
          middleware: [
            offset(offsetValue),
            flip(["top", "bottom", "left", "right"]),
            shift(),
          ],
        }).then(({ x, y }) => {
          setPositionStyle({
            position: "absolute",
            left: `${x}px`,
            top: `${y}px`,
          });
        });
      });
      cleanupRef.current = cleanup;
      return () => cleanup();
    }, [shouldRender, placement, offsetValue]);

    const triggerEvents = {};

    if (trigger.includes("hover")) {
      triggerEvents.onMouseEnter = show;
      triggerEvents.onMouseLeave = hide;
      triggerEvents.onFocus = show;
      triggerEvents.onBlur = hide;
    }

    if (trigger.includes("click")) {
      triggerEvents.onClick = (e) => {
        e.stopPropagation();
        if (visible) {
          hide();
        } else {
          show();
        }
      };
    }

    let triggerNode = null;

    if (typeof children === "function") {
      triggerNode = children(mergedRef, triggerEvents);
    } else if (isValidElement(children)) {
      if (children.type === Fragment) {
        triggerNode = (
          <Stack
            ref={mergedRef}
            style={{ width: "fit-content" }}
            {...triggerEvents}
          >
            {children}
          </Stack>
        );
      } else {
        triggerNode = cloneElement(children, {
          ref: (el) => {
            mergedRef(el);
            const childRef = children.ref;
            if (typeof childRef === "function") childRef(el);
            else if (childRef) childRef.current = el;
          },
          ...triggerEvents,
        });
      }
    } else if (typeof children === "string" || typeof children === "number") {
      triggerNode = (
        <Stack
          style={{ width: "fit-content" }}
          ref={mergedRef}
          {...triggerEvents}
        >
          {children}
        </Stack>
      );
    } else {
      triggerNode = children;
    }

    return (
      <>
        {triggerNode}
        {shouldRender && tooltip && (
          <TooltipPortal>
            <Stack
              ref={tooltipRef}
              onMouseEnter={trigger === "hover" && show}
              onMouseLeave={trigger === "hover" && hide}
              style={{
                ...positionStyle,
                background: "var(--hadesui-tooltip-color)",
                color: "var(--hadesui-tooltiptext-color)",
                padding: "4px 8px",
                fontSize: 13,
                lineHeight: "18px",
                borderRadius: 4,
                maxWidth: "calc(100vw - 20px)",
                wordWrap: "break-word",
                whiteSpace: "normal",
                pointerEvents: "auto",
                opacity: visible ? 1 : 0,
                transform: visible
                  ? "translateY(0)"
                  : getInitialTransform(placement),
                transition: "opacity 0.2s ease, transform 0.2s ease",
                ...style,
              }}
              className={className}
              onClick={(e) => e.stopPropagation()}
            >
              {tooltip}
            </Stack>
          </TooltipPortal>
        )}
      </>
    );
  }
);

Tooltip.displayName = "Tooltip";
export default Tooltip;
