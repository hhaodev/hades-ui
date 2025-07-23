import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { calculatePaddingR, cn, useDisableScroll } from "../../utils";
import Button from "../Button";
import Stack from "../Stack";
import "./index.css";
import { CloseIcon } from "../Icon";

let mousePosition = null;

document.addEventListener(
  "click",
  (e) => {
    mousePosition = { x: e.clientX, y: e.clientY };
    setTimeout(() => (mousePosition = null), 100);
  },
  true
);

export default function Modal({ title, buttons, open, onClose, children }) {
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [origin, setOrigin] = useState("center center");
  const [paddingRight, setPaddingRight] = useState(16);
  const modalRef = useRef(null);
  const bodyRef = useRef(null);

  useDisableScroll(open);

  useEffect(() => {
    if (open) {
      setActive(true);
      setClosing(false);
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

  useLayoutEffect(() => {
    if (bodyRef.current) {
      const pad = calculatePaddingR(16, bodyRef.current);
      setPaddingRight(pad);
    }
  }, [active]);

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
            <Button theme="icon" onClick={onClose}>
              <CloseIcon />
            </Button>
          </Stack>
        </Stack>
        <Stack
          ref={bodyRef}
          className="modal-body"
          style={{
            paddingRight,
          }}
        >
          <Stack>{children}</Stack>
        </Stack>
        <Stack className="modal-footer">
          {(
            buttons ?? [
              <Button theme="default" key="close-button-modal" onClick={onClose}>
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
