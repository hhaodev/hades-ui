import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
} from "@floating-ui/dom";
import React, {
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Stack from "../Stack";
import { DropdownItem } from "./DropdownItem";
import { DropdownMenu } from "./DropdownMenu";
import { useSafeZone } from "./SafeAreaRegistry";

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

const Dropdown = forwardRef(function Dropdown(
  {
    id,
    children,
    menu,
    placement = "bottom-start",
    onOpenChange,
    popupStyles,
    getPlacement,
    disabled = false,
    useClickOutSide = true,
    fixedWidthPopup = true,
    trigger = ["click"], // "hover" | "click" | "hover click"
  },
  ref
) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [actualPlacement, setActualPlacement] = useState(placement);
  const [popupWidth, setPopupWidth] = useState(0);

  const dropdownId = useId();

  const referenceRef = useRef(null);
  const dropdownRef = useRef(null);
  const acquireClickLock = useClickLockRef(200);

  const isHoverTrigger = trigger.includes("hover");
  const isClickTrigger = trigger.includes("click");

  const drdId = id ?? `dropdown-menu-${actualPlacement}-${dropdownId}`;

  useImperativeHandle(ref, () => ({
    show: () => {
      if (!disabled) setOpen(true);
    },
    hide: () => {
      setOpen(false);
    },
    opening: open,
  }));

  useSafeZone(
    open && useClickOutSide,
    referenceRef,
    dropdownRef,
    () => {
      setTimeout(() => setOpen(false), 0);
    },
    { id: drdId }
  );

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
    onOpenChange?.(open);
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
    const handleResize = () => {
      setPopupWidth(referenceRef?.current?.getBoundingClientRect()?.width);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  let triggerNode = children;
  if (isValidElement(children)) {
    const triggerProps = {
      "data-disabled-action": disabled ? "true" : "false",
      onClick: (e) => {
        if (!isClickTrigger || disabled) return;
        if (!acquireClickLock()) return;
        e.stopPropagation();
        children.props.onClick?.(e);
        setOpen((prev) => !prev);
      },
      onMouseEnter: () => {
        if (!isHoverTrigger || disabled) return;
        setOpen(true);
      },
      onMouseLeave: () => {
        if (!isHoverTrigger || disabled) return;
        setTimeout(() => {
          if (!dropdownRef.current?.matches(":hover")) {
            setOpen(false);
          }
        }, 150);
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

  let menuContent = null;
  if (typeof menu === "function") {
    menuContent = menu(referenceRef);
  } else if (React.isValidElement(menu)) {
    menuContent = <DropdownMenu>{menu}</DropdownMenu>;
  } else if (Array.isArray(menu) && menu.length > 0) {
    menuContent = (
      <DropdownMenu>
        {menu.map((i, idx) => (
          <DropdownItem
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              i?.onClick?.(e);
              setOpen(false);
            }}
            checked={i.checked}
          >
            {i?.element}
          </DropdownItem>
        ))}
      </DropdownMenu>
    );
  }

  return (
    <>
      {triggerNode}
      {shouldRender &&
        !disabled &&
        createPortal(
          <Stack onClick={(e) => e.stopPropagation()} id={drdId}>
            <Stack
              ref={dropdownRef}
              style={{
                background: "var(--hadesui-bg-color)",
                borderRadius: 8,
                boxShadow: "0 4px 12px var(--hadesui-boxshadow-color)",
                minWidth: 100,
                width: fixedWidthPopup ? popupWidth : "fit-content",
                maxHeight: "100%",
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
                zIndex: "var(--z-dropdown)",
              }}
              onMouseLeave={(e) => {
                if (!isHoverTrigger || disabled) return;
                setTimeout(() => {
                  if (!referenceRef.current?.matches(":hover")) {
                    setOpen(false);
                  }
                }, 150);
              }}
            >
              {menuContent}
            </Stack>
          </Stack>,
          document.body
        )}
    </>
  );
});

Dropdown.Menu = DropdownMenu;
Dropdown.Item = DropdownItem;
export default Dropdown;
