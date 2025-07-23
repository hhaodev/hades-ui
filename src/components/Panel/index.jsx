import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { calculatePaddingR, cn, useDisableScroll } from "../../utils";
import Button from "../Button";
import Stack from "../Stack";
import "./index.css";
import { CloseIcon } from "../Icon";

const SIZE_MAP_WIDTH = {
  small: 300,
  large: 550,
  extra: 900,
};
const SIZE_MAP_HEIGHT = {
  small: 200,
  large: 350,
  extra: 450,
};

export default function Panel({
  open,
  onClose,
  placement = "right",
  width,
  height,
  children,
  title,
  buttons,
  size = "large", //small | large | extra
}) {
  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(open);
  const [paddingRight, setPaddingRight] = useState(16);

  const panelRef = useRef();
  const bodyRef = useRef();
  const timeoutRef = useRef();
  useDisableScroll(open);

  useEffect(() => {
    clearTimeout(timeoutRef.current);
    if (open) {
      setShouldRender(true);
      setVisible(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    } else {
      setVisible(false);
      timeoutRef.current = setTimeout(() => {
        setShouldRender(false);
      }, 200);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [open]);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  useLayoutEffect(() => {
    if (bodyRef.current) {
      const pad = calculatePaddingR(16, bodyRef.current);
      setPaddingRight(pad);
    }
  }, [shouldRender]);

  if (!shouldRender) return null;

  return ReactDOM.createPortal(
    <Stack className={cn("panel-wrapper", visible ? "open" : "close")}>
      <Stack
        onClick={onClose}
        className={cn("panel-mask", visible ? "fade-in" : "fade-out")}
      />
      <Stack
        ref={panelRef}
        className={cn(
          "panel",
          `panel-${placement}`,
          visible ? "slide-in" : "slide-out"
        )}
        style={{
          width:
            placement === "left" || placement === "right"
              ? width ?? SIZE_MAP_WIDTH[size] ?? SIZE_MAP_WIDTH.large
              : "100%",
          height:
            placement === "top" || placement === "bottom"
              ? height ?? SIZE_MAP_HEIGHT[size] ?? SIZE_MAP_HEIGHT.large
              : "100%",
        }}
      >
        <Stack className="panel-header">
          <Stack className="panel-title">{title ?? "Panel"}</Stack>
          <Stack className="panel-close-btn">
            <Button theme="icon" onClick={onClose}>
              <CloseIcon />
            </Button>
          </Stack>
        </Stack>
        <Stack
          ref={bodyRef}
          className="panel-body"
          style={{
            paddingRight,
          }}
        >
          <Stack>{children}</Stack>
        </Stack>
        <Stack className="panel-footer">
          {(
            buttons ?? [
              <Button theme="default" key="close-panel-modal" onClick={onClose}>
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
