import { useLayoutEffect, useRef, useState } from "react";
import Dropdown from "../Dropdown";
import { DropdownItem } from "../Dropdown/DropdownItem";
import { DropdownMenu } from "../Dropdown/DropdownMenu";
import EllipsisWithTooltip from "../EllipsisWithTooltip";
import { DownIcon, UpIcon, XIcon } from "../Icon";
import Stack from "../Stack";

export default function Select({
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  disabled = false,
  style,
  onClear,
}) {
  const [placement, setPlacement] = useState("");
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
      getPlacement={setPlacement}
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
          {selected ? (
            <XIcon />
          ) : open && !placement.startsWith("top") ? (
            <UpIcon />
          ) : (
            <DownIcon />
          )}
        </Stack>
      </Stack>
    </Dropdown>
  );
}
