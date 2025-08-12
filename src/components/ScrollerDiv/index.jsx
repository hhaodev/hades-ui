import { useEffect, useRef } from "react";

export default function ScrollerDiv(props) {
  const {
    aboveHeight,
    children,
    hasNextLoad,
    onLoadNext,
    containerHeight,
    isLoading,
    customStyle,
    quantitySkeleton = 5,
  } = props;
  const isFetchingRef = useRef(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isLoading) {
      isFetchingRef.current = false;
    }
  }, [isLoading]);

  useEffect(() => {
    const el = containerRef.current;
    if (
      el &&
      hasNextLoad &&
      !isLoading &&
      !isFetchingRef.current &&
      el.scrollHeight <= el.clientHeight
    ) {
      isFetchingRef.current = true;
      onLoadNext?.();
    }
  }, [children, hasNextLoad, isLoading]);

  const onScrollNext = (event) => {
    const target = event.target;
    const { scrollHeight, clientHeight, scrollTop } = target;
    if (
      !isLoading &&
      hasNextLoad &&
      !isFetchingRef.current &&
      scrollHeight - clientHeight - 50 <= scrollTop
    ) {
      isFetchingRef.current = true;
      onLoadNext && onLoadNext();
    }
  };

  const getMaxHeight = () => {
    if (containerHeight) return `${containerHeight}px`;

    return aboveHeight ? `calc(100vh - ${aboveHeight || 0}px)` : "100%";
  };

  return (
    <div
      ref={containerRef}
      onScroll={onScrollNext}
      style={{
        maxHeight: getMaxHeight(),
        ...customStyle,
        overflowY: "auto",
      }}
    >
      {children}
      {isLoading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginTop: 8,
          }}
        >
          {[...Array(quantitySkeleton)].map((_, index) => (
            <div
              key={`skeleton-async-${index}`}
              style={{ width: "100%", background: "red", height: 40 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
