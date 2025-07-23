import { motion } from "framer-motion";
import React, {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { cn } from "../../utils";
import Button from "../Button";
import Dropdown from "../Dropdown";
import Ellipsis from "../Ellipsis";
import {
  CopyIcon,
  MoreIcon,
  PenIcon,
  PlusIcon,
  SaveIcon,
  TrashIcon,
} from "../Icon";
import "./index.css";

const DragDropTable = ({ data = [], onChange }) => {
  const uuid = useId();
  const [active, setActive] = useState(false);
  const dragType = useRef(null);
  const boardRef = useRef();
  const cardRefs = useRef({});
  const columnRefs = useRef({});
  const ghostRef = useRef(null);
  const dragEnterCounter = useRef(0);
  const dragColRef = useRef(null);

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

  function handleMoveCol({ newIndex }) {
    const dragInfo = dragColRef.current;
    if (!dragInfo) return;

    const { oldIndex, column } = dragInfo;
    if (oldIndex === -1 || oldIndex === newIndex) return;

    const next = [...data];

    const [moved] = next.splice(oldIndex, 1);

    const adjustedIndex = oldIndex < newIndex ? newIndex - 1 : newIndex;

    next.splice(adjustedIndex, 0, moved);

    onChange(next, {
      type: "moveColumn",
      colId: column.id,
      fromIndex: oldIndex,
      toIndex: newIndex,
    });
    dragColRef.current = null;
  }

  function handleColDragStart(e, column) {
    setTimeout(() => boardRef?.current?.classList.remove("overlay-active"), 10);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("column", JSON.stringify(column));
    // e.dataTransfer.setData("text/plain", JSON.stringify(column));
    dragType.current = "column";
    const oldIndex = data.findIndex((col) => col.id === column.id);
    dragColRef.current = { column, oldIndex };
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
    if (dragType.current !== "column" || dragType.current === null) return;
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
    dragType.current = null;
    e.dataTransfer.clearData();
  }

  function getIndicators() {
    return Array.from(
      document.querySelectorAll(`[data-indicator-board="${uuid}"]`)
    );
  }

  function handleDragOver(e) {
    if (dragType.current !== "column" || dragType.current === null) return;
    e.preventDefault();
    highlightIndicator(e);
    setActive(true);
  }

  function handleDragEnter(e) {
    if (dragType.current !== "column" || dragType.current === null) return;
    e.preventDefault();
    e.stopPropagation();
    dragEnterCounter.current += 1;
    if (dragEnterCounter.current === 1) {
      setActive(true);
    }
  }

  function handleDragLeave() {
    if (dragType.current !== "column" || dragType.current === null) return;
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

  function handleCopyCard(card, column) {
    updateCard({
      card: {
        id: Math.random().toString(),
        title: `${card.title.trim()}-copy`,
      },
      oldCol: column,
      targetCol: column,
      dropIndex: column.items.length,
    });
  }

  function updateCard({ card, oldCol, targetCol, dropIndex }) {
    const cardId = card.id;
    const oldColId = oldCol.id;
    const targetColId = targetCol.id;

    const next = structuredClone(data);

    const fromCol = next.find((col) => col.id === oldColId);
    const toCol = next.find((col) => col.id === targetColId);
    if (!toCol) return;

    let cardToMove = null;

    if (fromCol) {
      const oldIndex = fromCol.items.findIndex((c) => c.id === cardId);
      if (oldIndex !== -1) {
        [cardToMove] = fromCol.items.splice(oldIndex, 1);

        const isSameCol = oldColId === targetColId;
        let adjustedIndex = dropIndex;
        if (isSameCol && oldIndex < dropIndex) adjustedIndex = dropIndex - 1;

        if (isSameCol && adjustedIndex === oldIndex) return;

        toCol.items.splice(adjustedIndex, 0, cardToMove);
        const diffInfo = {
          type: "moveCard",
          cardId,
          fromColId: oldColId,
          toColId: targetColId,
          fromIndex: oldIndex,
          toIndex: adjustedIndex,
        };
        onChange(next, diffInfo);
        return;
      }
    }

    const alreadyExists = toCol.items.some((c) => c.id === cardId);
    if (!alreadyExists) {
      toCol.items.splice(dropIndex, 0, card);
      const diffInfo = {
        type: "moveCard",
        cardId,
        fromColId: oldColId,
        toColId: targetColId,
        fromIndex: -1,
        toIndex: dropIndex,
      };
      onChange(next, diffInfo);
    }
  }

  return (
    <motion.div
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
              setCards={updateCard}
              cardRefs={cardRefs}
              handleColDragStart={handleColDragStart}
              dragType={dragType}
              handleEditTitleCol={handleEditTitleCol}
              handelEditCardTitle={handelEditCardTitle}
              handleDeleteCol={handleDeleteCol}
              handleDeleteCard={handleDeleteCard}
              handleCopyCard={handleCopyCard}
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
    </motion.div>
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
      handleEditTitleCol,
      handelEditCardTitle,
      handleDeleteCol,
      handleDeleteCard,
      handleCopyCard,
      uuid,
    },
    ref
  ) => {
    const [active, setActive] = useState(false);
    const dragEnterCounter = useRef(0);
    const addCardRef = useRef(null);

    function handleDragStart(e, card, oldColumn) {
      e.dataTransfer.effectAllowed = "move";
      // e.dataTransfer.setData(
      //   "text/plain",
      //   JSON.stringify({ card: card, oldColumn: oldColumn })
      // );
      e.dataTransfer.setData("card", JSON.stringify(card));
      e.dataTransfer.setData("oldColumn", JSON.stringify(oldColumn));
      dragType.current = "card";
    }

    function handleDragEnd(e, targetColumn) {
      if (dragType.current !== "card" || dragType.current === null) return;
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
      dragType.current = null;
      e.dataTransfer.clearData();
    }

    function handleDragEnter(e) {
      if (dragType.current !== "card" || dragType.current === null) return;
      e.preventDefault();
      e.stopPropagation();
      dragEnterCounter.current += 1;
      if (dragEnterCounter.current === 1) {
        setActive(true);
      }
    }

    function handleDragLeave() {
      if (dragType.current !== "card" || dragType.current === null) return;
      dragEnterCounter.current -= 1;
      if (dragEnterCounter.current === 0) {
        setActive(false);
        clearHighlights();
      }
    }

    function handleDragOver(e) {
      if (dragType.current !== "card" || dragType.current === null) return;
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
      <motion.div
        layout
        layoutId={column.id}
        ref={ref}
        className={cn("dragdroptable-column", { active: active })}
        data-column-id={column.id}
        draggable="true"
        onDragStart={(e) => {
          e.stopPropagation();
          handleColDragStart(e, column);
        }}
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
            <ActionField
              value={column.title}
              onEdit={(value) => handleEditTitleCol(value, column)}
              row={1}
              action={[
                {
                  element: (
                    <>
                      <PenIcon /> <span>Edit</span>
                    </>
                  ),
                },
                {
                  element: (
                    <>
                      <PlusIcon /> <span>Add card</span>
                    </>
                  ),
                  onClick: () => addCardRef.current.open(),
                },
                {
                  element: (
                    <>
                      <TrashIcon /> <span>Delete</span>
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
              handleCopyCard={handleCopyCard}
            />
          </React.Fragment>
        ))}
        <DropIndicator beforeId={null} column={column} uuid={uuid} />
        <AddCard ref={addCardRef} column={column} setCards={setCards} />
      </motion.div>
    );
  }
);

Column.displayName = "Column";

const Card = React.forwardRef(
  (
    {
      item,
      handleDragStart,
      column,
      handelEditCardTitle,
      handleDeleteCard,
      handleCopyCard,
    },
    ref
  ) => {
    const menuItems = [
      {
        element: (
          <>
            <PenIcon /> <span>Edit</span>
          </>
        ),
      },
      {
        element: (
          <>
            <CopyIcon /> <span>Copy</span>
          </>
        ),
        onClick: () => handleCopyCard(item, column),
      },
      {
        element: (
          <>
            <TrashIcon /> <span>Delete</span>
          </>
        ),
        onClick: () => handleDeleteCard(item, column),
      },
    ];

    return (
      <motion.div
        onClick={() => {
          console.log("click");
        }}
        key={item.id}
        layout
        layoutId={item.id}
        className="dragdroptable-card"
        draggable="true"
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
        <ActionField
          value={item.title}
          onEdit={(val) => handelEditCardTitle(val, column, item)}
          action={menuItems}
        />
      </motion.div>
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
    <motion.form
      layout
      className="dragdroptable-form addcol"
      onSubmit={handleSubmit}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add column..."
        autoFocus
      />
      <div className="dragdroptable-form-actions">
        <Button
          type="default"
          onClick={() => {
            setAdding(false);
            setText("");
          }}
        >
          Cancel
        </Button>
        <Button>
          <PlusIcon />
          Add
        </Button>
      </div>
    </motion.form>
  ) : (
    <motion.div
      layout
      style={{
        width: "16rem",
        flexShrink: 0,
      }}
    >
      <Button
        type="dashed"
        style={{
          width: "100%",
        }}
        onClick={() => setAdding(true)}
      >
        <PlusIcon />
        Add column
      </Button>
    </motion.div>
  );
};

const AddCard = React.forwardRef(({ column, setCards }, ref) => {
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
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setAdding(false);
      setText("");
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  const handleClose = () => {
    setAdding(false);
    setText("");
  };
  const handleOpen = () => {
    setAdding(true);
  };
  useImperativeHandle(ref, () => ({
    close: handleClose,
    open: handleOpen,
    submit: handleSubmit,
  }));
  return adding ? (
    <motion.form layout className="dragdroptable-form" onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add card..."
        autoFocus
        onKeyDown={handleKeyDown}
      />
      <div className="dragdroptable-form-actions">
        <Button theme="default" onClick={handleClose}>
          Cancel
        </Button>
        <Button>
          <PlusIcon /> Add
        </Button>
      </div>
    </motion.form>
  ) : (
    <motion.div
      layout
      style={{
        display: "flex",
        justifyContent: "end",
      }}
    >
      <Button theme="text" onClick={handleOpen}>
        <PlusIcon /> Add card
      </Button>
    </motion.div>
  );
});

AddCard.displayName = "AddCard";

const ActionField = ({ value, onEdit, action = [], row = 5 }) => {
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
        menu={action.map((m) => {
          const obj = { ...m };
          obj.element = m.element;
          if (!m.onClick || m.type === "edit") {
            obj.onClick = () => setEditing(true);
          }
          return obj;
        })}
      >
        <Button theme="icon">
          <MoreIcon direction="vertical" />
        </Button>
      </Dropdown>
    );
  };

  return editing ? (
    <motion.form
      layout
      className="dragdroptable-form"
      onSubmit={handleSubmit}
      ref={formRef}
      onClick={(e) => e.stopPropagation()}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="dragdroptable-form-actions">
        <Button theme="default" onClick={handleCancel}>
          Cancel
        </Button>
        <Button>
          <SaveIcon /> Save
        </Button>
      </div>
    </motion.form>
  ) : (
    <motion.div layout className="fieldedit-wrapper">
      <Ellipsis row={row}>{value}</Ellipsis>
      {renderControl()}
    </motion.div>
  );
};

export default DragDropTable;
