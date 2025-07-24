import { forwardRef, useRef, useState } from "react";
import Dropdown from "../Dropdown";
import { DropdownMenu } from "../Dropdown/DropdownMenu";
import Ellipsis from "../Ellipsis";
import { DownIcon, UpIcon, XIcon } from "../Icon";
import Stack from "../Stack";
import Calendar from "./Calender";
import { formatDate } from "../../utils";

const DatePicker = forwardRef(
  (
    {
      value,
      onChange,
      onBlur,
      name,
      placeholder = "Select...",
      disabled = false,
      style,
      onClear,
      ...rest
    },
    ref
  ) => {
    const [placement, setPlacement] = useState("");
    const [open, setOpen] = useState(false);
    const [valueInternal, setValueInternal] = useState("");

    return (
      <Dropdown
        fixedWidthPopup={false}
        placement="bottom"
        open={open}
        onOpenChange={setOpen}
        getPlacement={setPlacement}
        popupRender={() => (
          <Stack>
            <Calendar
              value={valueInternal}
              onSelect={(date) => {
                setValueInternal(date);
                onChange?.(date);
                setOpen(false);
              }}
            />
          </Stack>
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
            style={{
              color: valueInternal
                ? "var(--hadesui-text-color)"
                : "var(--hadesui-placeholder-color)",
            }}
          >
            {valueInternal
              ? formatDate(valueInternal, "DD-MM-YYYY hh:mm:ss")
              : placeholder}
          </Ellipsis>
          <Stack
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
              } else {
                setOpen((prev) => !prev);
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
    );
  }
);

DatePicker.displayName = "DatePicker";
export default DatePicker;
