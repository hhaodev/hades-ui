import React, { useRef, useState, forwardRef } from "react";
import Tooltip from "../Tooltip";
import Stack from "../Stack";

const EllipsisWithTooltip = forwardRef(
  ({ children, style = {}, ...rest }, ref) => {
    const localRef = useRef(null);
    const combinedRef = (el) => {
      localRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    };

    const [isOverflowing, setIsOverflowing] = useState(false);
    const [hovered, setHovered] = useState(false);

    const checkOverflow = () => {
      const el = localRef.current;
      if (!el) return;
      setIsOverflowing(el.scrollWidth > el.clientWidth);
    };

    const handleMouseEnter = () => {
      checkOverflow();
      setHovered(true);
    };

    const handleMouseLeave = () => {
      setHovered(false);
    };

    const isPlainText = typeof children === "string";

    return (
      <Tooltip title={isPlainText && isOverflowing ? children : null}>
        {(tooltipRef, events) => (
          <Stack
            {...rest}
            ref={(el) => {
              combinedRef(el);
              if (typeof tooltipRef === "function") tooltipRef(el);
              else if (tooltipRef) tooltipRef.current = el;
            }}
            onMouseEnter={(e) => {
              handleMouseEnter();
              events.onMouseEnter?.(e);
            }}
            onMouseLeave={(e) => {
              handleMouseLeave();
              events.onMouseLeave?.(e);
            }}
            onFocus={events.onFocus}
            onBlur={events.onBlur}
            style={{
              display: "inline-block",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              ...style,
            }}
          >
            {children}
          </Stack>
        )}
      </Tooltip>
    );
  }
);

EllipsisWithTooltip.displayName = "EllipsisWithTooltip";
export default EllipsisWithTooltip;
