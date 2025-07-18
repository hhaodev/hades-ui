import { useRef, useState, useLayoutEffect, useEffect } from "react";
import Dropdown from "../Dropdown";
import Button from "../Button";
import { DropdownItem } from "../Dropdown/DropdownItem";
import { DropdownMenu } from "../Dropdown/DropdownMenu";
import Stack from "../Stack";
import EllipsisWithTooltip from "../EllipsisWithTooltip";
const DownIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const UpIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 15 12 9 18 15" />
  </svg>
);

const XIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function Select({
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  disabled = false,
  style,
  onClear,
}) {
  const selected = options.find((opt) => opt.value === value);
  const menuRef = useRef(null);
  const itemRefs = useRef({});

  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      setTimeout(() => {
        const menuEl = menuRef.current;
        const selectedEl = itemRefs.current[selected?.value];
        if (menuEl && selectedEl) {
          menuEl.scrollTop =
            selectedEl.offsetTop -
            menuEl.clientHeight / 2 +
            selectedEl.offsetHeight / 2;
        }
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [open, selected?.value]);

  return (
    <Dropdown
      placement="bottom"
      open={open}
      onOpenChange={setOpen}
      popupRender={() => (
        <DropdownMenu
          ref={(el) => {
            if (el) {
              menuRef.current = el;
            }
          }}
          style={{
            maxHeight: "400px",
            overflow: "auto",
          }}
        >
          {options.map((opt) => (
            <DropdownItem
              key={opt.value}
              ref={(el) => {
                if (el) itemRefs.current[opt.value] = el;
              }}
              onClick={() => {
                if (onChange) onChange(opt.value);
                setOpen(false);
              }}
              checked={opt.value === value}
            >
              {opt.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      )}
    >
      <Stack
        style={{
          display: "flex",
          gap: "8px",
          borderRadius: 8,
          border: "1px solid var(--hadesui-border-color)",
          width: "fit-content",
          padding: "8px 16px",
          ...style,
        }}
      >
        <EllipsisWithTooltip
          key={selected ? "selectedlabel" : "placeholder"}
          style={{
            width: "100px",
            color: selected
              ? "var( --hadesui-text-color)"
              : "var(--hadesui-placeholder-color)",
          }}
        >
          {selected ? selected.label : placeholder}
        </EllipsisWithTooltip>
        <Stack
          onClick={(e) => {
            e.stopPropagation();
            if (selected) {
              onClear?.();
              setOpen(false);
              return;
            }
            setOpen((prev) => !prev);
          }}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "var(--hadesui-placeholder-color)",
          }}
        >
          {selected ? <XIcon /> : open ? <UpIcon /> : <DownIcon />}
        </Stack>
      </Stack>
    </Dropdown>
  );
}
