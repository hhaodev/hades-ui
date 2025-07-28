import React, {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  cloneElement,
  isValidElement,
  useId,
} from "react";
import { createPortal } from "react-dom";
import {
  computePosition,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/dom";
import Stack from "../Stack";
import { DropdownMenu } from "./DropdownMenu";
import { DropdownItem } from "./DropdownItem";

function useClickLockRef(timeout = 250) {
  const lockRef = useRef(false);

  const acquire = () => {
    if (lockRef.current) return false;
    lockRef.current = true;
    setTimeout(() => {
      lockRef.current = false;
    }, timeout);
    return true;
  };

  return acquire;
}

function getFallbackPlacements(basePlacement) {
  const [side, align = "center"] = basePlacement.split("-");

  const alignments = ["start", "center", "end"];

  const fallback = [];

  for (const a of alignments) {
    const placement = a === "center" ? side : `${side}-${a}`;
    if (placement !== basePlacement) {
      fallback.push(placement);
    }
  }

  const oppositeSides = {
    top: ["bottom", "right", "left"],
    bottom: ["top", "right", "left"],
    left: ["right", "top", "bottom"],
    right: ["left", "top", "bottom"],
  }[side];

  for (const otherSide of oppositeSides) {
    if (align === "center") {
      fallback.push(otherSide);
    } else {
      fallback.push(`${otherSide}-${align}`);
    }

    for (const a of alignments) {
      const placement = a === "center" ? otherSide : `${otherSide}-${a}`;
      if (placement !== basePlacement && !fallback.includes(placement)) {
        fallback.push(placement);
      }
    }
  }

  return fallback;
}

function getInitialTransform(placement) {
  if (placement.startsWith("top")) return "translateY(8px)";
  if (placement.startsWith("bottom")) return "translateY(-8px)";
  if (placement.startsWith("left")) return "translateX(8px)";
  if (placement.startsWith("right")) return "translateX(-8px)";
  return "translate(0, 0)";
}

export default function Dropdown({
  children,
  menu,
  placement = "bottom-start",
  open: controlledOpen,
  onOpenChange,
  popupRender,
  popupStyles,
  fixedWidthPopup = true,
  getPlacement,
  disabled = false,
  id,
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [actualPlacement, setActualPlacement] = useState(placement);
  const [popupWidth, setPopupWidth] = useState(0);

  const dropdownId = useId();

  const referenceRef = useRef(null);
  const dropdownRef = useRef(null);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const acquireClickLock = useClickLockRef(200);

  const setOpen = (value) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(value);
    }
    onOpenChange?.(value);
  };

  useLayoutEffect(() => {
    if (!shouldRender || !referenceRef.current || !dropdownRef.current) return;
    const cleanup = autoUpdate(
      referenceRef.current,
      dropdownRef.current,
      () => {
        computePosition(referenceRef.current, dropdownRef.current, {
          placement,
          middleware: [
            offset(8),
            flip({ fallbackPlacements: getFallbackPlacements(placement) }),
            shift(),
          ],
        }).then(({ x, y, placement: resolvedPlacement }) => {
          const dropdownEl = dropdownRef.current;
          const referenceEl = referenceRef.current;
          const container = dropdownEl.offsetParent || document.body;
          const containerRect = container.getBoundingClientRect();

          dropdownEl.style.left = `${x}px`;
          dropdownEl.style.top = `${y}px`;
          dropdownEl.style.position = "absolute";

          if (resolvedPlacement.startsWith("left")) {
            const space =
              referenceEl.getBoundingClientRect().left - containerRect.left - 8;
            dropdownEl.style.maxWidth = `${space}px`;
          } else if (resolvedPlacement.startsWith("right")) {
            const space =
              containerRect.right -
              referenceEl.getBoundingClientRect().right -
              8;
            dropdownEl.style.maxWidth = `${space}px`;
          } else {
            dropdownEl.style.maxWidth = "100%";
          }
          getPlacement?.(resolvedPlacement);
          setActualPlacement(resolvedPlacement);
          setTimeout(() => setReady(true), 100);
        });
      }
    );

    return cleanup;
  }, [shouldRender, placement]);

  useEffect(() => {
    if (open) {
      setReady(false);
      setShouldRender(true);
    } else {
      setReady(false);
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (
        !referenceRef.current?.contains(e.target) &&
        !dropdownRef.current?.contains(e.target)
      ) {
        setTimeout(() => setOpen(false), 0);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  let triggerNode = children;
  if (isValidElement(children)) {
    const triggerProps = {
      "data-disabled-action": disabled ? "true" : "false",
      onClick: (e) => {
        if (disabled) return;
        if (!acquireClickLock()) return;
        e.stopPropagation();
        children.props.onClick?.(e);
        setOpen(open ? false : true);
      },
      ref: (el) => {
        referenceRef.current = el;
        const childRef = children.ref;
        if (typeof childRef === "function") childRef(el);
        else if (childRef) childRef.current = el;
      },
    };
    triggerNode = cloneElement(children, triggerProps);
  }

  useEffect(() => {
    const handleResize = () => {
      setPopupWidth(referenceRef?.current?.getBoundingClientRect()?.width);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      {triggerNode}
      {shouldRender &&
        !disabled &&
        createPortal(
          <Stack id={id ?? `dropdown-menu-${actualPlacement}-${dropdownId}`}>
            <Stack
              ref={dropdownRef}
              style={{
                background: "var(--hadesui-bg-color)",
                borderRadius: 8,
                boxShadow: "0 4px 12px var(--hadesui-boxshadow-color)",
                minWidth: 150,
                width: fixedWidthPopup ? popupWidth : "fit-content",
                ...(!popupRender ? { maxHeight: 400 } : {}),
                ...popupStyles,
                overflow: "hidden",
                overflowY: "auto",
                opacity: open && ready ? 1 : 0,
                transform:
                  open && ready
                    ? "translate(0, 0)"
                    : getInitialTransform(actualPlacement),
                pointerEvents: open && ready ? "auto" : "none",
                transition: "opacity 0.2s ease, transform 0.2s ease",
              }}
            >
              {popupRender ? (
                popupRender(referenceRef)
              ) : React.isValidElement(menu) ? (
                <DropdownMenu>{menu}</DropdownMenu>
              ) : Array.isArray(menu) && menu.length > 0 ? (
                <DropdownMenu>
                  {menu.map((i, idx) => (
                    <DropdownItem
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        i?.onClick(e);
                        setOpen(false);
                      }}
                      checked={i.checked}
                    >
                      {i?.element}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              ) : null}
            </Stack>
          </Stack>,
          document.body
        )}
    </>
  );
}

Dropdown.Menu = DropdownMenu;
Dropdown.Item = DropdownItem;
