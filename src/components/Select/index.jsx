import React, { forwardRef, useLayoutEffect, useRef, useState } from "react";
import Dropdown from "../Dropdown";
import { DropdownItem } from "../Dropdown/DropdownItem";
import { DropdownMenu } from "../Dropdown/DropdownMenu";
import Ellipsis from "../Ellipsis";
import { DownIcon, UpIcon, XIcon } from "../Icon";
import Stack from "../Stack";

const Select = forwardRef(
  (
    {
      value,
      onChange,
      onBlur,
      name,
      options = [],
      placeholder = "Select...",
      disabled = false,
      style,
      onClear,
      ...rest
    },
    ref
  ) => {
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
        onClickOutSide={() => {
          onBlur?.();
          setOpen(false);
        }}
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
                onClick={(e) => {
                  e.preventDefault();
                  onChange?.(opt.value);
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
          data-border-red-error={rest["data-border-red-error"]}
          ref={ref}
          tabIndex={0}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: "100%",
            borderRadius: 8,
            border: "1px solid var(--hadesui-border-color)",
            padding: "0px 8px",
            fontSize: 14,
            height: 36,
            cursor: disabled ? "not-allowed" : "pointer",
            ...style,
          }}
        >
          <Ellipsis
            key={selected ? "selectedlabel" : "placeholder"}
            style={{
              color: selected
                ? "var(--hadesui-text-color)"
                : "var(--hadesui-placeholder-color)",
            }}
          >
            {selected ? selected.label : placeholder}
          </Ellipsis>
          <Stack
            onClick={(e) => {
              e.stopPropagation();
              if (disabled) return;
              if (selected) {
                onChange?.("");
                onClear?.();
                setOpen(false);
              } else {
                setOpen((prev) => !prev);
              }
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
);

Select.displayName = "Select";
export default Select;
