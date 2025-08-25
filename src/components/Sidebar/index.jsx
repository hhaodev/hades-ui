import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import Ellipsis from "../Ellipsis";
import { DoubleRightIcon, DownIcon, RightIcon, UpIcon } from "../Icon";
import Tooltip from "../Tooltip";
import { useMergedState } from "../../utils";

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

const Sidebar = ({
  items = [],
  defaultSelectedKey,
  selectedKey,
  expandedItems: expandedProps,
  treeLine = false,
}) => {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useMergedState(items[0]?.key, {
    value: selectedKey,
    defaultValue: defaultSelectedKey,
  });
  const [needAnimate, setNeedAnimate] = useState(false);
  const [expandedItems, setExpandedItems] = useMergedState(expandedProps);
  const dropdownRef = useRef();
  const navRef = useRef();

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        selected,
        setSelected,
        needAnimate,
        setNeedAnimate,
        expandedItems,
        setExpandedItems,
        treeLine,
        dropdownRef,
        navRef,
      }}
    >
      <motion.nav
        layout
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          flexShrink: 0,
          width: open ? 220 : 60,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "var(--hadesui-bg-color)",
        }}
      >
        <div>
          <TitleSection />
          <div
            ref={navRef}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              padding: "8px 0px 8px 8px",
              scrollbarGutter: "stable",
              maxHeight: "calc(100vh - 92px - 2px)",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.overflowY = "auto";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.overflow = "hidden";
            }}
          >
            {items.map((item) => (
              <Render key={item.key} item={item} />
            ))}
          </div>
        </div>
        <ToggleClose />
      </motion.nav>
    </SidebarContext.Provider>
  );
};

const Render = ({ item }) => {
  const { selected, open, dropdownRef } = useSidebar();
  const [hovered, setHovered] = useState(false);
  const isActive = selected === item.key;
  const isChildActive = item.children
    ? item.children.some((child) => {
        if (child.children) {
          return checkChildActive(child, selected);
        }
        return child.key === selected;
      })
    : false;

  return (
    <motion.div layout>
      {open ? (
        <Option item={item} />
      ) : item.children && item.children.length > 0 ? (
        <motion.div
          layout
          style={{
            position: "relative",
          }}
        >
          <motion.div
            initial={false}
            animate={{
              opacity: isActive || hovered || isChildActive ? 1 : 0,
              height: isActive || isChildActive ? "100%" : hovered ? 10 : 0,
              top: isActive || isChildActive ? 0 : "50%",
              transform:
                isActive || isChildActive ? "none" : "translateY(-50%)",
            }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              left: -7,
              minWidth: 3,
              borderRadius: 2,
              background: "var(--hadesui-blue-6)",
            }}
          />
          <Dropdown
            ref={dropdownRef}
            fixedWidthPopup={false}
            trigger={["hover"]}
            placement="right-start"
            menu={() => {
              return <RenderInDropdown items={item.children} />;
            }}
          >
            <motion.div
              layout
              style={{
                display: "grid",
                placeContent: "center",
                width: 40,
                minHeight: 40,
                cursor: "pointer",
                borderRadius: 8,
                transition: "background 0.2s ease",
                background:
                  isActive || hovered || isChildActive
                    ? "var(--hadesui-bg-selected-color)"
                    : "var(--hadesui-bg-color)",
                color:
                  isActive || isChildActive
                    ? "var(--hadesui-blue-6)"
                    : undefined,
              }}
              onMouseEnter={() => {
                setHovered(true);
              }}
              onMouseLeave={() => {
                setHovered(false);
              }}
            >
              <motion.div
                layout
                style={{
                  display: "grid",
                  placeContent: "center",
                  width: 20,
                  height: "100%",
                  color:
                    isActive || isChildActive
                      ? "var(--hadesui-blue-6)"
                      : undefined,
                }}
              >
                {item.icon ? (
                  <item.icon />
                ) : (
                  <TitleInitial title={item.title} />
                )}
              </motion.div>
            </motion.div>
          </Dropdown>
        </motion.div>
      ) : (
        <Tooltip placement="right" key={item.key} tooltip={item.title}>
          <motion.div layout>
            <Option item={item} />
          </motion.div>
        </Tooltip>
      )}
    </motion.div>
  );
};

const RenderInDropdown = ({ items }) => {
  return (
    <Dropdown.Menu>
      {items.map((item) => (
        <OptionDropDown key={item.key} item={item} />
      ))}
    </Dropdown.Menu>
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
        layout
        key={item.key}
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          height: 40,
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
      menu={() => <RenderInDropdown items={item.children} />}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          height: 40,
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
          layout
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.125 }}
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
          initial={false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.125 }}
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
      </div>
    </Dropdown>
  );
};

const Option = ({ item, level = 0 }) => {
  const {
    open,
    selected,
    setSelected,
    needAnimate,
    expandedItems,
    setExpandedItems,
    treeLine,
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

  const handleClick = (e) => {
    if (item.children) {
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
    <>
      <motion.div
        layout
        onClick={handleClick}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "start" : "center",
          height: 40,
          minHeight: 40,
          maxHeight: 40,
          width: "100%",
          borderRadius: 8,
          background:
            isActive || hovered
              ? "var(--hadesui-bg-selected-color)"
              : "var(--hadesui-bg-color)",
          cursor: "pointer",
          padding: "0 8px",
          gap: 6,
          fontSize: 14,
          color:
            isActive || isChildActive ? "var(--hadesui-blue-6)" : undefined,
          transition: "background 0.2s ease, color 0.2s ease",
        }}
        onMouseEnter={() => {
          setHovered(true);
        }}
        onMouseLeave={() => {
          setHovered(false);
        }}
      >
        <motion.div
          initial={false}
          animate={{
            opacity: isActive || hovered || isChildActive ? 1 : 0,
            height: isActive ? "100%" : isChildActive ? 3 : hovered ? 10 : 0,
            top: isActive ? 0 : "50%",
            transform: isActive ? "none" : "translateY(-50%)",
          }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute",
            left: -(7 + level * (treeLine ? 18 : 15)),
            minWidth: 3,
            borderRadius: 2,
            background: "var(--hadesui-blue-6)",
          }}
        />
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
        {open && (
          <motion.span
            layout
            initial={
              needAnimate && level === 0 ? { opacity: 0, x: -15 } : false
            }
            animate={{ opacity: 1, x: 0 }}
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
            initial={
              needAnimate && level === 0 ? { scale: 0, opacity: 0 } : false
            }
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
            {isExpanded ? <UpIcon /> : <DownIcon />}
          </motion.span>
        )}
      </motion.div>
      {item.children && item.children.length > 0 && open && (
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="submenu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.1 }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                marginLeft: 15,
                ...(treeLine && {
                  borderLeft: "1px solid var(--hadesui-border-color)",
                  paddingLeft: 2,
                }),
              }}
            >
              {item.children.map((child) => (
                <Option key={child.key} item={child} level={level + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
};

const TitleInitial = ({ title }) => {
  if (!title) return null;

  const firstChar = title.charAt(0).toUpperCase();

  return (
    <div
      style={{
        width: 20,
        height: 20,
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
    </div>
  );
};

const TitleSection = () => {
  const { open, needAnimate } = useSidebar();
  return (
    <div
      style={{
        borderBottom: "1px solid var(--hadesui-border-color)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: open ? "start" : "center",
          alignItems: "center",
          gap: 8,
          padding: 8,
        }}
      >
        <Logo />
        {open && (
          <motion.div
            layout
            initial={needAnimate ? { opacity: 0, x: -15 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.125 }}
          >
            <span style={{ fontSize: 14, fontWeight: 600 }}>Hades UI</span>
          </motion.div>
        )}
      </div>
    </div>
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
  const { open, setOpen, needAnimate, setNeedAnimate } = useSidebar();
  return (
    <motion.div
      layout
      onClick={() => {
        setOpen((pv) => !pv);
        if (!needAnimate) {
          setNeedAnimate(true);
        }
      }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 8,
        borderTop: "1px solid var(--hadesui-border-color)",
        maxHeight: 36,
        cursor: "pointer",
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
          initial={needAnimate ? { opacity: 0, x: -15 } : false}
          animate={{ opacity: 1, x: 0 }}
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
