import React, { useEffect, useRef, useState } from "react";
import "./index.css";
import EllipsisWithTooltip from "../EllipsisWithTooltip";
import Button from "../Button";
import { MoreIcon, PenIcon, PlusIcon, SaveIcon, TrashIcon } from "../Icon";
import Dropdown from "../Dropdown";

const useStorage = (key, data, setData) => {
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      setData(JSON.parse(saved));
    } else {
      setData(DEFAULT_CARDS);
    }
  }, []);
  useEffect(() => {
    if (data) localStorage.setItem(key, JSON.stringify(data));
  }, [data, key]);
};

const DragDropTable = () => {
  return <Board />;
};

const Board = () => {
  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [active, setActive] = useState(false);
  const [dragType, setDragType] = useState(null);
  const cardRefs = useRef({});
  const columnRefs = useRef({});
  const ghostRef = useRef(null);

  useStorage("board", cards, setCards);

  const handleAddCol = (col) => {
    setCards((prev) => [...prev, col]);
  };

  const handleEditTitleCol = (val, col) => {
    setCards((prev) =>
      prev.map((c) => (c.id === col.id ? { ...c, title: val } : c))
    );
  };

  const handelEditCardTitle = (val, col, card) => {
    setCards((prev) =>
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
  };

  const handleDeleteCard = (card, col) => {
    setCards((prev) =>
      prev.map((column) =>
        column.title === col.title
          ? {
              ...column,
              items: column.items.filter((c) => c.id !== card.id),
            }
          : column
      )
    );
  };

  const handleDeleteCol = (col) => {
    setCards((prev) => prev.filter((c) => c.id !== col.id));
  };

  const handleMoveCol = (column, newIndex) => {
    const colEl = columnRefs.current[column.id];
    const prevRect = colEl?.getBoundingClientRect();
    setCards((prev) => {
      const next = structuredClone(prev);
      const oldIndex = next.findIndex((col) => col.id === column.id);

      if (
        oldIndex === -1 ||
        oldIndex === newIndex ||
        oldIndex === newIndex - 1
      ) {
        return prev;
      }

      const [moved] = next.splice(oldIndex, 1);
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
  };

  const handleColDragStart = (e, column) => {
    e.dataTransfer.setData("column", JSON.stringify(column));
    setDragType("column");
    e.dataTransfer.setData("column", JSON.stringify(column));
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
  };

  const handleDragEnd = (e) => {
    const newCol = JSON.parse(e.dataTransfer.getData("column") || "{}");
    setActive(false);
    clearHighlights();
    const indicators = getIndicators();
    const { element } = getNearestHorizontalIndicator(e, indicators);
    const before = element.dataset.before || "-1";
    const dropIndex =
      before === "-1" ? cards.length : cards.findIndex((c) => c.id === before);
    handleMoveCol(newCol, dropIndex);
    setDragType(null);
  };

  const getIndicators = () => {
    return Array.from(
      document.querySelectorAll(`[data-indicator-board="true"]`)
    );
  };

  const handleDragOver = (e) => {
    if (dragType !== "column") return;
    e.preventDefault();
    highlightIndicator(e);
    setActive(true);
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  const clearHighlights = (els = getIndicators()) => {
    return els.forEach((i) => (i.style.opacity = "0"));
  };

  const highlightIndicator = (e) => {
    const indicators = getIndicators();
    clearHighlights(indicators);
    const { element } = getNearestHorizontalIndicator(e, indicators);
    element.style.opacity = "1";
  };

  const getNearestHorizontalIndicator = (e, indicators) => {
    const offsetLeft = 50;
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
  };

  const updateCardsWithAnimation = (card, oldCol, targetCol, dropIndex) => {
    const cardId = card.id;
    const cardEl = cardRefs.current[cardId];
    const oldColId = oldCol.id;
    const targetColId = targetCol.id;
    const prevRect = cardEl?.getBoundingClientRect();

    setCards((prev) => {
      const next = structuredClone(prev);
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

          targetCol.items.splice(adjustedIndex, 0, cardToMove);
          return next;
        }
      }

      const alreadyExists = targetCol.items.some((c) => c.id === cardId);
      if (!alreadyExists) {
        targetCol.items.splice(dropIndex, 0, card);
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
  };

  return (
    <div
      className={`dragdroptable-board ${active ? "active" : ""}`}
      onDrop={(e) => {
        e.stopPropagation();
        handleDragEnd(e);
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {cards?.map((column) => (
        <div style={{ display: "flex" }} key={column.id}>
          <DropIndicatorCol beforeId={column.id} />
          <Column
            ref={columnRefs}
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
          />
        </div>
      ))}
      <DropIndicatorCol beforeId={null} />
      <AddCol onAdd={handleAddCol} />
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
    },
    ref
  ) => {
    const [active, setActive] = useState(false);

    const handleDragStart = (e, card, oldColumn) => {
      e.dataTransfer.setData("card", JSON.stringify(card));
      e.dataTransfer.setData("oldColumn", JSON.stringify(oldColumn));
      setDragType("card");
    };

    const handleDragEnd = (e, targetColumn) => {
      const card = JSON.parse(e.dataTransfer.getData("card") || "{}");
      const oldColumn = JSON.parse(e.dataTransfer.getData("oldColumn") || "{}");
      setActive(false);
      clearHighlights();
      const indicators = getIndicators();
      const { element } = getNearestIndicator(e, indicators);
      const before = element?.dataset.before || "-1";
      const dropIndex =
        before === "-1"
          ? targetColumn.items.length
          : targetColumn.items.findIndex((c) => c.id === before);

      if (!card?.id || !oldColumn?.id || !targetColumn || before === card?.id)
        return;

      setCards(card, oldColumn, targetColumn, dropIndex);
      setDragType(null);
    };

    const handleDragOver = (e) => {
      if (dragType !== "card") return;
      e.preventDefault();
      highlightIndicator(e);
      setActive(true);
    };

    const handleDragLeave = () => {
      clearHighlights();
      setActive(false);
    };

    const getIndicators = () => {
      return Array.from(
        document.querySelectorAll(`[data-column="${column?.id}"]`)
      );
    };

    const clearHighlights = (els = getIndicators()) => {
      els.forEach((i) => (i.style.opacity = "0"));
    };

    const highlightIndicator = (e) => {
      const indicators = getIndicators();
      clearHighlights(indicators);
      const { element } = getNearestIndicator(e, indicators);
      if (element) element.style.opacity = "1";
    };

    const getNearestIndicator = (e, indicators) => {
      const offsetTop = 50;
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
    };

    return (
      <div
        className={`dragdroptable-column ${active ? "active" : ""}`}
        draggable
        onDragStart={(e) => handleColDragStart(e, column)}
        onDrop={(e) => handleDragEnd(e, column)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        ref={(el) => (ref.current[column.id] = el)}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
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
                    <div>
                      <PenIcon /> <span>Edit title</span>
                    </div>
                  ),
                },
                {
                  element: (
                    <div>
                      <TrashIcon /> <span>Delete column</span>
                    </div>
                  ),
                  onClick: () => handleDeleteCol(column),
                },
              ]}
            />
          </div>
        </div>
        {column?.items?.map((item) => (
          <React.Fragment key={item.id}>
            <DropIndicator beforeId={item.id} column={column} />
            <Card
              item={item}
              column={column}
              handleDragStart={handleDragStart}
              ref={(el) => (cardRefs.current[item.id] = el)}
              handelEditCardTitle={handelEditCardTitle}
              handleDeleteCard={handleDeleteCard}
            />
          </React.Fragment>
        ))}
        <DropIndicator beforeId={null} column={column} />
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
          <div>
            <PenIcon /> <span>Edit card</span>
          </div>
        ),
      },
      {
        element: (
          <div>
            <TrashIcon /> <span>Delete card</span>
          </div>
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

const DropIndicator = ({ beforeId, column }) => (
  <div
    className="dragdroptable-indicator"
    data-before={beforeId || "-1"}
    data-column={column?.id}
  />
);
const DropIndicatorCol = ({ beforeId }) => (
  <div
    className="dragdroptable-indicator-col"
    data-before={beforeId || "-1"}
    data-indicator-board={true}
  />
);

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
    setCards(
      { id: Math.random().toString(), title: text.trim() },
      column,
      column,
      column.items.length
    );
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
    if (menu.length === 1) {
      return (
        <Button
          type="icon"
          onClick={() => {
            menu[0].onClick?.();
            setEditing(true);
          }}
        >
          {menu[0].element || <MoreIcon direction="vertical" />}
        </Button>
      );
    }

    if (menu.length > 1) {
      return (
        <Dropdown
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
    }

    return (
      <Button type="icon" onClick={() => setEditing(true)}>
        <MoreIcon direction="vertical" />
      </Button>
    );
  };

  return editing ? (
    <form className="dragdroptable-form" onSubmit={handleSubmit} ref={formRef}>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={row}
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
      <EllipsisWithTooltip row={row}>{value}</EllipsisWithTooltip>
      {renderControl()}
    </div>
  );
};

const DEFAULT_CARDS = [
  {
    title: "col1",
    id: "col1",
    items: [
      { title: "card1", id: "1" },
      { title: "card2", id: "2" },
      { title: "card3", id: "3" },
      { title: "card4", id: "4" },
    ],
  },
  {
    title: "col2",
    id: "col2",
    items: [
      { title: "card5", id: "5" },
      { title: "card6", id: "6" },
      { title: "card7", id: "7" },
      { title: "card8", id: "8" },
    ],
  },
  {
    title: "col3",
    id: "col3",
    items: [
      { title: "card9", id: "9" },
      { title: "card10", id: "10" },
      { title: "card11", id: "11" },
      { title: "card12", id: "12" },
    ],
  },
];

export default DragDropTable;
