import React, { useEffect, useId, useRef, useState } from "react";
import { cn } from "../../utils";
import Button from "../Button";
import Dropdown from "../Dropdown";
import EllipsisWithTooltip from "../EllipsisWithTooltip";
import { MoreIcon, PenIcon, PlusIcon, SaveIcon, TrashIcon } from "../Icon";
import "./index.css";

function useOverlayOnce({ targetRef, duration = 1000 }) {
  const overlayRef = useRef(null);
  const timeoutRef = useRef(null);

  function show() {
    const target = targetRef?.current;
    if (!target) return;

    if (overlayRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        overlayRef.current?.remove();
        overlayRef.current = null;
        timeoutRef.current = null;
      }, duration);
      return;
    }

    const overlay = document.createElement("div");
    overlay.className = "custom-overlay";
    Object.assign(overlay.style, {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "var(--hadesui-bg-mark-color)",
      zIndex: 9999,
      pointerEvents: "all",
      cursor: "wait",
      transition: "opacity 0.3s ease",
    });

    target.appendChild(overlay);
    overlayRef.current = overlay;

    timeoutRef.current = setTimeout(() => {
      overlay.remove();
      overlayRef.current = null;
      timeoutRef.current = null;
      target.style.cursor = "auto";
    }, duration);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (overlayRef.current) overlayRef.current.remove();
    };
  }, []);

  return show;
}

function detectLastDragChange(oldData, newData) {
  if (JSON.stringify(oldData) === JSON.stringify(newData)) return null;

  const oldCardIds = oldData.flatMap((col) => col.items.map((c) => c.id));
  const newCardIds = newData.flatMap((col) => col.items.map((c) => c.id));

  const cardAdded = newCardIds.find((id) => !oldCardIds.includes(id));
  const cardRemoved = oldCardIds.find((id) => !newCardIds.includes(id));

  if (cardAdded || cardRemoved) return null;

  const oldColIds = oldData.map((col) => col.id);
  const newColIds = newData.map((col) => col.id);

  const colAdded = newColIds.find((id) => !oldColIds.includes(id));
  const colRemoved = oldColIds.find((id) => !newColIds.includes(id));

  if (colAdded || colRemoved) return null;

  const newColIndex = newData.findIndex((col) => col.isLastDrag);
  if (newColIndex !== -1) {
    const newCol = newData[newColIndex];
    const oldColIndex = oldData.findIndex((col) => col.id === newCol.id);
    if (oldColIndex !== -1 && oldColIndex !== newColIndex) {
      return {
        type: "columnMove",
        data: {
          column: newCol,
          newIndex: newColIndex,
        },
      };
    }
  }

  for (const newCol of newData) {
    const cardIndex = newCol.items.findIndex((c) => c.isLastDrag);
    if (cardIndex !== -1) {
      const card = newCol.items[cardIndex];
      const oldCol = oldData.find((col) =>
        col.items.some((c) => c.id === card.id)
      );
      const oldIndex = oldCol?.items.findIndex((c) => c.id === card.id);

      const oldColId = oldCol?.id;
      const newColId = newCol.id;

      if (oldCol && (oldColId !== newColId || oldIndex !== cardIndex)) {
        return {
          type: "cardMove",
          data: {
            card,
            oldCol,
            targetCol: newCol,
            dropIndex: cardIndex,
          },
        };
      }
    }
  }

  return null;
}
const DragDropTable = ({ old, data, onChange }) => {
  const uuid = useId();
  const [active, setActive] = useState(false);
  const [dragType, setDragType] = useState(null);
  const boardRef = useRef();
  const cardRefs = useRef({});
  const columnRefs = useRef({});
  const ghostRef = useRef(null);
  const dragEnterCounter = useRef(0);

  const showOverlayOnce = useOverlayOnce({
    targetRef: boardRef,
    duration: 1000,
  });

  const diff = detectLastDragChange(old, data);
  console.log("🚀 ~ DragDropTable ~ diff:", diff);

  if (diff) {
    showOverlayOnce();
    if (diff.type === "cardMove") {
      updateCardsWithAnimation({
        card: diff.data.card,
        oldCol: diff.data.oldCol,
        targetCol: diff.data.targetCol,
        dropIndex: diff.data.dropIndex,
      });
    }
    if (diff.type === "columnMove") {
      handleMoveCol({
        column: diff.data.column,
        newIndex: diff.data.newIndex,
      });
    }
  }

  function handleAddCol(col) {
    onChange((prev) => [...prev, col]);
  }

  function handleEditTitleCol(val, col) {
    onChange((prev) =>
      prev.map((c) => (c.id === col.id ? { ...c, title: val } : c))
    );
  }

  function handelEditCardTitle(val, col, card) {
    onChange((prev) =>
      prev.map((c) => {
        if (c.id !== col.id) return c;
        return {
          ...c,
          items: c.items.map((i) =>
            i.id === card.id ? { ...i, title: val } : i
          ),
        };
      })
    );
  }

  function handleDeleteCard(card, col) {
    onChange((prev) =>
      prev.map((column) =>
        column.title === col.title
          ? {
              ...column,
              items: column.items.filter((c) => c.id !== card.id),
            }
          : column
      )
    );
  }

  function handleDeleteCol(col) {
    onChange((prev) => prev.filter((c) => c.id !== col.id));
  }

  function handleMoveCol({ column, newIndex }) {
    const colEl = columnRefs.current[column.id];
    const prevRect = colEl?.getBoundingClientRect();

    onChange((prev) => {
      const next = structuredClone(prev);
      const oldIndex = next.findIndex((col) => col.id === column.id);

      if (
        oldIndex === -1 ||
        oldIndex === newIndex ||
        oldIndex === newIndex - 1
      ) {
        return prev;
      }

      for (const col of next) {
        col.isLastDrag = false;
      }

      const [moved] = next.splice(oldIndex, 1);
      moved.isLastDrag = true;

      const insertAt = oldIndex < newIndex ? newIndex - 1 : newIndex;
      next.splice(insertAt, 0, moved);

      return next;
    });

    if (!colEl) return;
    requestAnimationFrame(() => {
      const newEl = columnRefs.current[column.id];
      if (!newEl) return;
      const newRect = newEl.getBoundingClientRect();
      const dx = prevRect.left - newRect.left;
      const dy = prevRect.top - newRect.top;
      if (dx === 0 && dy === 0) return;
      newEl.style.transform = `translate(${dx}px, ${dy}px)`;
      newEl.style.transition = "transform 0s";
      requestAnimationFrame(() => {
        newEl.style.transition = "transform 300ms ease";
        newEl.style.transform = "";
      });
      newEl.addEventListener(
        "transitionend",
        () => {
          newEl.style.transition = "";
        },
        { once: true }
      );
    });
  }

  function handleColDragStart(e, column) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("column", JSON.stringify(column));
    e.dataTransfer.setData("text/plain", JSON.stringify(column));
    setDragType("column");
    e.dataTransfer.setDragImage(new Image(), 0, 0);
    const el = columnRefs.current[column.id];
    const ghost = el.cloneNode(true);
    ghost.classList.add("drag-ghost-column");
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
    const moveGhost = (ev) => {
      ghost.style.left = `${ev.clientX + 8}px`;
      ghost.style.top = `${ev.clientY + 8}px`;
    };
    document.addEventListener("dragover", moveGhost);
    const cleanup = () => {
      document.removeEventListener("dragover", moveGhost);
      if (ghostRef.current) {
        ghostRef.current.remove();
        ghostRef.current = null;
      }
    };
    document.addEventListener("dragend", cleanup, { once: true });
  }

  function handleDragEnd(e) {
    if (dragType !== "column" || dragType === null) return;
    const newCol = JSON.parse(e.dataTransfer.getData("column") || "{}");
    setActive(false);
    clearHighlights();
    dragEnterCounter.current = 0;
    const indicators = getIndicators();
    const { element } = getNearestHorizontalIndicator(e, indicators);
    const before = element.dataset.before || "-1";
    const dropIndex =
      before === "-1" ? data.length : data.findIndex((c) => c.id === before);
    handleMoveCol({ column: newCol, newIndex: dropIndex });
    setDragType(null);
    e.dataTransfer.clearData();
  }

  function getIndicators() {
    return Array.from(
      document.querySelectorAll(`[data-indicator-board="${uuid}"]`)
    );
  }

  function handleDragOver(e) {
    if (dragType !== "column" || dragType === null) return;
    e.preventDefault();
    highlightIndicator(e);
    setActive(true);
  }

  function handleDragEnter(e) {
    if (dragType !== "column" || dragType === null) return;
    e.preventDefault();
    e.stopPropagation();
    dragEnterCounter.current += 1;
    if (dragEnterCounter.current === 1) {
      setActive(true);
    }
  }

  function handleDragLeave() {
    if (dragType !== "column" || dragType === null) return;
    dragEnterCounter.current -= 1;
    if (dragEnterCounter.current === 0) {
      setActive(false);
      clearHighlights();
    }
  }

  function clearHighlights(els = getIndicators()) {
    return els.forEach((i) => (i.style.opacity = "0"));
  }

  function highlightIndicator(e) {
    const indicators = getIndicators();
    clearHighlights(indicators);
    const { element } = getNearestHorizontalIndicator(e, indicators);
    if (!element) return;
    element.style.opacity = "1";
  }

  function getNearestHorizontalIndicator(e, indicators) {
    const target = e.target;
    const cardElement = target.closest("[data-column-id]");
    const offsetLeft = cardElement?.getBoundingClientRect()?.width / 2 || 128;
    return indicators.reduce(
      (closest, el) => {
        const box = el.getBoundingClientRect();
        const offset = e.clientX - (box.left + offsetLeft);
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: el };
        }
        return closest;
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );
  }

  function updateCardsWithAnimation({ card, oldCol, targetCol, dropIndex }) {
    const cardId = card.id;
    const cardEl = cardRefs.current[cardId];
    const oldColId = oldCol.id;
    const targetColId = targetCol.id;
    const prevRect = cardEl?.getBoundingClientRect();

    onChange((prev) => {
      const next = structuredClone(prev);

      for (const col of next) {
        col.items = col.items.map((item) => ({ ...item, isLastDrag: false }));
      }

      const oldCol = next.find((col) => col.id === oldColId);
      const targetCol = next.find((col) => col.id === targetColId);
      if (!targetCol) return prev;

      let cardToMove = null;

      if (oldCol) {
        const index = oldCol.items.findIndex((c) => c.id === cardId);
        if (index !== -1) {
          [cardToMove] = oldCol.items.splice(index, 1);

          const isSameCol = oldColId === targetColId;
          let adjustedIndex = dropIndex;
          if (isSameCol && index < dropIndex) adjustedIndex = dropIndex - 1;

          if (isSameCol && adjustedIndex === index) return prev;

          const cardWithFlag = { ...cardToMove, isLastDrag: true };
          targetCol.items.splice(adjustedIndex, 0, cardWithFlag);
          return next;
        }
      }

      const alreadyExists = targetCol.items.some((c) => c.id === cardId);
      if (!alreadyExists) {
        const cardWithFlag = { ...card, isLastDrag: true };
        targetCol.items.splice(dropIndex, 0, cardWithFlag);
        return next;
      }

      return prev;
    });

    if (!cardEl) return;
    requestAnimationFrame(() => {
      const newEl = cardRefs.current[cardId];
      if (!newEl) return;
      const newRect = newEl.getBoundingClientRect();
      const dx = prevRect.left - newRect.left;
      const dy = prevRect.top - newRect.top;
      if (dx === 0 && dy === 0) return;
      newEl.style.transform = `translate(${dx}px, ${dy}px)`;
      newEl.style.transition = "transform 0s";
      requestAnimationFrame(() => {
        newEl.style.transition = "transform 300ms ease";
        newEl.style.transform = "";
      });
      newEl.addEventListener(
        "transitionend",
        () => {
          newEl.style.transition = "";
        },
        { once: true }
      );
    });
  }

  return (
    <div className="board-wrapper">
      <div
        ref={(el) => (boardRef.current = el)}
        className={cn("dragdroptable-board", { active: active })}
        onDrop={(e) => {
          e.stopPropagation();
          handleDragEnd(e);
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragEnter={handleDragEnter}
      >
        {data?.map((column, index) => {
          const afterId = index > 0 ? data[index - 1].id : null;
          return (
            <div style={{ display: "flex" }} key={column.id}>
              <DropIndicatorCol
                beforeId={column.id}
                afterId={afterId}
                uuid={uuid}
              />
              <Column
                ref={(el) => {
                  if (el) {
                    columnRefs.current[column.id] = el;
                  } else {
                    delete columnRefs.current[column.id];
                  }
                }}
                key={column.id}
                column={column}
                setCards={updateCardsWithAnimation}
                cardRefs={cardRefs}
                handleColDragStart={handleColDragStart}
                dragType={dragType}
                setDragType={setDragType}
                handleEditTitleCol={handleEditTitleCol}
                handelEditCardTitle={handelEditCardTitle}
                handleDeleteCol={handleDeleteCol}
                handleDeleteCard={handleDeleteCard}
                uuid={uuid}
              />
            </div>
          );
        })}
        <DropIndicatorCol
          beforeId={null}
          afterId={data[data.length - 1]?.id || null}
          uuid={uuid}
        />
        <AddCol onAdd={handleAddCol} />
      </div>
    </div>
  );
};

const Column = React.forwardRef(
  (
    {
      column,
      setCards,
      cardRefs,
      handleColDragStart,
      dragType,
      setDragType,
      handleEditTitleCol,
      handelEditCardTitle,
      handleDeleteCol,
      handleDeleteCard,
      uuid,
    },
    ref
  ) => {
    const [active, setActive] = useState(false);
    const dragEnterCounter = useRef(0);

    function handleDragStart(e, card, oldColumn) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData(
        "text/plain",
        JSON.stringify({ card: card, oldColumn: oldColumn })
      );
      e.dataTransfer.setData("card", JSON.stringify(card));
      e.dataTransfer.setData("oldColumn", JSON.stringify(oldColumn));
      setDragType("card");
    }

    function handleDragEnd(e, targetColumn) {
      if (dragType !== "card" || dragType === null) return;
      const card = JSON.parse(e.dataTransfer.getData("card") || "{}");
      const oldColumn = JSON.parse(e.dataTransfer.getData("oldColumn") || "{}");
      setActive(false);
      clearHighlights();
      dragEnterCounter.current = 0;
      const indicators = getIndicators();
      const { element } = getNearestIndicator(e, indicators);
      const before = element?.dataset.before || "-1";
      const dropIndex =
        before === "-1"
          ? targetColumn.items.length
          : targetColumn.items.findIndex((c) => c.id === before);

      if (!card?.id || !oldColumn?.id || !targetColumn || before === card?.id)
        return;

      setCards({ card, oldCol: oldColumn, targetCol: targetColumn, dropIndex });
      setDragType(null);
      e.dataTransfer.clearData();
    }

    function handleDragEnter(e) {
      if (dragType !== "card" || dragType === null) return;
      e.preventDefault();
      e.stopPropagation();
      dragEnterCounter.current += 1;
      if (dragEnterCounter.current === 1) {
        setActive(true);
      }
    }

    function handleDragLeave() {
      if (dragType !== "card" || dragType === null) return;
      dragEnterCounter.current -= 1;
      if (dragEnterCounter.current === 0) {
        setActive(false);
        clearHighlights();
      }
    }

    function handleDragOver(e) {
      if (dragType !== "card" || dragType === null) return;
      e.preventDefault();
      highlightIndicator(e);
      setActive(true);
    }

    function getIndicators() {
      return Array.from(
        document.querySelectorAll(`[data-column="${column?.id}-${uuid}"]`)
      );
    }

    function clearHighlights(els = getIndicators()) {
      els.forEach((i) => (i.style.opacity = "0"));
    }

    function highlightIndicator(e) {
      const indicators = getIndicators();
      clearHighlights(indicators);
      const { element } = getNearestIndicator(e, indicators);
      if (!element) return;
      element.style.opacity = "1";
    }

    function getNearestIndicator(e, indicators) {
      const target = e.target;
      const cardElement = target.closest("[data-card-id]");
      const offsetTop = cardElement?.getBoundingClientRect()?.height / 2 || 24;
      return indicators.reduce(
        (closest, el) => {
          const box = el.getBoundingClientRect();
          const offset = e.clientY - (box.top + offsetTop);
          if (offset < 0 && offset > closest.offset)
            return { offset, element: el };
          return closest;
        },
        {
          offset: Number.NEGATIVE_INFINITY,
          element: indicators[indicators.length - 1],
        }
      );
    }

    return (
      <div
        ref={ref}
        className={cn("dragdroptable-column", { active: active })}
        data-column-id={column.id}
        draggable
        onDragStart={(e) => handleColDragStart(e, column)}
        onDrop={(e) => handleDragEnd(e, column)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragEnter={handleDragEnter}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
            userSelect: "text",
          }}
        >
          <div className="dragdroptable-count">
            Count {column?.items?.length}
          </div>
        </div>
        <div className="dragdroptable-column-header">
          <div className="dragdroptable-title">
            <FieldEdit
              value={column.title}
              onEdit={(value) => handleEditTitleCol(value, column)}
              row={1}
              menu={[
                {
                  element: (
                    <>
                      <PenIcon /> <span>Edit title</span>
                    </>
                  ),
                },
                {
                  element: (
                    <>
                      <TrashIcon /> <span>Delete column</span>
                    </>
                  ),
                  onClick: () => handleDeleteCol(column),
                },
              ]}
            />
          </div>
        </div>
        {column?.items?.map((item) => (
          <React.Fragment key={item.id}>
            <DropIndicator beforeId={item.id} column={column} uuid={uuid} />
            <Card
              item={item}
              column={column}
              handleDragStart={handleDragStart}
              ref={(el) => {
                if (el) {
                  cardRefs.current[item.id] = el;
                } else {
                  delete cardRefs.current[item.id];
                }
              }}
              handelEditCardTitle={handelEditCardTitle}
              handleDeleteCard={handleDeleteCard}
            />
          </React.Fragment>
        ))}
        <DropIndicator beforeId={null} column={column} uuid={uuid} />
        <AddCard column={column} setCards={setCards} />
      </div>
    );
  }
);

Column.displayName = "Column";

const Card = React.forwardRef(
  (
    { item, handleDragStart, column, handelEditCardTitle, handleDeleteCard },
    ref
  ) => {
    const menuItems = [
      {
        element: (
          <>
            <PenIcon /> <span>Edit card</span>
          </>
        ),
      },
      {
        element: (
          <>
            <TrashIcon /> <span>Delete card</span>
          </>
        ),
        onClick: () => handleDeleteCard(item, column),
      },
    ];

    return (
      <div
        className="dragdroptable-card"
        draggable
        ref={ref}
        onDragStart={(e) => {
          e.stopPropagation();
          handleDragStart(e, item, column);
        }}
        data-card-id={item.id}
        style={{
          userSelect: "text",
        }}
      >
        <FieldEdit
          value={item.title}
          onEdit={(val) => handelEditCardTitle(val, column, item)}
          menu={menuItems}
        />
      </div>
    );
  }
);

Card.displayName = "Card";

const DropIndicator = ({ beforeId, column, uuid }) => {
  const items = column.items;
  let afterId = null;

  if (beforeId === null) {
    afterId = items.length > 0 ? items[items.length - 1].id : null;
  } else {
    const index = items.findIndex((c) => c.id === beforeId);
    afterId = index > 0 ? items[index - 1]?.id : null;
  }

  return (
    <div
      className="dragdroptable-indicator"
      data-before={beforeId ?? "-1"}
      data-after={afterId ?? "-1"}
      data-column={`${column.id}-${uuid}`}
    />
  );
};
const DropIndicatorCol = ({ beforeId, afterId, uuid }) => {
  return (
    <div
      className="dragdroptable-indicator-col"
      data-before={beforeId ?? "-1"}
      data-after={afterId ?? "-1"}
      data-indicator-board={uuid}
    />
  );
};

const AddCol = ({ onAdd }) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd({
      title: text.trim(),
      id: Math.random().toString(),
      items: [],
    });
    setText("");
    setAdding(false);
  };
  return adding ? (
    <form className="dragdroptable-form addcol" onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add column..."
        autoFocus
      />
      <div className="dragdroptable-form-actions">
        <Button type="default" onClick={() => setAdding(false)}>
          Cancel
        </Button>
        <Button>
          <PlusIcon />
          Add
        </Button>
      </div>
    </form>
  ) : (
    <div
      style={{
        width: "16rem",
        flexShrink: 0,
      }}
    >
      <Button
        style={{
          width: "100%",
        }}
        onClick={() => setAdding(true)}
      >
        <PlusIcon />
        Add column
      </Button>
    </div>
  );
};

const AddCard = ({ column, setCards }) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setCards({
      card: { id: Math.random().toString(), title: text.trim() },
      oldCol: column,
      targetCol: column,
      dropIndex: column.items.length,
    });
    setText("");
    setAdding(false);
  };
  return adding ? (
    <form className="dragdroptable-form" onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add card..."
        autoFocus
      />
      <div className="dragdroptable-form-actions">
        <Button type="default" onClick={() => setAdding(false)}>
          Cancel
        </Button>
        <Button>
          <PlusIcon /> Add
        </Button>
      </div>
    </form>
  ) : (
    <div
      style={{
        display: "flex",
        justifyContent: "end",
      }}
    >
      <Button type="text" onClick={() => setAdding(true)}>
        <PlusIcon /> Add card
      </Button>
    </div>
  );
};

const FieldEdit = ({ value, onEdit, menu = [], row = 5 }) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const formRef = useRef(null);
  const textareaRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed && trimmed !== value) {
      onEdit(trimmed);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setText(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editing]);

  const renderControl = () => {
    return (
      <Dropdown
        fixedWidthPopup={false}
        menu={menu.map((m) => {
          const obj = { ...m };
          obj.element = m.element;
          if (!m.onClick || m.type === "edit") {
            obj.onClick = () => setEditing(true);
          }
          return obj;
        })}
      >
        <Button type="icon">
          <MoreIcon direction="vertical" />
        </Button>
      </Dropdown>
    );
  };

  return editing ? (
    <form className="dragdroptable-form" onSubmit={handleSubmit} ref={formRef}>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="dragdroptable-form-actions">
        <Button type="default" onClick={handleCancel}>
          Cancel
        </Button>
        <Button>
          <SaveIcon /> Save
        </Button>
      </div>
    </form>
  ) : (
    <div className="fieldedit-wrapper">
      <EllipsisWithTooltip trigger={"click"} row={row}>
        {value}
      </EllipsisWithTooltip>
      {renderControl()}
    </div>
  );
};

export default DragDropTable;
