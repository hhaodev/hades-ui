import { motion } from "framer-motion";
import { useEffect, useId, useState } from "react";

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

  useEffect(() => {
    if (!isControlled && tabs.length > 0 && !isValidKey(internalActive)) {
      setInternalActive(
        isValidKey(defaultActive) ? String(defaultActive) : String(tabs[0]?.key)
      );
    }
  }, [tabs, defaultActive, isControlled, internalActive]);

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
  };

  const wrapperStyle = {
    position: "relative",
    borderRadius: "6px",
  };

  const buttonStyle = (isSelected) => ({
    position: "relative",
    padding: "3px 8px",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    background: isSelected ? "var(--hadesui-blue-6)" : "transparent",
    color: isSelected ? "var(--hadesui-gray-1)" : "var(--hadesui-text-color)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  });

  const textStyle = {
    position: "relative",
  };

  const backgroundStyle = {
    position: "absolute",
    inset: 0,
    background: "var(--hadesui-blue-6)",
    borderRadius: "6px",
  };

  return (
    <div style={containerStyle}>
      {tabs.map((tab) => {
        const key = String(tab?.key);
        const isSelected = currentActive === key;
        return (
          <div style={wrapperStyle} key={key}>
            {isSelected && (
              <motion.div
                layoutId={`pill-tab-${id}`}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                style={backgroundStyle}
              />
            )}
            <div
              style={buttonStyle(isSelected)}
              onClick={() => {
                if (isSelected) return;
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
              <span style={textStyle}>{tab?.title}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChipTabs;
