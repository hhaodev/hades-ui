import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { formatDate, usePrevious } from "../../utils";
import Divider from "../Divider";
import Dropdown from "../Dropdown";
import Ellipsis from "../Ellipsis";
import { DownIcon, UpIcon, XIcon } from "../Icon";
import Stack from "../Stack";
import Calendar from "./Calender";

const DateRangePicker = forwardRef(
  (
    {
      value,
      onChange,
      onBlur,
      name,
      disabled = false,
      style,
      onClear,
      placement: placementProps = "bottom-start",
      hasTimePicker,
      // layout = "vertical",
      layout = "horizontal",
      format,
      customRenderFrom, // ()=>jsx
      customRenderTo, // ()=>jsx
      ...rest
    },
    ref
  ) => {
    const [placement, setPlacement] = useState(placementProps);
    const [openStart, setOpenStart] = useState(false);
    const [openEnd, setOpenEnd] = useState(false);
    const [startDate, setStartDate] = useState(
      value?.start ? new Date(value?.start) : null
    );
    const [endDate, setEndDate] = useState(
      value?.end ? new Date(value?.end) : null
    );

    const [isFocus, setIsFocus] = useState(false);

    const prevStart = usePrevious(startDate);
    const prevEnd = usePrevious(endDate);

    const containerRef = useRef(null);

    const idGene = useId();
    const id = `dropdown-date-range-picker-${idGene}`;

    useEffect(() => {
      if (!isFocus && containerRef.current) {
        const el = containerRef.current;
        el.style.borderColor = "var(--hadesui-border-color)";
      }
    }, [isFocus]);

    useEffect(() => {
      const bothDefined = startDate instanceof Date && endDate instanceof Date;
      const isChanged =
        startDate?.getTime() !== prevStart?.getTime() ||
        endDate?.getTime() !== prevEnd?.getTime();
      const bothNull = !startDate && !endDate;
      if ((bothDefined || bothNull) && isChanged) {
        onChange?.(bothNull ? null : { start: startDate, end: endDate });
        setIsFocus(false);
      }
    }, [startDate, endDate]);

    useEffect(() => {
      const newStart = value?.start ? new Date(value.start) : null;
      const newEnd = value?.end ? new Date(value.end) : null;

      if (
        (newStart?.getTime?.() ?? 0) !== (startDate?.getTime?.() ?? 0) ||
        (newEnd?.getTime?.() ?? 0) !== (endDate?.getTime?.() ?? 0)
      ) {
        setStartDate(newStart);
        setEndDate(newEnd);
      }
    }, [value]);

    useEffect(() => {
      const handleClickOutside = (event) => {
        const container = containerRef.current;
        const dropdown = document.getElementById("dropdown-date-range-picker");
        const clickedInDropdown = dropdown && dropdown.contains(event.target);
        if (
          container &&
          !container.contains(event.target) &&
          !clickedInDropdown
        ) {
          setIsFocus(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

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
          padding: "0px 8px",
          fontSize: 14,
          ...(layout === "horizontal" ? { height: 36 } : { height: "100%" }),
          background: disabled
            ? "var(--hadesui-bg-disabled-color)"
            : "transparent",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "border-color 0.2s ease",
          ...style,
        }}
        onMouseEnter={(e) => {
          if (!disabled && !isFocus) {
            e.currentTarget.style.borderColor = "var(--hadesui-blue-6)";
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isFocus) {
            e.currentTarget.style.borderColor = "var(--hadesui-border-color)";
          }
        }}
      >
        <Stack
          flex={layout === "horizontal"}
          flexCol={layout === "vertical"}
          align="center"
          style={{ flex: 1, minWidth: 0, height: "100%" }}
        >
          <Dropdown
            id={id}
            disabled={disabled}
            fixedWidthPopup={false}
            placement={placementProps}
            open={openStart}
            onOpenChange={setOpenStart}
            getPlacement={setPlacement}
            menu={
              <Calendar
                inRangePicker
                hasTimePicker={hasTimePicker}
                value={startDate}
                onSelect={(date) => {
                  setStartDate(date);
                  if (!endDate) {
                    setOpenEnd(true);
                    setOpenStart(false);
                  } else {
                    setOpenStart(false);
                  }
                }}
                max={endDate}
              />
            }
          >
            <Stack
              tabIndex={0}
              flex
              gap={8}
              align="center"
              style={{
                flex: 1,
                minWidth: 0,
                ...(layout === "horizontal"
                  ? { minHeight: openStart ? "calc(100% - 5px)" : "100%" }
                  : { minHeight: "36px", width: "100%", margin: "2px 0px" }),
                ...(placement.startsWith("top")
                  ? {
                      borderTop: openStart
                        ? "2px solid var(--hadesui-blue-6)"
                        : "",
                    }
                  : {
                      borderBottom: openStart
                        ? "2px solid var(--hadesui-blue-6)"
                        : "",
                    }),
                transition: "border 0.05s ease",
              }}
              onClick={() => setIsFocus(true)}
            >
              <Ellipsis
                style={{
                  color: disabled
                    ? "inherit"
                    : startDate
                    ? "var(--hadesui-text-color)"
                    : "var(--hadesui-placeholder-color)",
                }}
              >
                {startDate
                  ? customRenderFrom
                    ? customRenderFrom(startDate)
                    : `From: ${formatDate(startDate, format)}`
                  : "From"}
              </Ellipsis>
            </Stack>
          </Dropdown>
          <Divider
            vertical={layout === "horizontal"}
            style={{
              ...(layout === "horizontal" ? { height: 20 } : {}),
              ...(layout === "vertical"
                ? { marginTop: 0, marginBottom: 0 }
                : {}),
            }}
          />
          <Dropdown
            id={id}
            disabled={disabled}
            fixedWidthPopup={false}
            placement={placementProps}
            open={openEnd}
            onOpenChange={setOpenEnd}
            getPlacement={setPlacement}
            menu={
              <Calendar
                inRangePicker
                hasTimePicker={hasTimePicker}
                value={endDate}
                onSelect={(date) => {
                  setEndDate(date);
                  if (!startDate) {
                    setOpenStart(true);
                    setOpenEnd(false);
                  } else {
                    setOpenEnd(false);
                  }
                }}
                min={startDate}
              />
            }
          >
            <Stack
              tabIndex={0}
              flex
              gap={8}
              align="center"
              style={{
                flex: 1,
                minWidth: 0,
                ...(layout === "horizontal"
                  ? { height: openEnd ? "calc(100% - 5px)" : "100%" }
                  : { minHeight: "36px", width: "100%", margin: "2px 0px" }),
                ...(placement.startsWith("top")
                  ? {
                      borderTop: openEnd
                        ? "2px solid var(--hadesui-blue-6)"
                        : "",
                    }
                  : {
                      borderBottom: openEnd
                        ? "2px solid var(--hadesui-blue-6)"
                        : "",
                    }),
                transition: "border 0.05s ease",
              }}
              onClick={() => setIsFocus(true)}
            >
              <Ellipsis
                style={{
                  color: disabled
                    ? "inherit"
                    : endDate
                    ? "var(--hadesui-text-color)"
                    : "var(--hadesui-placeholder-color)",
                }}
              >
                {endDate
                  ? customRenderTo
                    ? customRenderTo(endDate)
                    : `To: ${formatDate(endDate, format)}`
                  : "To"}
              </Ellipsis>
            </Stack>
          </Dropdown>
        </Stack>
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
            if (endDate && startDate) {
              setStartDate(null);
              setEndDate(null);
              setOpenStart(false);
              setOpenEnd(false);
            }
            if (!startDate && (openEnd || openStart)) {
              setOpenStart(false);
              setOpenEnd(false);
            } else if (!openStart && !startDate) {
              setOpenStart(true);
            } else if (!endDate && (openEnd || openStart)) {
              setOpenStart(false);
              setOpenEnd(false);
            } else if (!openEnd && !endDate) {
              setOpenEnd(false);
            }
          }}
        >
          {endDate && startDate ? (
            <XIcon />
          ) : (openEnd || openStart) && !placement.startsWith("top") ? (
            <UpIcon />
          ) : (
            <DownIcon />
          )}
        </Stack>
      </Stack>
    );
  }
);

DateRangePicker.displayName = "DateRangePicker";
export default DateRangePicker;
