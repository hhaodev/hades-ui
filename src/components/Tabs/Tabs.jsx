import {
  useState,
  Children,
  isValidElement,
  useRef,
  useLayoutEffect,
  useId,
} from "react";
import { motion } from "framer-motion";

function Tabs({
  children,
  defaultActive,
  active,
  onChange,
  destroy,
  tabPosition = "top", // top | bottom | left | right
}) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const panes = Children.toArray(children).filter(isValidElement);
  const tabId = useId();

  const isControlled = active !== undefined;
  const [internalActive, setInternalActive] = useState(() => {
    const fallback = panes[0]?.props?.tabKey;
    return defaultActive ?? fallback;
  });
  const currentActive = isControlled ? active : internalActive;
  const [mountedTabs, setMountedTabs] = useState(() => {
    return destroy ? [] : [String(currentActive)];
  });
  const [contentHeight, setContentHeight] = useState(0);
  const [hoveredKey, setHoveredKey] = useState(null);

  useLayoutEffect(() => {
    if (!isControlled && defaultActive !== undefined) {
      setInternalActive(defaultActive);
    }
  }, [defaultActive, isControlled]);

  useLayoutEffect(() => {
    if (!destroy) {
      setMountedTabs((prev) =>
        prev.includes(String(currentActive))
          ? prev
          : [...prev, String(currentActive)]
      );
    }
  }, [currentActive, destroy]);

  useLayoutEffect(() => {
    if (destroy && contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect();
      setContentHeight(rect.height);
    }
  }, [currentActive, destroy]);

  const handleClick = (tabKey) => {
    if (tabKey === currentActive) return;
    if (!isControlled) setInternalActive(tabKey);
    onChange?.(tabKey);
  };

  const flexDirection =
    tabPosition === "left" || tabPosition === "right" ? "row" : "column";

  const tabListStyle = {
    display: "flex",
    position: "relative",
    gap: 20,
    flexDirection:
      tabPosition === "left" || tabPosition === "right" ? "column" : "row",
    ...(tabPosition === "top" && {
      borderBottom: "1px solid var(--hadesui-border-color)",
    }),
    ...(tabPosition === "bottom" && {
      borderTop: "1px solid var(--hadesui-border-color)",
    }),
    ...(tabPosition === "left" && {
      borderRight: "1px solid var(--hadesui-border-color)",
    }),
    ...(tabPosition === "right" && {
      borderLeft: "1px solid var(--hadesui-border-color)",
    }),
  };

  const tabItemStyle = (isActive, isHover) => {
    let style = {
      cursor: "pointer",
      fontSize: 14,
      color: isActive ? "var(--hadesui-blue-6)" : "var(--hadesui-text-color)",
      padding:
        tabPosition === "top"
          ? "5px 0 10px"
          : tabPosition === "bottom"
          ? "10px 0 5px"
          : tabPosition === "left"
          ? "5px 10px 5px 5px"
          : "5px 5px 5px 10px",
      transition: "color 0.2s",
    };

    if (!isActive && isHover) {
      style.color = "var(--hadesui-blue-6)";
    }

    return style;
  };

  const indicatorStyle = {
    position: "absolute",
    background: "var(--hadesui-blue-6)",
    borderRadius: "1px",
    ...(tabPosition === "top" && {
      height: 2,
      left: 0,
      right: 0,
      bottom: 0,
    }),
    ...(tabPosition === "bottom" && {
      height: 2,
      left: 0,
      right: 0,
      top: 0,
    }),
    ...(tabPosition === "left" && {
      width: 2.5,
      top: 0,
      bottom: 0,
      right: 0,
    }),
    ...(tabPosition === "right" && {
      width: 2.5,
      top: 0,
      bottom: 0,
      left: 0,
    }),
  };

  const renderContent = () => {
    if (destroy) {
      const currentPane = panes.find(
        (p) => String(p.props.tabKey) === String(currentActive)
      );
      return currentPane ? (
        <div ref={contentRef}>{currentPane.props.children}</div>
      ) : null;
    }

    return panes.map((pane) => {
      const key = String(pane.props.tabKey);
      const isActive = key === String(currentActive);
      const shouldRender = mountedTabs.includes(key);
      return (
        <div
          key={key}
          style={{ display: isActive ? "block" : "none" }}
          ref={isActive ? contentRef : null}
        >
          {shouldRender ? pane.props.children : null}
        </div>
      );
    });
  };

  const tabList = (
    <div style={tabListStyle} ref={containerRef}>
      {panes.map((pane) => {
        const key = String(pane.props.tabKey);
        const isActive = key === String(currentActive);
        return (
          <div key={key} style={{ position: "relative" }}>
            {isActive && (
              <motion.div
                layoutId={`tab-indicator-${tabId}`}
                style={indicatorStyle}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <div
              style={tabItemStyle(isActive, key === hoveredKey)}
              onClick={() => handleClick(pane.props.tabKey)}
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey(null)}
            >
              {pane.props.title}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "var(--hadesui-bg-color)",
        display: "flex",
        flexDirection,
      }}
    >
      {(tabPosition === "top" || tabPosition === "left") && tabList}
      <div
        style={{
          width: "100%",
          fontSize: 14,
          color: "var(--hadesui-text-color)",
          minHeight: destroy ? contentHeight : undefined,
          padding:
            tabPosition === "left" || tabPosition === "right"
              ? "10px"
              : "10px 0px",
        }}
      >
        {renderContent()}
      </div>
      {(tabPosition === "bottom" || tabPosition === "right") && tabList}
    </div>
  );
}

function TabPane({ children }) {
  return children;
}

Tabs.Item = TabPane;
export default Tabs;
