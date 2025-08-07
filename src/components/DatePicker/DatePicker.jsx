import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { formatDate } from "../../utils";
import Dropdown from "../Dropdown";
import Ellipsis from "../Ellipsis";
import { DownIcon, UpIcon, XIcon } from "../Icon";
import Stack from "../Stack";
import Calendar from "./Calender";

const DatePicker = forwardRef(
  (
    {
      value,
      onChange,
      onBlur,
      name,
      placeholder = "Select date...",
      disabled = false,
      style,
      onClear,
      placement: placementProps = "bottom-start",
      hasTimePicker,
      format,
      minDate,
      maxDate,
      customRender, // ()=>jsx
      ...rest
    },
    ref
  ) => {
    const [placement, setPlacement] = useState("");
    const [open, setOpen] = useState(false);
    const [valueInternal, setValueInternal] = useState(null);
    const containerRef = useRef(null);

    const idGene = useId();
    const id = `dropdown-date-picker-${idGene}`;

    useEffect(() => {
      if (!open && containerRef.current) {
        const el = containerRef.current;
        if (!disabled) {
          el.style.borderColor = "var(--hadesui-border-color)";
        }
      }
    }, [open]);

    return (
      <Stack
        ref={(el) => {
          containerRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        tabIndex={0}
        data-border-red-error={rest["data-border-red-error"]}
        data-disabled-action={disabled}
        flex
        wfull
        gap={8}
        align="center"
        style={{
          width: "100%",
          borderRadius: 8,
          border: "1px solid var(--hadesui-border-color)",
          fontSize: 14,
          height: 36,
          background: disabled
            ? "var(--hadesui-bg-disabled-color)"
            : "transparent",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "border-color 0.2s ease",
          ...style,
        }}
        onMouseEnter={(e) => {
          if (!disabled && !open) {
            e.currentTarget.style.borderColor = "var(--hadesui-blue-6)";
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !open) {
            e.currentTarget.style.borderColor = "var(--hadesui-border-color)";
          }
        }}
      >
        <Dropdown
          id={id}
          open={open}
          onOpenChange={setOpen}
          disabled={disabled}
          fixedWidthPopup={false}
          placement={placementProps}
          getPlacement={setPlacement}
          menu={() => (
            <Calendar
              value={valueInternal}
              onSelect={(date) => {
                setValueInternal(date);
                onChange?.(date);
                setOpen(false);
              }}
              hasTimePicker={hasTimePicker}
              min={minDate}
              max={maxDate}
            />
          )}
        >
          <Stack
            tabIndex={0}
            flex
            gap={8}
            align="center"
            style={{ flex: 1, height: "100%", minWidth: 0, padding: "0px 8px" }}
          >
            <Ellipsis
              style={{
                width: "100%",
                color: disabled
                  ? "inherit"
                  : valueInternal
                  ? "var(--hadesui-text-color)"
                  : "var(--hadesui-placeholder-color)",
              }}
            >
              {valueInternal
                ? customRender
                  ? customRender(valueInternal)
                  : formatDate(valueInternal, format)
                : placeholder}
            </Ellipsis>
            <Stack
              data-toggle-for={id}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "var(--hadesui-placeholder-color)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (disabled) return;
                if (valueInternal) {
                  onChange?.("");
                  onClear?.();
                  setValueInternal("");
                  setOpen(false);
                } else if (open) {
                  setOpen(false);
                } else {
                  setOpen(true);
                }
              }}
            >
              {valueInternal ? (
                <XIcon />
              ) : open && !placement.startsWith("top") ? (
                <UpIcon />
              ) : (
                <DownIcon />
              )}
            </Stack>
          </Stack>
        </Dropdown>
      </Stack>
    );
  }
);

DatePicker.displayName = "DatePicker";
export default DatePicker;
