import React, { useRef, useEffect, useState } from "react";
import { useDndContext } from "./DndContext";

export function Droppable({ droppableId, acceptType, children }) {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const { registerDroppable, unregisterDroppable, currentDrag } =
    useDndContext();

  useEffect(() => {
    if (ref.current) registerDroppable(droppableId, ref.current);
    return () => unregisterDroppable(droppableId);
  }, [droppableId]);

  useEffect(() => {
    const handleMove = (e) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      setIsHovered(inside);
    };

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  const isActive =
    currentDrag &&
    (Array.isArray(acceptType)
      ? acceptType.includes(currentDrag.dragType)
      : currentDrag.dragType === acceptType) &&
    isHovered;

  return (
    <div
      ref={ref}
      data-droppable-id={droppableId}
      style={{
        background: isActive ? "#475358ff" : "#303030ff",
        transition: "background 0.2s",
        minHeight: 100,
        padding: 8,
      }}
    >
      {children}
    </div>
  );
}
