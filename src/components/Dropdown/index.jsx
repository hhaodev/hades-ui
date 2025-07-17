import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Stack from "../Stack";
import { DropdownItem } from "./DropdownItem";
import { DropdownMenu } from "./DropdownMenu";
import EllipsisWithTooltip from "../EllipsisWithTooltip";

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

const fallbackPlacements = {
  "bottom-right": ["bottom-right", "bottom-left", "top-right", "top-left"],
  "bottom-left": ["bottom-left", "bottom-right", "top-left", "top-right"],
  "top-right": ["top-right", "top-left", "bottom-right", "bottom-left"],
  "top-left": ["top-left", "top-right", "bottom-left", "bottom-right"],
  "bottom-center": [
    "bottom-center",
    "top-center",
    "bottom-right",
    "bottom-left",
    "top-right",
    "top-left",
  ],
  "top-center": [
    "top-center",
    "bottom-center",
    "top-right",
    "top-left",
    "bottom-right",
    "bottom-left",
  ],
};
export default function Dropdown({
  popupRender,
  menu,
  children,
  open: controlledOpen,
  onOpenChange,
  popupStyle,
  placement: customPlacement,
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [measureReady, setMeasureReady] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [placement, setPlacement] = useState(customPlacement ?? "bottom");
  const [dropdownWidth, setDropdownWidth] = useState(undefined);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (val) => {
    if (onOpenChange) onOpenChange(val);
    else setUncontrolledOpen(val);
  };

  const hideTimeoutRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const lockRef = useRef(false);

  const show = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setMeasureReady(true);
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

    const tryPlacements = fallbackPlacements[customPlacement] ?? [
      "bottom-right",
    ];

    let finalPlacement = "bottom-right";
    let top = 0;
    let left = 0;

    for (const place of tryPlacements) {
      const [v, h] = place.split("-");

      const fitsBelow =
        triggerRect.bottom + spacing + dropdownHeight <= viewportHeight;
      const fitsAbove = triggerRect.top - spacing - dropdownHeight >= 0;

      let candidateTop = 0;
      if (v === "bottom" && fitsBelow) {
        candidateTop = triggerRect.bottom + spacing + scrollY;
      } else if (v === "top" && fitsAbove) {
        candidateTop = triggerRect.top - dropdownHeight - spacing + scrollY;
      } else {
        continue;
      }

      let candidateLeft = 0;
      if (h === "right") {
        const right =
          triggerRect.left + dropdownWidth <= viewportWidth - spacing;
        if (!right) continue;
        candidateLeft = triggerRect.left + scrollX;
      } else if (h === "left") {
        const leftFit = triggerRect.right - dropdownWidth >= spacing;
        if (!leftFit) continue;
        candidateLeft = triggerRect.right - dropdownWidth + scrollX;
      } else if (h === "center") {
        const centerX =
          triggerRect.left + triggerRect.width / 2 - dropdownWidth / 2;
        const fitsCenter =
          centerX >= spacing &&
          centerX + dropdownWidth <= viewportWidth - spacing;
        if (!fitsCenter) continue;
        candidateLeft = centerX + scrollX;
      } else {
        continue;
      }

      finalPlacement = place;
      top = candidateTop;
      left = candidateLeft;
      break;
    }

    setPlacement(finalPlacement);
    setDropdownWidth(triggerRect.width);
    setPosition({ top: Math.round(top), left: Math.round(left) });
  };

  useLayoutEffect(() => {
    if (measureReady) {
      updatePosition();
      const update = () => {
        let timeout;
        timeout = setTimeout(() => updatePosition());
        return () => clearTimeout(timeout);
      };
      update();
      requestAnimationFrame(() => {
        setShouldRender(true);
        requestAnimationFrame(() => setOpen(true));
      });
      setMeasureReady(false);
    }
  }, [measureReady]);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => updatePosition();
    const onResize = () => {
      let timeout;
      timeout = setTimeout(() => updatePosition());
      return () => clearTimeout(timeout);
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
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
        onClick={() => {
          if (lockRef.current) return;

          lockRef.current = true;
          if (open) hide();
          else show();

          setTimeout(() => {
            lockRef.current = false;
          }, 300);
        }}
      >
        {children}
      </Stack>

      {measureReady && (
        <DropdownPortal>
          <Stack
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: -9999,
              left: -9999,
              visibility: "hidden",
              pointerEvents: "none",
            }}
          >
            {popupRender ? (
              popupRender()
            ) : menu.length > 0 ? (
              <DropdownMenu>
                {menu.map((i, idx) => (
                  <DropdownItem key={idx} onClick={i?.onClick}>
                    {i?.text}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            ) : null}
          </Stack>
        </DropdownPortal>
      )}

      {shouldRender && (
        <DropdownPortal>
          <Stack
            ref={dropdownRef}
            style={{
              background: "var(--hadesui-bg-color, white)",
              boxShadow: "0 4px 16px var(--hadesui-boxshadow-color)",
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
                {menu.map((i, idx) => (
                  <DropdownItem key={idx} onClick={i?.onClick}>
                    <EllipsisWithTooltip>{i?.text}</EllipsisWithTooltip>
                  </DropdownItem>
                ))}
              </DropdownMenu>
            ) : null}
          </Stack>
        </DropdownPortal>
      )}
    </Stack>
  );
}

Dropdown.Menu = DropdownMenu;
Dropdown.Item = DropdownItem;
