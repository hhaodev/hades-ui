import { forwardRef, useEffect, useId, useMemo, useRef, useState } from "react";
import { formatDate, toDate, useMergedState, usePrevious } from "../../utils";
import Dropdown from "../Dropdown";
import Ellipsis from "../Ellipsis";
import { DownIcon, UpIcon, XIcon } from "../Icon";
import Stack from "../Stack";
import Calendar from "./Calender";

const DatePicker = forwardRef(
  (
    {
      value: valueProps,
      onChange,
      onFocus,
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
    const dateMemo = useMemo(() => toDate(valueProps), [valueProps]);
    const [finalValue, setFinalValue] = useMergedState(null, {
      value: dateMemo,
      onChange,
    });

    const prevDate = usePrevious(finalValue);

    const [isEnter, setIsEnter] = useState(false);
    const containerRef = useRef(null);

    const idGene = useId();
    const id = `dropdown-date-picker-${idGene}`;

    useEffect(() => {
      const isChanged = finalValue?.getTime() !== prevDate?.getTime();
      if (isChanged) {
        onChange(finalValue);
      }
    }, [finalValue]);

    useEffect(() => {
      if (!open && containerRef.current && !isEnter) {
        const el = containerRef.current;
        if (!disabled) {
          el.style.borderColor = "var(--hadesui-border-color)";
        }
      }
    }, [open, disabled, isEnter]);

    return (
      <Stack
        ref={(el) => {
          containerRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        tabIndex={disabled ? -1 : 0}
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
        onFocus={(e) => {
          onFocus?.(e);
          setIsEnter(true);
        }}
        onBlur={(e) => {
          onBlur?.(e);
          setIsEnter(false);
        }}
        {...rest}
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
            <div onPointerDownCapture={(e) => e.preventDefault()}>
              <Calendar
                value={finalValue}
                onSelect={(date) => {
                  setFinalValue(date);
                  setIsEnter(false);
                  setOpen(false);
                }}
                hasTimePicker={hasTimePicker}
                min={minDate}
                max={maxDate}
              />
            </div>
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
                  : finalValue
                  ? "var(--hadesui-text-color)"
                  : "var(--hadesui-placeholder-color)",
              }}
            >
              {finalValue
                ? customRender
                  ? customRender(finalValue)
                  : formatDate(finalValue, format)
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
                if (finalValue) {
                  setFinalValue(null);
                  onClear?.();
                  setOpen(false);
                } else if (open) {
                  setOpen(false);
                } else {
                  setOpen(true);
                }
              }}
            >
              {finalValue ? (
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
