import { motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom/client";
import { useEffect, useRef, useState, useCallback } from "react";
import { IconSuccess, IconError, IconInfo, IconWarning, XIcon } from "../Icon";
import Ellipsis from "../Ellipsis";
import Button from "../Button";

let root = null;
let pushMessage = null;

const maxMessage = 3;
const defaultDuration = 5000;
const prefixMessageId = "-hadesUI-message";

export const message = {
  success: (opts) => showMessage({ ...opts, type: "success" }),
  error: (opts) => showMessage({ ...opts, type: "error" }),
  warning: (opts) => showMessage({ ...opts, type: "warning" }),
  info: (opts) => showMessage({ ...opts, type: "info" }),
  remove: () => {},
  clearAll: () => {},
};

function initMessageRoot() {
  const div = document.createElement("div");
  div.id = "--hades-ui-box-message--";
  document.body.appendChild(div);
  root = ReactDOM.createRoot(div);
  root.render(
    <MessageRoot
      onReady={(handlers) => {
        pushMessage = handlers.add;
        message.remove = handlers.removeMessage;
        message.clearAll = handlers.clearAllMessage;
      }}
    />
  );
}

function isValid() {
  return document.getElementById("--hades-ui-box-message--");
}

function waitForPush(msg) {
  if (pushMessage) {
    pushMessage(msg);
  } else {
    requestAnimationFrame(() => waitForPush(msg));
  }
}

function showMessage(messageItem) {
  if (!root || !isValid()) {
    initMessageRoot();
  }
  const id = `${prefixMessageId}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
  const newMessage = { ...messageItem, id };
  requestAnimationFrame(() => waitForPush(newMessage));
}

function MessageRoot({ onReady }) {
  const [messages, setMessages] = useState([]);
  const timersRef = useRef({});

  useEffect(() => {
    onReady({
      add,
      removeMessage: remove,
      clearAllMessage: clearAll,
    });
  }, []);

  const remove = useCallback((id) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const add = useCallback(
    (msg) => {
      const duration = msg.duration ?? defaultDuration;
      const newMsg = { ...msg, duration };
      setMessages((prev) => {
        const updated = [newMsg, ...prev];
        return updated.slice(0, maxMessage);
      });
      timersRef.current[message.id] = setTimeout(
        () => remove(message.id),
        duration
      );
    },
    [remove]
  );

  const clearAll = useCallback(() => {
    setMessages([]);
    timersRef.current = {};
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        zIndex: "var(--z-message)",
      }}
    >
      <AnimatePresence mode="popLayout">
        {messages.map((msg) => (
          <motion.div
            layout
            layoutId={msg.id}
            key={msg.id}
            initial={{ y: -20, opacity: 0, transition: { duration: 0.2 } }}
            animate={{ y: 0, opacity: 1, transition: { duration: 0.2 } }}
            exit={{
              opacity: 0,
              height: 0,
              y: 0,
              transition: { duration: 0.1 },
              layout: 0,
            }}
          >
            <MessageItem {...msg} onClose={() => remove(msg.id)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function getMessageIcon(type) {
  switch (type) {
    case "success":
      return <IconSuccess size={20} />;
    case "error":
      return <IconError size={20} />;
    case "warning":
      return <IconWarning size={20} />;
    case "info":
    default:
      return <IconInfo size={20} />;
  }
}

function MessageItem({ icon, type = "info", message, onClose, allowClear }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "8px 16px",
        backgroundColor: "var(--hadesui-bg-toast-color)",
        boxShadow: "0px 4px 16px var(--hadesui-boxshadow-color)",
        borderRadius: "8px",
        width: "fit-content",
        maxWidth: "600px",
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontSize: "24px", width: 24 }}>
        {icon || getMessageIcon(type)}
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          width: `calc(100% - 40px - ${allowClear ? "36px" : "0px"})`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: "14px",
            width: "100%",
            color: "var(--hadesui-text-color)",
          }}
        >
          <Ellipsis>{message}</Ellipsis>
          {allowClear && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onClose?.();
              }}
              theme="icon"
            >
              <XIcon size={18} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
