import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import Ellipsis from "../Ellipsis";
import { DoubleRightIcon, DownIcon, UpIcon } from "../Icon";
import Tooltip from "../Tooltip";
import { useMergedState } from "../../utils";

const Sidebar = ({ items = [], defaultSelectedKey, selectedKey }) => {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useMergedState(items[0]?.key, {
    value: selectedKey,
    defaultValue: defaultSelectedKey,
  });

  const needAnimate = useRef(false);

  return (
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
        <TitleSection open={open} needAnimate={needAnimate.current} />
        <div
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
            <Tooltip
              placement="right"
              key={item.key}
              tooltip={!open ? item.title : null}
            >
              <div>
                <Option
                  item={item}
                  selected={selected}
                  setSelected={setSelected}
                  open={open}
                  needAnimate={needAnimate.current}
                />
              </div>
            </Tooltip>
          ))}
        </div>
      </div>
      <ToggleClose open={open} setOpen={setOpen} needAnimate={needAnimate} />
    </motion.nav>
  );
};

const Option = ({
  item,
  selected,
  setSelected,
  open,
  needAnimate,
  level = 0,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [hovered, setHovered] = useState(false);
  const isActive = selected === item.key;

  const handleClick = (e) => {
    if (item.children) {
      if (!open) return;
      setExpanded((prev) => !prev);
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
          width: `calc(100% - ${level * 12}px)`,
          marginLeft: open ? level * 12 : 0,
          borderRadius: 8,
          background:
            isActive || hovered
              ? "var(--hadesui-bg-selected-color)"
              : "var(--hadesui-bg-color)",
          cursor: "pointer",
          padding: "0 8px",
          gap: 6,
          fontSize: 14,
          color: isActive ? "var(--hadesui-blue-6)" : undefined,
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
            opacity: isActive || hovered ? 1 : 0,
            height: isActive ? "100%" : hovered ? 10 : 0,
            top: isActive ? 0 : "50%",
            transform: isActive ? "none" : "translateY(-50%)",
          }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute",
            left: -(7 + level * 12),
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
          <item.icon />
        </motion.div>
        {open && (
          <motion.span
            layout
            initial={needAnimate ? { opacity: 0, x: -15 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.125 }}
            style={{
              maxWidth: `calc(100% - ${item.notifs ? "60px" : "44px"})`,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Ellipsis>{item.title}</Ellipsis>
          </motion.span>
        )}
        {item.children && open && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
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
            {expanded ? <UpIcon /> : <DownIcon />}
          </motion.span>
        )}
      </motion.div>
      {/* Children */}
      {item.children && open && (
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="submenu"
              layout
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                marginTop: 4,
              }}
            >
              {item.children.map((child) => (
                <Option
                  key={child.key}
                  item={child}
                  selected={selected}
                  setSelected={setSelected}
                  open={open}
                  needAnimate={needAnimate}
                  level={level + 1}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
};

const TitleSection = ({ open, needAnimate }) => {
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

const ToggleClose = ({ open, setOpen, needAnimate }) => {
  return (
    <motion.div
      layout
      onClick={() => {
        setOpen((pv) => !pv);
        needAnimate.current = true;
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
        <>
          <motion.span
            layout
            initial={needAnimate.current ? { opacity: 0, x: -15 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.125 }}
            style={{ fontSize: 12, fontWeight: 500 }}
          >
            Hide
          </motion.span>
        </>
      )}
    </motion.div>
  );
};

export default Sidebar;
