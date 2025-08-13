import {
  Children,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useMergedState } from "../../utils";
import Button from "../Button";
import { DropdownItem } from "../Dropdown/DropdownItem";
import { DropdownMenu } from "../Dropdown/DropdownMenu";
import { MoreIcon } from "../Icon";
import OverFlow from "../OverFlow";

function Tabs({
  children,
  defaultActive,
  active,
  onChange,
  destroy,
  tabPosition = "top",
}) {
  function flattenChildren(children) {
    return Children.toArray(children).flatMap((child) => {
      if (!isValidElement(child)) return [];

      if (child.type?.displayName === "Tabs.Item") return [child];

      if (
        typeof child.type === "function" &&
        child.type !== Tabs.Item &&
        child.props
      ) {
        const rendered = child.type(child.props);
        return flattenChildren(rendered);
      }

      if (child.props?.children) return flattenChildren(child.props.children);

      return [];
    });
  }

  const panes = flattenChildren(children);

  const [currentActive, setCurrentActive] = useMergedState(undefined, {
    value: active,
    defaultValue: defaultActive ?? panes[0]?.props?.tabKey,
    onChange,
  });

  const [mountedTabs, setMountedTabs] = useState(() => {
    return destroy ? [] : [String(currentActive)];
  });

  const containerRef = useRef(null);
  const indicatorRef = useRef(null);
  const contentRef = useRef(null);
  const moreBtnRef = useRef(null);
  const tabRefs = useRef({});
  const hasMounted = useRef(false);
  const currentActiveRef = useRef(currentActive);
  const overflowKeysRef = useRef([]);
  const visibleKeys = useRef([]);

  useEffect(() => {
    currentActiveRef.current = currentActive;
  }, [currentActive]);

  useLayoutEffect(() => {
    if (!destroy) {
      setMountedTabs((prev) =>
        prev.includes(String(currentActive))
          ? prev
          : [...prev, String(currentActive)]
      );
    }
  }, [currentActive, destroy]);

  const updateIndicator = () => {
    const indicator = indicatorRef.current;
    const container = containerRef.current;
    const moreBtn = moreBtnRef.current;

    const currentKey = String(currentActiveRef.current);
    const el = tabRefs.current[currentKey];
    const isVertical = tabPosition === "left" || tabPosition === "right";

    if (!indicator || !container) return;

    const activeIsVisible = visibleKeys.current.includes(currentKey);

    const targetEl = activeIsVisible ? el : moreBtn;

    if (!targetEl) {
      indicator.style.display = "none";
      return;
    }

    if (isVertical) {
      indicator.style.left = "";
      indicator.style.top = `${targetEl.offsetTop}px`;
      indicator.style.width = "2.5px";
      indicator.style.height = `${targetEl.offsetHeight}px`;
      indicator.style.right = tabPosition === "left" ? "0px" : "";
      indicator.style.left = tabPosition === "right" ? "0px" : "";
    } else {
      indicator.style.left = `${targetEl.offsetLeft}px`;
      indicator.style.top = "";
      indicator.style.width = `${targetEl.offsetWidth}px`;
      indicator.style.height = "2px";
      indicator.style.bottom = tabPosition === "top" ? "0px" : "";
      indicator.style.top = tabPosition === "bottom" ? "0px" : "";
    }

    indicator.style.display = "block";

    if (!hasMounted.current) {
      indicator.style.transition = "none";
      requestAnimationFrame(() => {
        hasMounted.current = true;
        indicator.style.transition = "all 0.2s ease";
      });
    }
  };
  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      updateIndicator();
    });
  }, [currentActive, overflowKeysRef.current.length]);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        updateIndicator();
      });
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleClick = (tabKey) => {
    if (tabKey === currentActive) return;
    setCurrentActive(tabKey);
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

  const tabItemStyle = (isActive) => ({
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
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
      <OverFlow
        mode={
          tabPosition === "right" || tabPosition === "left"
            ? "vertical"
            : "horizontal"
        }
        customAction={() => {
          const activeKeyIncludesOverflow =
            overflowKeysRef.current.includes(currentActive);
          return (
            <div
              ref={moreBtnRef}
              style={{
                ...(tabPosition === "right" || tabPosition === "left"
                  ? {
                      width: "100%",
                      display: "flex",
                      justifyContent: tabPosition === "right" ? "start" : "end",
                      padding: "0px 8px",
                    }
                  : { height: "100%", display: "flex", alignItems: "center" }),
                cursor: "pointer",
              }}
            >
              <Button theme="icon">
                <MoreIcon
                  color={
                    activeKeyIncludesOverflow
                      ? "var(--hadesui-blue-6)"
                      : "currentColor"
                  }
                  size={14}
                />
              </Button>
            </div>
          );
        }}
        style={{
          alignItems:
            tabPosition !== "left" && tabPosition !== "bottom"
              ? "start"
              : "end",
        }}
        getOverflowKeys={(items) => {
          overflowKeysRef.current = items;
        }}
        getVisibleKeys={(items) => {
          visibleKeys.current = items;
        }}
        customPopup={({ items }) => {
          return (
            <DropdownMenu>
              {items.map((item, index) => (
                <DropdownItem
                  onClick={(e) => item.props?.onClick?.(e)}
                  key={index}
                >
                  {item}
                </DropdownItem>
              ))}
            </DropdownMenu>
          );
        }}
      >
        {panes.map((pane) => {
          const key = String(pane.props.tabKey);
          const isActive = key === String(currentActive);
          return (
            <div
              id={key}
              key={key}
              ref={(el) => {
                if (el) {
                  tabRefs.current[key] = el;
                } else {
                  delete tabRefs.current[key];
                }
              }}
              style={tabItemStyle(isActive)}
              onClick={() => handleClick(pane.props.tabKey)}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.color = "var(--hadesui-blue-6)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.color = "var(--hadesui-text-color)";
                }
              }}
            >
              {pane.props.title}
            </div>
          );
        })}
      </OverFlow>
    </div>
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "var(--hadesui-bg-color)",
        display: "flex",
        flexDirection,
      }}
    >
      {(tabPosition === "top" || tabPosition === "left") && tabList}
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "auto",
          fontSize: 14,
          color: "var(--hadesui-text-color)",
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
Tabs.Item.displayName = "Tabs.Item";
export default Tabs;
