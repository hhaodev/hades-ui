import { useLayoutEffect, useRef, useState } from "react";
import Dropdown from "../Dropdown";

const RightClickMenu = ({ children, style = {}, menu }) => {
  const triggerRef = useRef(null);
  const containerRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [open, setOpen] = useState(false);

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const containerRect = containerRef.current.getBoundingClientRect();

    setCoords({
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top,
    });
    setOpen(true);
  };

  useLayoutEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    Object.assign(el.style, {
      position: "absolute",
      left: `${coords.x}px`,
      top: `${coords.y}px`,
      width: `1px`,
      height: `1px`,
      pointerEvents: "none",
      opacity: 0,
    });
  }, [coords]);

  return (
    <div
      ref={containerRef}
      onContextMenu={handleContextMenu}
      style={{
        position: "relative",
      }}
    >
      <div style={style}>{children}</div>
      <Dropdown open={open} onOpenChange={setOpen} menu={menu}>
        <div ref={triggerRef} />
      </Dropdown>
    </div>
  );
};

export default RightClickMenu;
