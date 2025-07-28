import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";

const placements = ["topLeft", "topRight", "bottomLeft", "bottomRight"];
const maxVisible = 3;
let root = null;
let addToast = null;

export const toast = {
  success: (opts) => showToast({ ...opts, type: "success" }),
  error: (opts) => showToast({ ...opts, type: "error" }),
  warning: (opts) => showToast({ ...opts, type: "warning" }),
  info: (opts) => showToast({ ...opts, type: "info" }),
};

function showToast(toastItem) {
  if (!root) {
    const div = document.createElement("div");
    document.body.appendChild(div);
    root = ReactDOM.createRoot(div);
    root.render(<ToastRoot onReady={(fn) => (addToast = fn)} />);
  }

  if (addToast) {
    addToast(toastItem);
  } else {
    setTimeout(() => showToast(toastItem), 50);
  }
}

function ToastRoot({ onReady }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);
  const timersRef = useRef({});

  useEffect(() => {
    onReady(add);
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id].timeoutId);
      delete timersRef.current[id];
    }
  }, []);

  const add = useCallback(
    (toast) => {
      const id = idRef.current++;
      const placement = toast.placement || "topRight";
      const duration = toast.duration ?? 4500;
      const newToast = { ...toast, id, placement, duration };

      setToasts((prev) => {
        const before = prev.filter((t) => t.placement !== placement);
        const current = prev.filter((t) => t.placement === placement);
        const updated = placement.includes("bottom")
          ? [...current, newToast]
          : [newToast, ...current];
        return [...before, ...updated];
      });

      if (duration !== 0) {
        timersRef.current[id] = {
          timeoutId: setTimeout(() => remove(id), duration),
          startTime: Date.now(),
          remaining: duration,
        };
      }
    },
    [remove]
  );

  const grouped = placements.reduce((acc, p) => ({ ...acc, [p]: [] }), {});
  for (const t of toasts) grouped[t.placement].push(t);

  return (
    <>
      {placements.map((placement) => (
        <ToastPlacementGroup
          key={placement}
          placement={placement}
          items={grouped[placement]}
          remove={remove}
          timersRef={timersRef}
        />
      ))}
    </>
  );
}

function ToastPlacementGroup({ placement, items, remove, timersRef }) {
  const isTop = placement.includes("top");
  const isRight = placement.includes("Right");
  const isLeft = placement.includes("Left");
  const [hover, setHover] = useState(false);

  const style = {
    position: "fixed",
    zIndex: 1000,
    [isTop ? "top" : "bottom"]: 16,
    ...(isRight ? { right: 10 } : {}),
    ...(isLeft ? { left: 10 } : {}),
    display: "flex",
    flexDirection: "column",
    gap: 8,
    cursor: "default",
    maxHeight: "calc(100% - 16px)",
    overflowY: "hidden",
  };

  useEffect(() => {
    const now = Date.now();
    items.forEach((item) => {
      const record = timersRef.current[item.id];
      if (!record) return;
      if (hover) {
        const elapsed = now - record.startTime;
        record.remaining = Math.max(record.remaining - elapsed, 0);
        clearTimeout(record.timeoutId);
      } else {
        record.startTime = now;
        record.timeoutId = setTimeout(() => remove(item.id), record.remaining);
      }
    });
  }, [hover]);

  const visible = isTop ? items.slice(0, maxVisible) : items.slice(-maxVisible);
  const hidden = items.length - visible.length;
  const displayItems = hover ? items : visible;

  return (
    <div
      style={style}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {!isTop && hidden > 0 && !hover && (
          <div style={stackStyle}>{hidden} more...</div>
        )}

        {displayItems.map((item) => (
          <motion.div
            key={item.id}
            layout
            layoutId={item.id}
            initial={{ opacity: 0, y: isTop ? -10 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ToastItem {...item} onClose={() => remove(item.id)} />
          </motion.div>
        ))}

        {isTop && hidden > 0 && !hover && (
          <div style={stackStyle}>{hidden} more...</div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ type, message, description, onClose }) {
  const typeColor = {
    success: "#52c41a",
    error: "#ff4d4f",
    warning: "#faad14",
    info: "#1890ff",
  };

  return (
    <div
      style={{
        position: "relative",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        padding: "12px 16px",
        borderLeft: `4px solid ${typeColor[type]}`,
        borderRadius: 4,
        fontSize: 14,
        maxWidth: 320,
        minWidth: 320,
      }}
    >
      <div
        style={{
          fontWeight: 600,
          marginBottom: 4,
          paddingRight: 20,
          color: "#555",
        }}
      >
        {message}
      </div>
      {description && <div style={{ color: "#555" }}>{description}</div>}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontSize: 14,
          color: "#888",
        }}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}

const stackStyle = {
  fontSize: 12,
  background: "#f0f0f0",
  padding: "4px 8px",
  borderRadius: 4,
  textAlign: "center",
  color: "#888",
};
