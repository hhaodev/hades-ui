import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Stack from "../Stack";
import { cn } from "../../utils";
import Button from "../Button";

let mousePosition = null;

document.addEventListener(
  "click",
  (e) => {
    mousePosition = { x: e.clientX, y: e.clientY };
    setTimeout(() => (mousePosition = null), 100);
  },
  true
);

function getScrollbarWidth() {
  const hasScrollbar =
    document.documentElement.scrollHeight > window.innerHeight;
  if (!hasScrollbar) return 0;
  const scrollDiv = document.createElement("div");
  scrollDiv.style.width = "100px";
  scrollDiv.style.height = "100px";
  scrollDiv.style.overflow = "scroll";
  scrollDiv.style.position = "absolute";
  scrollDiv.style.top = "-9999px";
  document.body.appendChild(scrollDiv);
  const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);
  return scrollbarWidth;
}

export default function Modal({ title, buttons, open, onClose, children }) {
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [origin, setOrigin] = useState("center center");
  const modalRef = useRef(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    if (open) {
      setActive(true);
      setClosing(false);
      const scrollbarWidth = getScrollbarWidth();
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (mousePosition && modalRef.current) {
            const rect = modalRef.current.getBoundingClientRect();
            const offsetX = mousePosition.x - rect.left;
            const offsetY = mousePosition.y - rect.top;
            setOrigin(`${offsetX}px ${offsetY}px`);
          } else {
            setOrigin("center center");
          }
          setVisible(true);
        });
      });
    } else if (active) {
      setVisible(false);
      setClosing(true);
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [open]);

  const handleAnimationEnd = () => {
    if (closing) {
      setClosing(false);
      setActive(false);
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!active) return null;

  return ReactDOM.createPortal(
    <Stack
      className={cn("modal-overlay", {
        open: visible,
        close: closing,
      })}
      onClick={onClose}
    >
      <Stack
        className={cn("modal", {
          "zoom-in": visible,
          "zoom-out": closing,
        })}
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={handleAnimationEnd}
        style={{ transformOrigin: origin }}
      >
        <Stack className="modal-header">
          <Stack className="modal-title">{title ?? "Modal"}</Stack>
          <Stack className="modal-close-btn">
            <Button
              type="text"
              style={{
                height: "30px",
                width: "30px",
              }}
              onClick={onClose}
            >
              X
            </Button>
          </Stack>
        </Stack>
        <Stack className="modal-body">{children}</Stack>
        <Stack className="modal-footer">
          {(
            buttons ?? [
              <Button type="default" key="close-button-modal" onClick={onClose}>
                Close
              </Button>,
            ]
          )?.map((i, idx) => (
            <Stack key={i.key ?? idx}>{i}</Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>,
    document.body
  );
}
