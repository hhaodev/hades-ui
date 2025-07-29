import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

function isValidKey(value) {
  return value !== undefined && value !== null;
}

const ChipTabs = ({ tabs = [], defaultActive, active, onChange }) => {
  const id = useId();
  const isControlled = active !== undefined;
  const [internalActive, setInternalActive] = useState(() =>
    isValidKey(defaultActive)
      ? String(defaultActive)
      : String(tabs[0]?.key ?? "")
  );
  const currentActive = isControlled ? String(active) : internalActive;

  const containerRef = useRef(null);
  const indicatorRef = useRef(null);
  const tabRefs = useRef({});
  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    const el = tabRefs.current[currentActive];
    const indicator = indicatorRef.current;
    const container = containerRef.current;

    if (!el || !indicator || !container) return;

    const updateIndicator = () => {
      const tabRect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const left = tabRect.left - containerRect.left;
      const top = tabRect.top - containerRect.top;

      indicator.style.left = `${left}px`;
      indicator.style.top = `${top}px`;
      indicator.style.width = `${tabRect.width}px`;
      indicator.style.height = `${tabRect.height}px`;

      if (!hasMounted.current) {
        indicator.style.transition = "none";
        requestAnimationFrame(() => {
          hasMounted.current = true;
          indicator.style.transition =
            "left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease";
        });
      }
    };

    requestAnimationFrame(updateIndicator);
  }, [currentActive, tabs]);

  const containerStyle = {
    backgroundColor: "var(--hadesui-bg-chip-tab-color)",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "3px",
    padding: "3px",
    height: "100%",
    width: "fit-content",
    borderRadius: "8px",
    position: "relative",
  };

  const buttonStyle = (isSelected) => ({
    padding: "4px 8px",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    background: "transparent",
    color: isSelected ? "var(--hadesui-gray-1)" : "var(--hadesui-text-color)",
    cursor: "pointer",
    position: "relative",
    backgroundColor: "transparent",
    transition: "all 0.2s ease",
  });

  const indicatorStyle = {
    position: "absolute",
    background: "var(--hadesui-blue-6)",
    borderRadius: "5px",
    pointerEvents: "none",
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      <div ref={indicatorRef} style={indicatorStyle} />
      {tabs.map((tab) => {
        const key = String(tab?.key);
        const isSelected = currentActive === key;
        return (
          <div
            key={key}
            ref={(el) => (tabRefs.current[key] = el)}
            style={buttonStyle(isSelected)}
            onClick={(e) => {
              if (isSelected) return;
              e.currentTarget.style.backgroundColor = "transparent";
              if (!isControlled) setInternalActive(key);
              onChange?.(tab);
            }}
            onMouseEnter={(e) => {
              if (!isSelected)
                e.currentTarget.style.backgroundColor =
                  "var(--hadesui-bg-chip-tab-hover)";
            }}
            onMouseLeave={(e) => {
              if (!isSelected)
                e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {tab?.title}
          </div>
        );
      })}
    </div>
  );
};

export default ChipTabs;
