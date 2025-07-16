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
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const viewportHeight = window.innerHeight;

    const dropdownWidth = triggerRect.width;
    const estimatedDropdownHeight = dropdownEl.scrollHeight || 200;

    const fitsBelow =
      triggerRect.bottom + spacing + estimatedDropdownHeight <= viewportHeight;
    const fitsAbove = triggerRect.top - spacing - estimatedDropdownHeight >= 0;

    let top;
    if (fitsBelow) {
      top = triggerRect.bottom + spacing + scrollY;
      setPlacement("bottom");
    } else if (fitsAbove) {
      top = triggerRect.top - estimatedDropdownHeight - spacing + scrollY;
      setPlacement("top");
    } else {
      top = triggerRect.bottom + spacing + scrollY;
      setPlacement("bottom");
    }

    let left = triggerRect.left + scrollX;

    setDropdownWidth(dropdownWidth);
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
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
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
                : placement === "bottom"
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
