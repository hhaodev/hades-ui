import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useId, useRef, useState } from "react";
import { useMergedState } from "../../utils";
import Ellipsis from "../Ellipsis";
import { DoubleRightIcon, RightIcon, UpIcon } from "../Icon";
import Tooltip from "../Tooltip";

import { createContext, useContext } from "react";
import Dropdown from "../Dropdown";
import Stack from "../Stack";

const SidebarContext = createContext();

const useSidebar = () => useContext(SidebarContext);

const checkChildActive = (node, selected) => {
  if (node.key === selected) return true;
  if (node.children) {
    return node.children.some((child) => checkChildActive(child, selected));
  }
  return false;
};

const buildPath = (item, selected, path = []) => {
  if (item.key === selected) {
    return [...path, item];
  }

  if (item.children) {
    for (const child of item.children) {
      const childPath = buildPath(child, selected, [...path, item]);
      if (childPath) return childPath;
    }
  }

  return null;
};

const Sidebar = ({
  items = [],
  selectedKey,
  defaultSelectedKey,
  onSelectKey,
  onSelectItem,
  expandedItems: expandedProps,
  defaultExpandedItems,
  onExpandedChange,
  treeLine = false,
  collapse,
  hasCollapseButton = true,
}) => {
  const sidebarId = useId().replace(/[^a-zA-Z0-9_-]/g, "_");
  const itemsFlatRef = useRef(new Map());
  const dropdownRef = useRef();
  const navRef = useRef();

  const [open, setOpen] = useState(!collapse);
  const [needAnimate, setNeedAnimate] = useState(false);
  const [containerHovered, setContainerHovered] = useState(false);

  const [selected, setSelected] = useMergedState(items[0]?.key, {
    value: selectedKey,
    defaultValue: defaultSelectedKey,
    onChange: (val) => {
      onSelectKey?.(val);
      const selectedItem = itemsFlatRef.current.get(val);
      if (selectedItem) onSelectItem?.(selectedItem);
    },
  });
  const [expandedItems, setExpandedItems] = useMergedState([], {
    value: expandedProps,
    defaultValue: defaultExpandedItems,
    onChange: onExpandedChange,
  });

  useEffect(() => {
    requestAnimationFrame(() => {
      setNeedAnimate(true);
    });
  });

  useEffect(() => {
    const map = new Map();
    const dfs = (arr) => {
      arr.forEach((i) => {
        map.set(i.key, i);
        if (i.children) dfs(i.children);
      });
    };
    dfs(items);
    itemsFlatRef.current = map;
  }, [items]);

  useEffect(() => {
    if (collapse !== undefined) {
      setOpen(!collapse);
    }
  }, [collapse]);

  return (
    <SidebarContext.Provider
      value={{
        sidebarId,
        open,
        setOpen,
        containerHovered,
        selected,
        setSelected,
        needAnimate,
        expandedItems,
        setExpandedItems,
        treeLine,
        dropdownRef,
        navRef,
      }}
    >
      <motion.nav
        id={`sidebar-${sidebarId}`}
        layout
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          flexShrink: 0,
          width: open ? 240 : "fit-content",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "var(--hadesui-bg-color)",
        }}
      >
        <motion.div layout>
          <TitleSection />
          <motion.div
            layout
            ref={navRef}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              padding: "8px 0px 8px 8px",
              scrollbarGutter: "stable",
              maxHeight: `calc(100vh - 56px - ${
                hasCollapseButton ? "36px" : "0px"
              } - 2px)`,
              overflow: containerHovered ? "auto" : "hidden",
              userSelect: "none",
            }}
            onMouseEnter={() => setContainerHovered(true)}
            onMouseLeave={() => setContainerHovered(false)}
          >
            {items.map((item) => (
              <Render key={item.key} item={item} />
            ))}
          </motion.div>
        </motion.div>
        {hasCollapseButton && <ToggleClose />}
      </motion.nav>
    </SidebarContext.Provider>
  );
};

const Render = ({ item }) => {
  const { open } = useSidebar();
  return (
    <Tooltip
      placement="right"
      key={item.key}
      tooltip={
        open || (item.children && item.children.length > 0 && !open)
          ? null
          : item.title
      }
    >
      <motion.div layout>
        <Option item={item} />
      </motion.div>
    </Tooltip>
  );
};

const RenderInDropdown = ({ items }) => {
  return (
    <React.Fragment>
      {items.map((item) => (
        <OptionDropDown key={item.key} item={item} />
      ))}
    </React.Fragment>
  );
};

const OptionDropDown = ({ item }) => {
  const { selected, setSelected, dropdownRef, navRef } = useSidebar();
  const [hovered, setHovered] = useState(false);

  const isActive = selected === item.key;
  const isChildActive = item.children
    ? item.children.some((child) => checkChildActive(child, selected))
    : false;

  const handleClick = (e) => {
    if (item.onClick) item.onClick(e);
    setSelected(item.key);
    dropdownRef.current.hide();
    navRef.current.style.overflow = "hidden";
  };

  if (!item.children || item.children.length === 0) {
    return (
      <motion.div
        tabIndex={1}
        layout
        key={item.key}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleClick(e);
        }}
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          height: 40,
          width: "100%",
          borderRadius: 6,
          padding: "0 8px",
          cursor: "pointer",
          background:
            isActive || hovered
              ? "var(--hadesui-bg-selected-color)"
              : "var(--hadesui-bg-color)",
          color:
            isActive || isChildActive ? "var(--hadesui-blue-6)" : undefined,
          transition: "background 0.2s, color 0.2s",
        }}
      >
        <motion.div
          style={{ width: 20, display: "grid", placeContent: "center" }}
        >
          {item.icon ? <item.icon /> : <TitleInitial title={item.title} />}
        </motion.div>
        <Ellipsis>
          <Stack style={{ cursor: "pointer" }}>{item.title}</Stack>
        </Ellipsis>
      </motion.div>
    );
  }

  return (
    <Dropdown
      fixedWidthPopup={false}
      trigger={["hover"]}
      placement="right-start"
      menu={<RenderInDropdown items={item.children} />}
    >
      <motion.div
        tabIndex={1}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          height: 40,
          width: "100%",
          borderRadius: 6,
          padding: "0 8px",
          cursor: "pointer",
          background:
            isActive || hovered
              ? "var(--hadesui-bg-selected-color)"
              : "var(--hadesui-bg-color)",
          color:
            isActive || isChildActive ? "var(--hadesui-blue-6)" : undefined,
          transition: "background 0.2s, color 0.2s",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <motion.div
          layout
          style={{
            display: "grid",
            placeContent: "center",
            width: 20,
            height: "100%",
          }}
        >
          {item.icon ? <item.icon /> : <TitleInitial title={item.title} />}
        </motion.div>
        <motion.span
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Ellipsis>
            <Stack style={{ cursor: "pointer" }}>{item.title}</Stack>
          </Ellipsis>
        </motion.span>
        <motion.span
          style={{
            right: 8,
            width: 16,
            height: 16,
            borderRadius: "50%",
            fontSize: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RightIcon />
        </motion.span>
      </motion.div>
    </Dropdown>
  );
};

const Option = ({ item, level = 0 }) => {
  const {
    open,
    containerHovered,
    selected,
    setSelected,
    needAnimate,
    expandedItems,
    setExpandedItems,
    treeLine,
    dropdownRef,
  } = useSidebar();
  const [hovered, setHovered] = useState(false);
  const isActive = selected === item.key;
  const isExpanded = expandedItems.includes(item.key);
  const isChildActive = item.children
    ? item.children.some((child) => {
        if (child.children) {
          return checkChildActive(child, selected);
        }
        return child.key === selected;
      })
    : false;

  const path = buildPath(item, selected);
  let nearestParent = null;

  if (path && path.length > 1) {
    for (let i = path.length - 2; i >= 0; i--) {
      const candidate = path[i];
      const allParentsExpanded = path
        .slice(0, i)
        .every((p) => expandedItems.includes(p.key));
      if (expandedItems.includes(candidate.key) && allParentsExpanded) {
        nearestParent = candidate;
        break;
      }
    }
  }

  const isNearestParentActive = nearestParent?.key === item.key;

  const handleClick = (e) => {
    if (item.children && item.children.length > 0) {
      if (!open) return;
      setExpandedItems((prev) =>
        isExpanded ? prev.filter((k) => k !== item.key) : [...prev, item.key]
      );
    } else {
      if (item.onClick) item.onClick(e);
      setSelected(item.key);
    }
  };
  return (
    <motion.div layout>
      <Dropdown
        ref={dropdownRef}
        fixedWidthPopup={false}
        trigger={["hover"]}
        placement="right-start"
        menu={
          item.children && item.children?.length > 0 && !open ? (
            <RenderInDropdown items={item.children} />
          ) : null
        }
      >
        <motion.div
          tabIndex={1}
          layout
          onKeyDown={(e) => {
            if (e.key === "Enter") handleClick(e);
          }}
          onClick={handleClick}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: open ? "start" : "center",
            height: 40,
            width: open ? "100%" : 40,
            ...(level !== 0
              ? {
                  borderBottomRightRadius: 8,
                  borderTopRightRadius: 8,
                }
              : {
                  borderRadius: 8,
                }),
            background:
              isActive || hovered
                ? "var(--hadesui-bg-selected-color)"
                : "var(--hadesui-bg-color)",
            cursor: "pointer",
            padding: "0 8px",
            gap: 6,
            fontSize: 14,
            color:
              isActive || (isChildActive && !isExpanded)
                ? "var(--hadesui-blue-6)"
                : undefined,
            transition: "background 0.2s ease, color 0.2s ease",
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
        >
          <motion.div
            initial={false}
            animate={{
              opacity:
                isActive || hovered || (isChildActive && (!isExpanded || !open))
                  ? 1
                  : 0,
              height:
                isActive ||
                (item.children?.length > 0 && !open && isChildActive)
                  ? "100%"
                  : hovered
                  ? 10
                  : 3,
              top: isActive ? 0 : "50%",
              transform: isActive ? "none" : "translateY(-50%)",
            }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              left: -(7 + level * (treeLine ? 16 : 15)),
              minWidth: 3,
              borderRadius: 2,
              background: "var(--hadesui-blue-6)",
            }}
          />
          {level !== 0 && (
            <motion.div
              initial={false}
              animate={{
                opacity: isActive || hovered ? 0.85 : 0,
                height: "100%",
                top: 0,
              }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                left: -(level * (treeLine ? 16 : 15)),
                minWidth: level * (treeLine ? 16 : 15),
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
                background: "var(--hadesui-bg-selected-color)",
              }}
            />
          )}
          <motion.div
            layout
            style={{
              display: "grid",
              placeContent: "center",
              width: 20,
              height: "100%",
            }}
          >
            {item.icon ? (
              <item.icon />
            ) : (
              <TitleInitial title={item.title} size={open ? 20 : 28} />
            )}
          </motion.div>
          {open && (
            <motion.span
              layout
              initial={needAnimate ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.125 }}
              style={{
                maxWidth: `calc(100% - 44px)`,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Ellipsis>
                <Stack style={{ cursor: "pointer" }}>{item.title}</Stack>
              </Ellipsis>
            </motion.span>
          )}
          {item.children && item.children.length > 0 && open && (
            <motion.span
              initial={needAnimate ? { scale: 0, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.125 }}
              style={{
                position: "absolute",
                right: 8,
                width: 16,
                height: 16,
                borderRadius: "50%",
                fontSize: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UpIcon
                style={{
                  transform: isExpanded ? "rotate(0deg)" : "rotate(180deg)",
                  transition: "transform 0.2s",
                }}
              />
            </motion.span>
          )}
        </motion.div>
      </Dropdown>
      {item.children && item.children.length > 0 && open && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key={`submenu-level-${level + 1}`}
              initial={
                needAnimate
                  ? { height: 0, opacity: 0, borderLeftColor: "rgba(0,0,0,0)" }
                  : false
              }
              animate={{
                height: "auto",
                opacity: 1,
                borderLeftColor:
                  containerHovered || isNearestParentActive
                    ? "var(--hadesui-border-color)"
                    : "rgba(0,0,0,0)",
              }}
              exit={{
                height: 0,
                opacity: 0,
                transition: {
                  height: { duration: 0.2 },
                  opacity: { duration: 0.1 },
                  borderLeftColor: { duration: 0.2 },
                },
              }}
              transition={{ duration: 0.2 }}
              style={{
                marginLeft: 15,
                borderLeftWidth: treeLine ? 1 : 0,
                borderLeftStyle: "solid",
              }}
            >
              <motion.div
                layout
                style={{
                  paddingTop: 4,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                {item.children.map((child) => (
                  <Option key={child.key} item={child} level={level + 1} />
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

const TitleInitial = ({ title, size = 20 }) => {
  if (!title) return null;

  const firstChar = title.charAt(0).toUpperCase();

  return (
    <motion.div
      layout
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        backgroundColor: "var(--hadesui-blue-6)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
      }}
    >
      {firstChar}
    </motion.div>
  );
};

const TitleSection = () => {
  const { open, needAnimate } = useSidebar();
  return (
    <motion.div
      layout
      style={{
        borderBottom: "1px solid var(--hadesui-border-color)",
      }}
    >
      <Tooltip offset={0} placement="right" tooltip={open ? null : "Hades UI"}>
        <motion.div
          layout
          style={{
            display: "flex",
            justifyContent: open ? "start" : "center",
            alignItems: "center",
            gap: 8,
            padding: 8,
            cursor: "pointer",
          }}
        >
          <Logo />
          {open && (
            <motion.div
              layout
              initial={needAnimate ? { opacity: 0 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.125 }}
            >
              <span style={{ fontSize: 14, fontWeight: 600 }}>Hades UI</span>
            </motion.div>
          )}
        </motion.div>
      </Tooltip>
    </motion.div>
  );
};

const Logo = () => (
  <motion.div
    layout
    style={{
      display: "grid",
      placeContent: "center",
      width: 40,
      height: 40,
      borderRadius: 6,
      background: "var(--hadesui-blue-8)",
    }}
  >
    <svg
      width="24"
      height="24"
      viewBox="0 0 50 39"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z"
        fill="#f8fafc"
      />
      <path
        d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z"
        fill="#f8fafc"
      />
    </svg>
  </motion.div>
);

const ToggleClose = () => {
  const { open, setOpen, needAnimate } = useSidebar();
  const toggle = () => {
    setOpen(open ? false : true);
  };
  return (
    <motion.div
      tabIndex={1}
      layout
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          toggle();
        }
      }}
      onClick={() => {
        toggle();
      }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 8,
        borderTop: "1px solid var(--hadesui-border-color)",
        maxHeight: 36,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <motion.div
        layout
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 20,
          height: 20,
        }}
      >
        <DoubleRightIcon
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </motion.div>
      {open && (
        <motion.span
          layout
          initial={needAnimate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.125 }}
          style={{ fontSize: 12, fontWeight: 500 }}
        >
          Hide
        </motion.span>
      )}
    </motion.div>
  );
};

export default Sidebar;
