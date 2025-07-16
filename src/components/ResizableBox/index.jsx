import React, { useRef } from "react";
import "./index.css";

export default function ResizableBox({
  children,
  minWidth = 100,
  minHeight = 50,
  width = 200,
  height = 100,
}) {
  const boxRef = useRef(null);

  const startResize = (e) => {
    e.preventDefault();

    const box = boxRef.current;
    document.body.style.cursor = "se-resize";
    const rect = box.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;

    const startWidth = rect.width;
    const startHeight = rect.height;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const newWidth = Math.max(minWidth, startWidth + deltaX);
      const newHeight = Math.max(minHeight, startHeight + deltaY);

      box.style.width = `${newWidth}px`;
      box.style.height = `${newHeight}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      className="custom-resizable"
      ref={boxRef}
      style={{
        width: `${width > minWidth ? width : minWidth}px`,
        height: `${height > minHeight ? height : minHeight}px`,
        maxWidth: "100%",
      }}
    >
      {children}
      <div className="resizer" onMouseDown={startResize} />
    </div>
  );
}
