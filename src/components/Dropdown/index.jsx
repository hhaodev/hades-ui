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
import { useMergedState } from "../../utils";
import Stack from "../Stack";
import { DropdownItem } from "./DropdownItem";
import { DropdownMenu } from "./DropdownMenu";
import { useSafeZone } from "./SafeAreaRegistry";

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

function renderBridge(
  actualPlacement,
  referenceRef,
  dropdownRef,
  isHoverTrigger,
  disabled,
  setOpen
) {
  if (!referenceRef.current || !dropdownRef.current || !isHoverTrigger)
    return null;

  const ddRect = dropdownRef.current.getBoundingClientRect();

  const commonProps = {
    position: "fixed",
    background: "transparent",
    pointerEvents: "auto",
  };

  let style = null;

  if (actualPlacement.startsWith("left")) {
    style = {
      ...commonProps,
      top: ddRect.top,
      left: ddRect.right - 8,
      width: 8,
      height: ddRect.height,
    };
  } else if (actualPlacement.startsWith("right")) {
    style = {
      ...commonProps,
      top: ddRect.top,
      left: ddRect.left,
      width: 8,
      height: ddRect.height,
    };
  } else if (actualPlacement.startsWith("top")) {
    style = {
      ...commonProps,
      top: ddRect.bottom - 8,
      left: ddRect.left,
      width: ddRect.width,
      height: 8,
    };
  } else if (actualPlacement.startsWith("bottom")) {
    style = {
      ...commonProps,
      top: ddRect.top,
      left: ddRect.left,
      width: ddRect.width,
      height: 8,
    };
  }

  if (!style) return null;

  return (
    <div
      style={style}
      onMouseEnter={() => {
        if (!isHoverTrigger || disabled) return;
        setOpen(true);
      }}
      onMouseLeave={() => {
        if (!isHoverTrigger || disabled) return;
        setOpen(false);
      }}
    />
  );
}

const Dropdown = forwardRef(function Dropdown(
  {
    id,
    children,
    menu,
    placement = "bottom-start",
    open: controlledOpen,
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
  const [open, setOpen] = useMergedState(false, {
    value: controlledOpen,
    onChange: onOpenChange,
  });
  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [actualPlacement, setActualPlacement] = useState(placement);
  const [popupWidth, setPopupWidth] = useState(0);

  const dropdownId = useId();

  const referenceRef = useRef(null);
  const dropdownRef = useRef(null);
  const timer = useRef(null);
  const cleanupRef = useRef(null);

  const ghostRef = useRef(null);
  const ghostAnimRef = useRef(null);

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
      requestAnimationFrame(() => setOpen(false));
    },
    { id: drdId }
  );

  function removeGhost() {
    try {
      ghostAnimRef.current?.cancel?.();
    } catch {}
    ghostAnimRef.current = null;
    if (ghostRef.current) {
      ghostRef.current.remove();
      ghostRef.current = null;
    }
  }

  function spawnGhostAndAnimateToTrigger() {
    const el = dropdownRef.current;
    if (!el) return;

    removeGhost();

    const rect = el.getBoundingClientRect();
    const ghost = el.cloneNode(true);
    ghost.removeAttribute("id");
    Object.assign(ghost.style, {
      position: "fixed",
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      margin: 0,
      transform: "translate(0,0)",
      transformOrigin: "center",
      pointerEvents: "none",
      zIndex: 2147483647,
      overflow: "hidden",
    });
    document.body.appendChild(ghost);
    ghostRef.current = ghost;

    const anim = ghost.animate(
      [
        { transform: "translate(0px,0px)", opacity: 1 },
        { transform: getInitialTransform(actualPlacement), opacity: 0 },
      ],
      { duration: 200 }
    );
    ghostAnimRef.current = anim;
    anim.onfinish = removeGhost;
    anim.oncancel = removeGhost;
  }

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
        });
      }
    );
    cleanupRef.current = cleanup;
    return () => cleanup();
  }, [shouldRender, placement]);

  const show = () => {
    clearTimeout(timer.current);
    removeGhost();
    setShouldRender(true);
    timer.current = setTimeout(() => setVisible(true), 100);
  };

  const hide = () => {
    clearTimeout(timer.current);
    spawnGhostAndAnimateToTrigger();
    setShouldRender(false);
    setVisible(false);
  };

  useEffect(() => {
    if (open) {
      show();
    } else {
      hide();
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

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
      cleanupRef.current?.();
    };
  }, []);

  let triggerNode = children;
  if (isValidElement(children)) {
    const triggerProps = {
      "data-disabled-action": disabled ? "true" : "false",
      onClick: (e) => {
        if (!isClickTrigger || disabled) return;
        e.stopPropagation();
        children.props.onClick?.(e);
        requestAnimationFrame(() => setOpen(open ? false : true));
      },
      onMouseEnter: () => {
        if (!isHoverTrigger || disabled) return;
        setOpen(true);
      },
      onMouseLeave: () => {
        if (!isHoverTrigger || disabled) return;
        setOpen(false);
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
    menuContent = menu();
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
          <Stack id={`${drdId}-wrapper`}>
            {renderBridge(
              actualPlacement,
              referenceRef,
              dropdownRef,
              isHoverTrigger,
              disabled,
              setOpen
            )}
            <Stack
              onClick={(e) => e.stopPropagation()}
              id={drdId}
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
                opacity: visible ? 1 : 0,
                transform: visible
                  ? "translate(0, 0)"
                  : getInitialTransform(actualPlacement),
                pointerEvents: visible ? "auto" : "none",
                transition: "opacity 0.2s ease, transform 0.2s ease",
                zIndex: "var(--z-dropdown)",
              }}
              onMouseEnter={() => {
                if (!isHoverTrigger || disabled) return;
                setOpen(true);
              }}
              onMouseLeave={() => {
                if (!isHoverTrigger || disabled) return;
                setOpen(false);
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
