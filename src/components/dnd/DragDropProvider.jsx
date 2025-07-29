import React, { useEffect, useRef, useState } from "react";
import { DndContext } from "./DndContext";

function findClosestDragType(target) {
  let el = target;

  while (el) {
    if (
      el.hasAttribute("data-draggable") &&
      el.hasAttribute("data-drag-type")
    ) {
      return { el, type: el.getAttribute("data-drag-type") };
    }
    el = el.parentElement;
  }

  return null;
}

export function DragDropProvider({ children, onDragEnd }) {
  const dragItem = useRef(null);
  const droppables = useRef({});
  const [dragState, setDragState] = useState(null);

  const registerDroppable = (id, ref) => {
    droppables.current[id] = ref;
  };

  const unregisterDroppable = (id) => {
    delete droppables.current[id];
  };

  const handleDragStart = ({ draggableId, droppableId, dragType, data }) => {
    dragItem.current = { draggableId, droppableId, dragType, data };
    setDragState({ draggableId, droppableId, dragType, data });
  };

  const handleDragEnd = (e) => {
    if (!dragItem.current) return;

    const { draggableId, droppableId, dragType, data } = dragItem.current;
    let destination = null;

    for (const [id, ref] of Object.entries(droppables.current)) {
      const rect = ref.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        destination = id;
        break;
      }
    }

    onDragEnd?.({
      draggableId,
      source: droppableId,
      destination,
      dragType,
      data,
    });

    dragItem.current = null;
    setDragState(null);
  };

  useEffect(() => {
    const handlePointerDown = (e) => {
      const dragEl = findClosestDragType(e.target);
      if (!dragEl) return;

      const parent = dragEl.el.parentElement;
      const parentDrag = findClosestDragType(parent);

      if (parentDrag && parentDrag.type !== dragEl.type) {
        e.stopPropagation();
      }
    };

    window.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, []);

  return (
    <DndContext.Provider
      value={{
        registerDroppable,
        unregisterDroppable,
        handleDragStart,
        handleDragEnd,
        currentDrag: dragState,
      }}
    >
      {children}
    </DndContext.Provider>
  );
}
