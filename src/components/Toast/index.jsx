import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import Button from "../Button";
import { IconError, IconInfo, IconSuccess, IconWarning, XIcon } from "../Icon";

const placements = ["topLeft", "topRight", "bottomLeft", "bottomRight"];
let root = null;
let addToast = null;

let limitToast = 5;
let defaultDuration = 5000;
let pauseOnHover = true;
let showProgress = true;
const prefixToastId = "-hadesUI-toast";

export const toast = {
  success: (opts) => showToast({ ...opts, type: "success" }),
  error: (opts) => showToast({ ...opts, type: "error" }),
  warning: (opts) => showToast({ ...opts, type: "warning" }),
  info: (opts) => showToast({ ...opts, type: "info" }),
  remove: () => {},
  clearAll: () => {},
  config: (args) => {
    if (args.limitToast !== undefined) limitToast = args.limitToast;
    if (args.defaultDuration !== undefined)
      defaultDuration = args.defaultDuration;
    if (args.pauseOnHover !== undefined) pauseOnHover = args.pauseOnHover;
    if (args.showProgress !== undefined) showProgress = args.showProgress;
  },
};

function initToastRoot() {
  const div = document.createElement("div");
  div.id = "--hades-ui-box-toast--";
  document.body.appendChild(div);
  root = ReactDOM.createRoot(div);
  root.render(
    <ToastRoot
      onReady={(handlers) => {
        addToast = handlers.add;
        toast.remove = handlers.removeToast;
        toast.clearAll = handlers.clearAllToast;
      }}
    />
  );
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
  const id = `${prefixToastId}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
  const newToast = { ...toastItem, id };
  requestAnimationFrame(() => waitForAddToast(newToast));
  return id;
}

function ToastRoot({ onReady }) {
  const [toasts, setToasts] = useState([]);
  const toastRecords = useRef(new Map());

  useEffect(() => {
    onReady({
      add,
      removeToast: remove,
      clearAllToast: clearAll,
    });
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const record = toastRecords.current.get(id);
    if (record) {
      record.onHide?.(id);
      clearTimeout(record.timeoutId);
      toastRecords.current.delete(id);
    }
  }, []);

  const add = useCallback(
    (toast) => {
      const { onHide, ...rest } = toast;
      const placement =
        (placements.includes(toast.placement) && toast.placement) || "topRight";
      const duration = toast.duration ?? defaultDuration;
      const showProgressInternal = toast.showProgress ?? showProgress;
      const pauseOnHoverInternal = toast.pauseOnHover ?? pauseOnHover;
      const newToast = {
        ...rest,
        placement,
      };

      setToasts((prev) => {
        const before = prev.filter((t) => t.placement !== placement);
        const current = prev.filter((t) => t.placement === placement);
        const updated = [newToast, ...current];
        return [...before, ...updated];
      });

      const record = {
        duration,
        pauseOnHover: pauseOnHoverInternal,
        showProgress: showProgressInternal,
        startTime: Date.now(),
        remaining: duration,
        onHide,
        timeoutId:
          duration > 0
            ? setTimeout(() => remove(record.id), duration)
            : undefined,
        ...newToast,
      };

      record.pause = () => {
        if (record.duration === 0 || !record.timeoutId) return;
        const elapsed = Date.now() - record.startTime;
        record.remaining = Math.max(record.remaining - elapsed, 0);
        clearTimeout(record.timeoutId);
        record.timeoutId = undefined;
      };

      record.resume = () => {
        if (record.duration === 0 || record.timeoutId) return;
        if (record.remaining <= 0) {
          remove(record.id);
          return;
        }
        record.startTime = Date.now();
        record.timeoutId = setTimeout(
          () => remove(record.id),
          record.remaining
        );
      };

      record.hide = () => remove(record.id);

      toastRecords.current.set(toast.id, record);
    },
    [remove]
  );

  const clearAll = useCallback(() => {
    setToasts([]);
    for (const record of toastRecords.current.values()) {
      clearTimeout(record.timeoutId);
    }
    toastRecords.current.clear();
  }, []);

  const grouped = placements.reduce((acc, p) => ({ ...acc, [p]: [] }), {});
  for (const t of toasts) grouped[t.placement].push(t);

  return (
    <React.Fragment>
      {placements.map((placement) => (
        <ToastPlacementGroup
          key={placement}
          placement={placement}
          items={grouped[placement]}
          toastRecords={toastRecords}
        />
      ))}
    </React.Fragment>
  );
}

function ToastPlacementGroup({ placement, items, toastRecords }) {
  const isTop = placement.includes("top");
  const isRight = placement.includes("Right");
  const [hover, setHover] = useState(false);

  const style = {
    position: "fixed",
    [isTop ? "top" : "bottom"]: 0,
    [isRight ? "right" : "left"]: 0,
    display: items.length > 0 ? "flex" : "none",
    flexDirection: isTop ? "column" : "column-reverse",
    gap: 14,
    cursor: "default",
    maxHeight: "100vh",
    padding: "16px",
    zIndex: "var(--z-toast)",
    overflowY: "auto",
    /*Ẩn scrollbar*/
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  };

  useEffect(() => {
    items.forEach((item) => {
      const record = toastRecords.current.get(item.id);
      if (!record || record.duration === 0 || !record.pauseOnHover) return;
      if (hover) {
        record.pause();
      } else {
        record.resume();
      }
    });
  }, [hover]);

  const total = items.length;
  const visibleToasts = hover ? items : items.slice(0, limitToast);
  const hiddenCount = hover ? 0 : total - limitToast;
  const showHolder = !hover && hiddenCount > 0;

  return (
    <motion.div layout>
      <motion.div
        layout
        style={style}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <AnimatePresence mode="popLayout">
          {visibleToasts.map((item) => {
            return (
              <motion.div
                layout
                layoutId={item.id}
                key={item.id}
                initial={{
                  y: isTop ? -10 : 10,
                  opacity: 0,
                }}
                animate={{ y: 0, opacity: 1 }}
                exit={{
                  opacity: 0,
                  height: 0,
                  transition: { duration: 0.1 },
                  layout: 0,
                }}
              >
                <ToastItem
                  item={item}
                  toastRecords={toastRecords}
                  hover={hover}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
        {showHolder && (
          <motion.div
            layout
            key="__stack-holder__"
            style={{
              textAlign: "center",
              background: "rgba(0, 0, 0, 0.25)",
              borderRadius: 8,
              padding: "12px 16px",
              fontSize: 14,
              color: "var(--hadesui-text2-color)",
              pointerEvents: "none",
            }}
          >
            {hiddenCount} more...
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

const getBgColor = (type) => {
  switch (type) {
    case "success":
      return "#00FF00";
    case "warning":
      return "#D89614";
    case "error":
      return "#E40000";
    case "info":
      return "#0000FF";
    default:
      return "#0000FF";
  }
};

const getToastIcon = (type) => {
  const color = getBgColor(type);
  switch (type) {
    case "success":
      return <IconSuccess size={24} color={color} />;
    case "warning":
      return <IconWarning size={24} color={color} />;
    case "error":
      return <IconError size={24} color={color} />;
    case "info":
      return <IconInfo size={24} color={color} />;
    default:
      return <IconInfo size={24} color={color} />;
  }
};

if (!customElements.get("hadesui-toast")) {
  class ToastItemElement extends HTMLElement {
    #hide() {
      this.dispatchEvent(new CustomEvent("hide"));
    } // (#hide) k cho truy cập từ bên ngoài. ex: ele.hide(), có thể truy cập nếu k có #
    method(action) {
      if (action === "hide") this.#hide();
    }
  }
  customElements.define("hadesui-toast", ToastItemElement);
}

function ToastItem({ item, toastRecords, hover }) {
  const { id, type, description, title, icon } = item;
  const divRef = useRef(null);
  const hoverRef = useRef(false);
  const record = toastRecords.current.get(id);
  const [progress, setProgress] = useState(() => {
    if (!record || record.duration === 0 || !record.showProgress) return 0;
    const elapsed = Date.now() - record.startTime;
    const remaining = Math.max(record.remaining - elapsed, 0);
    return (remaining / record.duration) * 100;
  });

  useEffect(() => {
    hoverRef.current = hover;
  }, [hover]);

  useEffect(() => {
    if (!record || record.duration === 0 || !record.showProgress) return;
    const update = () => {
      if (hoverRef.current && record?.pauseOnHover) return;
      const elapsed = Date.now() - record.startTime;
      const remaining = Math.max(record.remaining - elapsed, 0);
      const percent = (remaining / record.duration) * 100;
      setProgress(percent);
    };

    const interval = setInterval(update, 100);
    return () => clearInterval(interval);
  }, [id, record]);

  useEffect(() => {
    const el = divRef.current;
    if (!el) return;
    const handleHide = () => record?.hide?.();
    el.addEventListener("hide", handleHide);
    return () => el.removeEventListener("hide", handleHide);
  }, [record]);

  return (
    <hadesui-toast
      id={id}
      ref={divRef}
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
        position: "relative",
        overflow: "hidden",
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
            <div>{title}</div>
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
              record?.hide();
            }}
            theme="icon"
          >
            <XIcon size={18} />
          </Button>
        </div>
      </div>

      {record?.showProgress && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "2px",
            width: `${progress}%`,
            background: getBgColor(type),
            transition: "width 0.1s linear",
          }}
        />
      )}
    </hadesui-toast>
  );
}
