import { motion } from "framer-motion";
import { useRef, useState } from "react";
import Ellipsis from "../Ellipsis";
import { DoubleRightIcon } from "../Icon";
import Tooltip from "../Tooltip";

const Sidebar = ({ items = [], defaultSelectedKey = "" }) => {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState(defaultSelectedKey ?? items[0]?.key);

  const needAnimate = useRef(false);

  return (
    <motion.nav
      layout
      style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        flexShrink: 0,
        width: open ? 220 : "fit-content",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
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

const Option = ({ item, selected, setSelected, open, needAnimate }) => {
  const handleClick = (e) => {
    if (item.onClick) item.onClick(e);
    setSelected(item.key);
  };
  return (
    <motion.div
      layout
      onClick={() => handleClick()}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: open ? "start" : "center",
        height: 40,
        minHeight: 40,
        width: "100%",
        borderRadius: 8,
        background:
          selected === item.key
            ? "var(--hadesui-bg-selected-color)"
            : "transparent",
        cursor: "pointer",
        padding: "0 8px",
        gap: 6,
        fontSize: 14,
        transition: "background 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (selected === item.key) return;
        e.currentTarget.style.background = "var(--hadesui-bg-selected-color)";
      }}
      onMouseLeave={(e) => {
        if (selected === item.key) return;
        e.currentTarget.style.background = "transparent";
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -7,
          top: 0,
          bottom: 0,
          minWidth: 3,
          borderRadius: 2,
          background: "var(--hadesui-blue-6)",
          opacity: selected === item.key ? 1 : 0,
          transition: "opacity 0.2s ease",
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
        <>
          {needAnimate ? (
            <motion.span
              layout
              initial={{ opacity: 0, x: -15 }}
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
          ) : (
            <span
              style={{
                maxWidth: `calc(100% - ${item.notifs ? "60px" : "44px"})`,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Ellipsis>{item.title}</Ellipsis>
            </span>
          )}
        </>
      )}
      {item.notifs && open && (
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
            background: "var(--hadesui-blue-6)",
            color: "#fff",
            fontSize: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {item.notifs}
        </motion.span>
      )}
    </motion.div>
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
          <>
            {needAnimate ? (
              <motion.div
                layout
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.125 }}
              >
                <span style={{ fontSize: 14, fontWeight: 600 }}>Hades UI</span>
              </motion.div>
            ) : (
              <div>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Hades UI</span>
              </div>
            )}
          </>
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
      height="auto"
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
          {needAnimate.current ? (
            <motion.span
              layout
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.125 }}
              style={{ fontSize: 12, fontWeight: 500 }}
            >
              Hide
            </motion.span>
          ) : (
            <div style={{ fontSize: 12, fontWeight: 500 }}>Hide</div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default Sidebar;
