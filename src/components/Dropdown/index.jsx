import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Stack from "../Stack";
import { DropdownItem } from "./DropdownItem";
import { DropdownMenu } from "./DropdownMenu";

function DropdownPortal({ children }) {
  const portalNodeRef = useRef(null);

  if (!portalNodeRef.current) {
    const div = document.createElement("div");
    div.setAttribute("data-dropdown-portal", "true");
    document.body?.appendChild(div);
    portalNodeRef.current = div;
  }

  useEffect(() => {
    return () => {
      if (portalNodeRef.current) {
        document.body?.removeChild(portalNodeRef.current);
      }
    };
  }, []);

  return createPortal(children, portalNodeRef.current);
}

export default function Dropdown({
  popupRender,
  menu,
  children,
  open: controlledOpen,
  onOpenChange,
  popupStyle,
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [placement, setPlacement] = useState("bottom");
  const [dropdownWidth, setDropdownWidth] = useState(undefined);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (val) => {
    if (onOpenChange) onOpenChange(val);
    else setUncontrolledOpen(val);
  };

  const hideTimeoutRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  const show = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setShouldRender(true);
    requestAnimationFrame(() => setOpen(true));
  };

  const hide = () => {
    setOpen(false);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setShouldRender(false);
      hideTimeoutRef.current = null;
    }, 200);
  };

  const updatePosition = () => {
    const triggerEl = triggerRef.current;
    const dropdownEl = dropdownRef.current;
    if (!triggerEl || !dropdownEl) return;

    const spacing = 8;
    const triggerRect = triggerEl.getBoundingClientRect();
    const dropdownRect = dropdownEl.getBoundingClientRect();

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const dropdownWidth = dropdownRect.width || triggerRect.width;
    const dropdownHeight = dropdownRect.height || 200;

    let top, verticalPlacement;
    const fitsBelow =
      triggerRect.bottom + spacing + dropdownHeight <= viewportHeight;
    const fitsAbove = triggerRect.top - spacing - dropdownHeight >= 0;

    if (fitsBelow) {
      top = triggerRect.bottom + spacing + scrollY;
      verticalPlacement = "bottom";
    } else if (fitsAbove) {
      top = triggerRect.top - dropdownHeight - spacing + scrollY;
      verticalPlacement = "top";
    } else {
      top =
        Math.max(spacing, viewportHeight - dropdownHeight - spacing) + scrollY;
      verticalPlacement = "bottom";
    }

    let left, horizontalPlacement;
    const fitsRight =
      triggerRect.left + dropdownWidth <= viewportWidth - spacing;
    const fitsLeft = triggerRect.right - dropdownWidth >= spacing;

    if (fitsRight) {
      left = triggerRect.left + scrollX;
      horizontalPlacement = "left";
    } else if (fitsLeft) {
      left = triggerRect.right - dropdownWidth + scrollX;
      horizontalPlacement = "right";
    } else {
      left = Math.max(
        spacing,
        Math.min(
          triggerRect.left + scrollX,
          viewportWidth - dropdownWidth - spacing
        )
      );
      horizontalPlacement = "left";
    }

    setPlacement(`${verticalPlacement}-${horizontalPlacement}`);
    setDropdownWidth(triggerRect.width);
    setPosition({ top: Math.round(top), left: Math.round(left) });
  };

  useLayoutEffect(() => {
    if (shouldRender) {
      updatePosition();
    }
  }, [shouldRender]);

  useEffect(() => {
    if (!open) return;
    const handler = () => updatePosition();
    const hidePopup = () => hide();
    window.addEventListener("resize", hidePopup);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", hidePopup);
      window.removeEventListener("scroll", handler, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (
        !triggerRef.current?.contains(e.target) &&
        !dropdownRef.current?.contains(e.target)
      ) {
        hide();
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  return (
    <Stack>
      <Stack
        ref={triggerRef}
        style={{
          height: "fit-content",
          width: "fit-content",
          cursor: "pointer",
        }}
        onClick={() => (open ? hide() : show())}
      >
        {children}
      </Stack>

      {shouldRender && (
        <DropdownPortal>
          <Stack
            ref={dropdownRef}
            style={{
              background: "var(--hadesui-bg-color, white)",
              border: "1px solid var(--hadesui-border-color, #ccc)",
              boxShadow: "1px 1px 4px 1px var(--hadesui-boxshadow-color)",
              borderRadius: 8,
              width: dropdownWidth,
              ...popupStyle,
              position: "absolute",
              overflow: "hidden",
              top: position.top,
              left: position.left,
              minWidth: 120,
              opacity: open ? 1 : 0,
              pointerEvents: open ? "auto" : "none",
              transform: open
                ? "translateY(0)"
                : placement.startsWith("bottom")
                ? "translateY(-4px)"
                : "translateY(4px)",
              transition: "opacity 0.2s ease, transform 0.2s ease",
            }}
            onMouseUp={(e) => {
              if (e.button === 0) {
                hide();
              }
            }}
          >
            {popupRender ? (
              popupRender()
            ) : menu.length > 0 ? (
              <DropdownMenu>
                {menu?.map((i, idx) => (
                  <DropdownItem key={idx} onClick={i?.onClick}>
                    {i?.text}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            ) : (
              <React.Fragment />
            )}
          </Stack>
        </DropdownPortal>
      )}
    </Stack>
  );
}

Dropdown.Menu = DropdownMenu;
Dropdown.Item = DropdownItem;
