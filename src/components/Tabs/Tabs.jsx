import {
  useState,
  Children,
  isValidElement,
  useRef,
  useLayoutEffect,
  useId,
} from "react";

function Tabs({
  children,
  defaultActive,
  active,
  onChange,
  destroy,
  tabPosition = "top",
}) {
  const containerRef = useRef(null);
  const indicatorRef = useRef(null);
  const contentRef = useRef(null);
  const tabRefs = useRef({});
  const panes = Children.toArray(children).filter(isValidElement);

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
  const hasMounted = useRef(false);

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

  useLayoutEffect(() => {
    const el = tabRefs.current[String(currentActive)];
    const indicator = indicatorRef.current;
    const container = containerRef.current;
    if (!el || !indicator || !container) return;

    const updateIndicator = () => {
      const isVertical = tabPosition === "left" || tabPosition === "right";

      if (isVertical) {
        indicator.style.left = "";
        indicator.style.top = `${el.offsetTop}px`;
        indicator.style.width = "2.5px";
        indicator.style.height = `${el.offsetHeight}px`;
        indicator.style.right = tabPosition === "left" ? "0px" : "";
        indicator.style.left = tabPosition === "right" ? "0px" : "";
      } else {
        indicator.style.left = `${el.offsetLeft}px`;
        indicator.style.top = "";
        indicator.style.width = `${el.offsetWidth}px`;
        indicator.style.height = "2px";
        indicator.style.bottom = tabPosition === "top" ? "0px" : "";
        indicator.style.top = tabPosition === "bottom" ? "0px" : "";
      }

      if (!hasMounted.current) {
        indicator.style.transition = "none";
        requestAnimationFrame(() => {
          hasMounted.current = true;
          indicator.style.transition = "all 0.2s ease";
        });
      }
    };

    requestAnimationFrame(updateIndicator);
  }, [currentActive, tabPosition, panes.length]);

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

  const tabItemStyle = (isActive, isHover) => ({
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
    ...(isHover && !isActive ? { color: "var(--hadesui-blue-6)" } : {}),
  });

  const indicatorStyle = {
    position: "absolute",
    background: "var(--hadesui-blue-6)",
    borderRadius: "2px",
    pointerEvents: "none",
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
          {shouldRender && pane.props.children}
        </div>
      );
    });
  };

  const tabList = (
    <div style={tabListStyle} ref={containerRef}>
      <div ref={indicatorRef} style={indicatorStyle} />
      {panes.map((pane) => {
        const key = String(pane.props.tabKey);
        const isActive = key === String(currentActive);
        return (
          <div
            key={key}
            ref={(el) => (tabRefs.current[key] = el)}
            style={tabItemStyle(isActive, key === hoveredKey)}
            onClick={() => handleClick(pane.props.tabKey)}
            onMouseEnter={() => setHoveredKey(key)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            {pane.props.title}
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
