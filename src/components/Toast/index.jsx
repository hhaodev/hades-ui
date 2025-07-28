import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import Button from "../Button";
import { IconError, IconInfo, IconSuccess, IconWarning, XIcon } from "../Icon";

const placements = ["topLeft", "topRight", "bottomLeft", "bottomRight"];
let root = null;
let addToast = null;

const limitToast = 3;

export const toast = {
  success: (opts) => showToast({ ...opts, type: "success" }),
  error: (opts) => showToast({ ...opts, type: "error" }),
  warning: (opts) => showToast({ ...opts, type: "warning" }),
  info: (opts) => showToast({ ...opts, type: "info" }),
};

function initToastRoot() {
  const div = document.createElement("div");
  div.id = "--hades-ui-box-toast--";
  document.body.appendChild(div);
  root = ReactDOM.createRoot(div);
  root.render(<ToastRoot onReady={(fn) => (addToast = fn)} />);
}

function isToastRootValid() {
  return document.getElementById("--hades-ui-box-toast--");
}

function waitForAddToast(toastItem) {
  if (addToast) {
    addToast(toastItem);
  } else {
    requestAnimationFrame(() => waitForAddToast(toastItem));
  }
}

function showToast(toastItem) {
  if (!root || !isToastRootValid()) {
    initToastRoot();
  }
  requestAnimationFrame(() => waitForAddToast(toastItem));
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
      const duration = toast.duration ?? 5000;
      const newToast = {
        ...toast,
        id,
        placement,
        duration,
      };

      setToasts((prev) => {
        const before = prev.filter((t) => t.placement !== placement);
        const current = prev.filter((t) => t.placement === placement);
        const updated = [newToast, ...current];
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
    [isTop ? "top" : "bottom"]: 0,
    [isRight ? "right" : "left"]: 0,
    display: "flex",
    flexDirection: isTop ? "column" : "column-reverse",
    gap: 14,
    cursor: "default",
    maxHeight: "calc(100% - 16px)",
    padding: "16px 16px 24px 16px",
    zIndex: 1000,
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

  const total = items.length;
  const visibleToasts = hover ? items : items.slice(0, limitToast);
  const hiddenCount = hover ? 0 : total - limitToast;
  const showHolder = !hover && hiddenCount > 0;

  return (
    <div
      style={style}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {visibleToasts.map((item, index) => {
          return (
            <motion.div
              key={item.id}
              layout
              layoutId={item.id}
              initial={
                index === 0
                  ? {
                      x: isLeft ? "-100%" : "100%",
                      opacity: 0,
                      transition: { duration: 0.2 },
                    }
                  : {
                      opacity: 0,
                      y: isTop ? -10 : 10,
                      transition: { duration: 0.2 },
                    }
              }
              animate={
                index === 0
                  ? { x: 0, opacity: 1, transition: { duration: 0.2 } }
                  : { y: 0, opacity: 1, transition: { duration: 0.2 } }
              }
              exit={{
                opacity: 0,
                height: 0,
                transition: { duration: 0.1 },
                layout: 0,
              }}
            >
              <ToastItem {...item} onClose={() => remove(item.id)} />
            </motion.div>
          );
        })}
      </AnimatePresence>
      {showHolder && (
        <div
          key="__stack-holder__"
          style={{
            background: "rgba(0, 0, 0, 0.1)",
            borderRadius: 8,
            padding: "12px 16px",
            fontSize: 14,
            color: "var(--hadesui-text2-color)",
            pointerEvents: "none",
          }}
        >
          {hiddenCount} more...
        </div>
      )}
    </div>
  );
}

const getToastIcon = (type) => {
  switch (type) {
    case "success":
      return <IconSuccess size={24} />;
    case "warning":
      return <IconWarning size={24} />;
    case "error":
      return <IconError size={24} />;
    case "info":
    default:
      return <IconInfo size={24} />;
  }
};

function ToastItem({ icon, type = "info", message, description, onClose }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "16px",
        backgroundColor: "var(--hadesui-bg-toast-color)",
        boxShadow: "0px 4px 16px var(--hadesui-boxshadow-color)",
        borderRadius: "8px",
        width: "400px",
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontSize: "24px" }}>{icon || getToastIcon(type)}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontSize: "14px",
              width: "100%",
              color: "var(--hadesui-text-color)",
            }}
          >
            <div>{message}</div>
            {description && (
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--hadesui-text2-color)",
                }}
              >
                {description}
              </div>
            )}
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            theme="icon"
          >
            <XIcon size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
