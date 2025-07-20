import {
  cloneElement,
  forwardRef,
  isValidElement,
  useRef,
  useState,
  useEffect,
} from "react";
import Stack from "../Stack";
import Tooltip from "../Tooltip";

const EllipsisWithTooltip = forwardRef(
  ({ children, style = {}, placement, row = 1, offset = 8, ...rest }, ref) => {
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

      const computed = getComputedStyle(el);

      if (row === 1) {
        setIsOverflowing(el.scrollWidth > el.clientWidth);
      } else {
        const lineHeight = parseFloat(computed.lineHeight);
        const maxHeight = lineHeight * row;
        setIsOverflowing(el.scrollHeight > maxHeight + 1);
      }
    };

    useEffect(() => {
      checkOverflow();
    }, [children, row]);

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

    const multiLineStyle =
      row === 1
        ? {
            whiteSpace: "nowrap",
          }
        : {
            display: "-webkit-box",
            WebkitLineClamp: row,
            WebkitBoxOrient: "vertical",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            lineHeight: "20px",
          };

    return (
      <Tooltip
        offset={offset}
        placement={placement}
        tooltip={isOverflowing ? localRef.current?.textContent : null}
      >
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
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              ...multiLineStyle,
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
