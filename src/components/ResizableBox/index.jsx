import React, { useRef } from "react";
import "./index.css";

export default function ResizableBox({
  children,
  minWidth = 100,
  minHeight = 50,
  width = 200,
  height = 100,
  mode = "both", // "horizontal" | "vertical" | "both"
}) {
  const boxRef = useRef(null);

  const startResize = (e) => {
    e.preventDefault();
    const box = boxRef.current;
    if (!box) return;

    const rect = box.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = rect.width;
    const startHeight = rect.height;

    document.body.style.cursor =
      mode === "horizontal"
        ? "e-resize"
        : mode === "vertical"
        ? "s-resize"
        : "se-resize";

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      if (mode === "horizontal" || mode === "both") {
        const newWidth = Math.max(minWidth, startWidth + deltaX);
        box.style.width = `${newWidth}px`;
      }

      if (mode === "vertical" || mode === "both") {
        const newHeight = Math.max(minHeight, startHeight + deltaY);
        box.style.height = `${newHeight}px`;
      }
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
        width: `${Math.max(width, minWidth)}px`,
        height: `${Math.max(height, minHeight)}px`,
        maxWidth: "100%",
      }}
    >
      {children}
      <div className={`resizer-${mode}`} onMouseDown={startResize} />
    </div>
  );
}
