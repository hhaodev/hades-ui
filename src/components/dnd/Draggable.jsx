import React, { useRef, useEffect, useState } from "react";
import { useDndContext } from "./DndContext";
import { motion, useAnimation } from "framer-motion";

export function Draggable({
  draggableId,
  droppableId,
  dragType,
  data,
  children,
}) {
  const { handleDragStart, handleDragEnd } = useDndContext();
  const ref = useRef(null);
  const controls = useAnimation();
  const [isDragging, setIsDragging] = useState(false);
  const [origin, setOrigin] = useState(null);
  const moveGhostRef = useRef(null);

  const onMouseDown = (e) => {
    if (!ref.current) return;

    const startX = e.clientX;
    const startY = e.clientY;
    let moved = false;

    const onMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (!moved && distance > 5) {
        moved = true;
        moveEvent.stopPropagation();

        const rect = ref.current.getBoundingClientRect();
        setOrigin(rect);
        setIsDragging(true);
        handleDragStart({ draggableId, droppableId, dragType, data });

        const ghost = document.createElement("div");
        ghost.id = "dnd-ghost";
        ghost.style.position = "fixed";
        ghost.style.pointerEvents = "none";
        ghost.style.zIndex = "9999";
        ghost.style.width = rect.width + "px";
        ghost.style.height = rect.height + "px";
        ghost.style.left = moveEvent.clientX + "px";
        ghost.style.top = moveEvent.clientY + "px";
        ghost.style.background = "rgba(71, 71, 71, 0.5)";
        document.body.appendChild(ghost);

        moveGhostRef.current = ghost;
      }

      if (moved && moveGhostRef.current) {
        moveGhostRef.current.style.left = moveEvent.clientX + "px";
        moveGhostRef.current.style.top = moveEvent.clientY + "px";
      }
    };

    const onMouseUp = (upEvent) => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      if (moveGhostRef.current) {
        moveGhostRef.current.remove();
        moveGhostRef.current = null;
      }

      if (moved) {
        handleDragEnd(upEvent);
        setIsDragging(false);
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  useEffect(() => {
    if (!origin || !ref.current || !isDragging) return;

    const rect = ref.current.getBoundingClientRect();
    const dx = origin.left - rect.left;
    const dy = origin.top - rect.top;

    controls.set({ x: dx, y: dy });
    controls.start({ x: 0, y: 0, transition: { duration: 0.2 } });
  }, [origin, isDragging]);

  return (
    <motion.div
      ref={ref}
      onMouseDown={(e) => {
        e.stopPropagation();
        onMouseDown(e);
      }}
      animate={controls}
      layout
      style={{
        cursor: "grab",
        userSelect: "none",
      }}
      data-draggable
      data-drag-type={dragType}
    >
      {children}
    </motion.div>
  );
}
