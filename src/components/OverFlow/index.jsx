import React, {
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
  useEffect,
} from "react";
import Button from "../Button";
import Dropdown from "../Dropdown";
import Stack from "../Stack";
import { PlusIcon } from "../Icon";

export const GAP = 10;

export default function OverFlow({
  children,
  mode = "horizontal",
  customAction,
  style,
  getVisibleKeys,
  getOverflowKeys,
  customPopup,
}) {
  const containerRef = useRef(null);
  const measureRef = useRef(null);
  const moreFakeRef = useRef(null);
  const dropdownRef = useRef(null);

  const { gap, items } = useMemo(() => {
    let gap = GAP;
    let items = [];

    if (React.isValidElement(children)) {
      const styleGap =
        children.props?.style?.gap ??
        children.props?.style?.[mode === "horizontal" ? "columnGap" : "rowGap"];
      if (typeof styleGap === "number") {
        gap = styleGap;
      } else if (typeof styleGap === "string" && styleGap.endsWith("px")) {
        gap = parseFloat(styleGap);
      }

      const rawChildren = children.props?.children;
      items = React.Children.toArray(rawChildren);
    } else {
      items = React.Children.toArray(children);
    }

    return { gap, items };
  }, [children, mode]);

  const [visibleCount, setVisibleCount] = useState(items.length);

  const updateLayout = () => {
    const container = containerRef.current;
    const measure = measureRef.current;
    const moreEl = moreFakeRef.current;

    if (!container || !measure || !moreEl) return;

    const containerRect = container.getBoundingClientRect();
    const moreRect = moreEl.getBoundingClientRect();
    const moreSizeValue =
      mode === "horizontal" ? moreRect.width : moreRect.height;

    const childrenEls = Array.from(measure.children).slice(0, items.length);

    const sizes = childrenEls.map(
      (el) =>
        el.getBoundingClientRect()[mode === "horizontal" ? "width" : "height"]
    );

    const limit =
      mode === "horizontal" ? containerRect.width : containerRect.height;

    let total = 0;
    let fitCount = 0;

    for (let i = 0; i < sizes.length; i++) {
      if (total + sizes[i] <= limit) {
        total += sizes[i] + gap;
        fitCount++;
      } else {
        break;
      }
    }

    if (fitCount < items.length) {
      total = 0;
      fitCount = 0;
      for (let i = 0; i < sizes.length; i++) {
        if (total + sizes[i] + gap <= limit - moreSizeValue) {
          total += sizes[i] + gap;
          fitCount++;
        } else {
          break;
        }
      }
    }

    setVisibleCount(fitCount);
    const visibleItems = items.slice(0, fitCount);
    const overflowItems = items.slice(fitCount);

    getVisibleKeys?.(visibleItems.map((item) => item?.props?.id));
    getOverflowKeys?.(overflowItems.map((item) => item?.props?.id));
  };

  useLayoutEffect(() => {
    updateLayout();
  }, [items, mode]);

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver(() => updateLayout());
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const visibleItems = items.slice(0, visibleCount);
  const overflowItems = items.slice(visibleCount);

  const renderForMeasure = (child) => {
    if (!React.isValidElement(child)) return child;
    if (child.type === Dropdown || child.type.displayName === "Dropdown") {
      const newChild = React.cloneElement(child, {
        disabled: true,
      });
      return newChild;
    }
    return child;
  };

  return (
    <>
      {/* Measurement */}
      <div
        ref={measureRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          height: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: mode === "horizontal" ? "row" : "column",
          [mode === "horizontal" ? "columnGap" : "rowGap"]: `${gap}px`,
        }}
      >
        {items.map((child, i) => (
          <div key={i} style={{ flexShrink: 0 }}>
            {renderForMeasure(child)}
          </div>
        ))}
        <div ref={moreFakeRef} style={{ flexShrink: 0 }}>
          {customAction ? customAction?.() : <Button>+99</Button>}
        </div>
      </div>

      {/* Container */}
      <div
        ref={containerRef}
        style={{
          alignItems: "start",
          ...style,
          display: "flex",
          flexDirection: mode === "horizontal" ? "row" : "column",
          [mode === "horizontal" ? "columnGap" : "rowGap"]: `${gap}px`,
          flexWrap: "nowrap",
          overflow: "hidden",
          width: "100%",
          height: "100%",
          padding: 1,
        }}
      >
        {visibleItems.map((child, i) => (
          <div key={i} style={{ flexShrink: 0 }}>
            {child}
          </div>
        ))}

        {overflowItems.length > 0 && (
          <Dropdown
            ref={dropdownRef}
            fixedWidthPopup={false}
            menu={() =>
              customPopup ? (
                customPopup({
                  items: overflowItems.map((item, i) =>
                    React.cloneElement(item, {
                      key: i,
                      onClick: (...args) => {
                        item.props?.onClick?.(...args);
                        dropdownRef.current.hide();
                      },
                    })
                  ),
                  totalItemsCount: overflowItems.length,
                })
              ) : (
                <Stack
                  style={{
                    background: "var(--hadesui-bg-color)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap,
                    padding: 8,
                  }}
                >
                  {overflowItems.map((item, i) =>
                    React.cloneElement(item, {
                      key: i,
                      onClick: (...args) => {
                        item.props?.onClick?.(...args);
                        dropdownRef.current.hide();
                      },
                    })
                  )}
                </Stack>
              )
            }
          >
            {customAction ? (
              customAction?.()
            ) : (
              <Button theme="default">
                <PlusIcon /> {overflowItems.length}
              </Button>
            )}
          </Dropdown>
        )}
      </div>
    </>
  );
}
