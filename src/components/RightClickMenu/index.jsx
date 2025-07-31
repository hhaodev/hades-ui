import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Dropdown from "../Dropdown";

const RightClickMenu = ({ children, style = {}, menu }) => {
  const triggerRef = useRef(null);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const containerRect = containerRef.current.getBoundingClientRect();

    setCoords({
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top,
    });

    dropdownRef.current.show();
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

  useEffect(() => {
    const handleClick = (e) => {
      if (!containerRef.current.contains(e.target)) {
        dropdownRef.current.hide();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        dropdownRef.current.hide();
      }}
      onContextMenu={handleContextMenu}
      style={{
        position: "relative",
      }}
    >
      <div style={style}>{children}</div>
      <Dropdown ref={dropdownRef} useClickOutSide={false} menu={menu}>
        <div ref={triggerRef} />
      </Dropdown>
    </div>
  );
};

export default RightClickMenu;
