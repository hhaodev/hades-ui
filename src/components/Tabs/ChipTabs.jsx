import { useEffect, useLayoutEffect, useRef } from "react";
import { useMergedState } from "../../utils";

function isValidKey(value) {
  return value !== undefined && value !== null;
}

const ChipTabs = ({ tabs = [], defaultActive, active, onChange }) => {
  const [currentActive, setCurrentActive] = useMergedState(undefined, {
    value: active,
    defaultValue: isValidKey(defaultActive)
      ? String(defaultActive)
      : String(tabs[0]?.key ?? ""),
    onChange: (val) => {
      const tab = tabs.find((t) => String(t.key) === val);
      onChange?.(tab);
    },
  });

  const currentActiveRef = useRef(currentActive);
  const containerRef = useRef(null);
  const indicatorRef = useRef(null);
  const tabRefs = useRef({});
  const hasMounted = useRef(false);

  useEffect(() => {
    currentActiveRef.current = currentActive;
  }, [currentActive]);

  const updateIndicator = () => {
    const el = tabRefs.current[currentActiveRef.current];
    const indicator = indicatorRef.current;
    const container = containerRef.current;
    if (!el || !indicator || !container) return;
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

  useLayoutEffect(() => {
    requestAnimationFrame(updateIndicator);
  }, [currentActive, tabs]);

  useEffect(() => {
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      updateIndicator();
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const containerStyle = {
    backgroundColor: "var(--hadesui-bg-chip-tab-color)",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "3px",
    padding: "3px",
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
              setCurrentActive(key);
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
