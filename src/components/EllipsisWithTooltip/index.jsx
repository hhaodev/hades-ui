import {
  cloneElement,
  forwardRef,
  isValidElement,
  useRef,
  useState,
} from "react";
import Stack from "../Stack";
import Tooltip from "../Tooltip";

const EllipsisWithTooltip = forwardRef(
  ({ children, style = {}, ...rest }, ref) => {
    const localRef = useRef(null);

    const combinedRef = (el) => {
      localRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    };

    const [isOverflowing, setIsOverflowing] = useState(false);

    const checkOverflow = () => {
      const el = localRef.current;
      if (!el) return;
      setIsOverflowing(el.scrollWidth > el.clientWidth);
    };

    const handleMouseEnter = () => {
      checkOverflow();
    };

    let wrappedChild = children;
    if (isValidElement(children)) {
      const mergedStyle = {
        display: "inline",
        ...children.props.style,
      };
      wrappedChild = cloneElement(children, { style: mergedStyle });
    } else {
      wrappedChild = <span style={{ display: "inline" }}>{children}</span>;
    }

    return (
      <Tooltip tooltip={isOverflowing ? localRef.current?.textContent : null}>
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
            onMouseLeave={events.onMouseLeave}
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
            {wrappedChild}
          </Stack>
        )}
      </Tooltip>
    );
  }
);

EllipsisWithTooltip.displayName = "EllipsisWithTooltip";
export default EllipsisWithTooltip;
