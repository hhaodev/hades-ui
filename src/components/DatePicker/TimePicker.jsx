import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import Stack from "../Stack";

const range = (start, end) =>
  Array.from({ length: end - start + 1 }, (_, i) =>
    String(i + start).padStart(2, "0")
  );

const TimeColumn = ({ values, value, onChange, disabledValues = [] }) => {
  const menuRef = useRef(null);
  const itemRefs = useRef({});
  const skipScrollRef = useRef(false);

  useLayoutEffect(() => {
    if (!value || skipScrollRef.current) return;

    const frame = requestAnimationFrame(() => {
      setTimeout(() => {
        const menuEl = menuRef.current;
        const selectedEl = itemRefs.current[value];
        if (menuEl && selectedEl) {
          const relativeOffsetTop = selectedEl.offsetTop - menuEl.offsetTop;
          menuEl.scrollTop =
            relativeOffsetTop -
            menuEl.clientHeight / 2 +
            selectedEl.offsetHeight / 2;
        }
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const handleClick = (v) => {
    skipScrollRef.current = true;
    onChange(v);
    requestAnimationFrame(() => {
      skipScrollRef.current = false;
    });
  };

  return (
    <Stack
      ref={(el) => {
        if (el) menuRef.current = el;
      }}
      flexCol
      style={{
        height: "100%",
        overflowY: "auto",
        borderRadius: 4,
        padding: 4,
        textAlign: "center",
      }}
    >
      {values.map((v) => {
        const isDisabled = disabledValues.includes(v);
        const isSelected = v === value;
        return (
          <Stack
            ref={(el) => {
              if (el) itemRefs.current[v] = el;
            }}
            key={v}
            style={{
              padding: `${isDisabled ? "6px" : "4px"} 8px`,
              cursor: `${isDisabled ? "not-allowed" : "pointer"}`,
              marginBottom: `${isDisabled ? "0px" : "4px"}`,
              borderRadius: 4,
              background: isSelected
                ? "var(--hadesui-blue-6)"
                : isDisabled
                ? "linear-gradient(to right, transparent 0%, transparent 15%, var(--hadesui-bg-disable-calender) 15%, var(--hadesui-bg-disable-calender) 85%, transparent 85%, transparent 100%)"
                : "transparent",
              color:
                isDisabled && !isSelected
                  ? "var(--hadesui-text2-color)"
                  : "var(--hadesui-text-color)",
              fontSize: 14,
              transition: "color 0.2s ease, background-color 0.2s ease",
            }}
            onClick={() => !isDisabled && handleClick(v)}
            onMouseEnter={(e) => {
              if (!isSelected && !isDisabled) {
                e.currentTarget.style.background = "var(--hadesui-bg-btn-text)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected && !isDisabled) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            {v}
          </Stack>
        );
      })}
    </Stack>
  );
};

const TimePicker = ({ value, onChange, min, max }) => {
  const [time, setTime] = useState({ hour: "00", minute: "00", second: "00" });

  useEffect(() => {
    if (value instanceof Date) {
      setTime({
        hour: String(value.getHours()).padStart(2, "0"),
        minute: String(value.getMinutes()).padStart(2, "0"),
        second: String(value.getSeconds()).padStart(2, "0"),
      });
    }
  }, [value]);

  const getDisabled = () => {
    if (!(value instanceof Date)) return {};

    const disabled = { hours: [], minutes: [], seconds: [] };

    if (min) {
      const minDate = new Date(min);
      if (value < minDate) {
        disabled.hours = range(0, 23);
        disabled.minutes = range(0, 59);
        disabled.seconds = range(0, 59);
      } else if (
        value.getFullYear() === minDate.getFullYear() &&
        value.getMonth() === minDate.getMonth() &&
        value.getDate() === minDate.getDate()
      ) {
        for (let h = 0; h < minDate.getHours(); h++)
          disabled.hours.push(String(h).padStart(2, "0"));
        if (value.getHours() === minDate.getHours()) {
          for (let m = 0; m < minDate.getMinutes(); m++)
            disabled.minutes.push(String(m).padStart(2, "0"));
          if (value.getMinutes() === minDate.getMinutes()) {
            for (let s = 0; s < minDate.getSeconds(); s++)
              disabled.seconds.push(String(s).padStart(2, "0"));
          }
        }
      }
    }

    if (max) {
      const maxDate = new Date(max);
      if (value > maxDate) {
        disabled.hours = range(0, 23);
        disabled.minutes = range(0, 59);
        disabled.seconds = range(0, 59);
      } else if (
        value.getFullYear() === maxDate.getFullYear() &&
        value.getMonth() === maxDate.getMonth() &&
        value.getDate() === maxDate.getDate()
      ) {
        for (let h = maxDate.getHours() + 1; h < 24; h++)
          disabled.hours.push(String(h).padStart(2, "0"));
        if (value.getHours() === maxDate.getHours()) {
          for (let m = maxDate.getMinutes() + 1; m < 60; m++)
            disabled.minutes.push(String(m).padStart(2, "0"));
          if (value.getMinutes() === maxDate.getMinutes()) {
            for (let s = maxDate.getSeconds() + 1; s < 60; s++)
              disabled.seconds.push(String(s).padStart(2, "0"));
          }
        }
      }
    }

    return disabled;
  };

  const disabled = getDisabled();

  const update = (h, m, s) => {
    if (!(value instanceof Date)) return;
    const newDate = new Date(value);
    newDate.setHours(Number(h));
    newDate.setMinutes(Number(m));
    newDate.setSeconds(Number(s));
    onChange?.(newDate);
  };

  return (
    <Stack flexCol style={{ padding: 16, height: "100%" }}>
      <Stack
        style={{ fontSize: 14, textAlign: "center", width: "100%", height: 20 }}
      >
        {`${time.hour} : ${time.minute} : ${time.second}`}
      </Stack>
      <Stack flex gap={8} style={{ height: "calc(100% - 20px)" }}>
        <TimeColumn
          values={range(0, 23)}
          value={time.hour}
          onChange={(v) => {
            const newTime = { ...time, hour: v };
            setTime(newTime);
            update(v, newTime.minute, newTime.second);
          }}
          disabledValues={disabled.hours}
        />
        <TimeColumn
          values={range(0, 59)}
          value={time.minute}
          onChange={(v) => {
            const newTime = { ...time, minute: v };
            setTime(newTime);
            update(newTime.hour, v, newTime.second);
          }}
          disabledValues={disabled.minutes}
        />
        <TimeColumn
          values={range(0, 59)}
          value={time.second}
          onChange={(v) => {
            const newTime = { ...time, second: v };
            setTime(newTime);
            update(newTime.hour, newTime.minute, v);
          }}
          disabledValues={disabled.seconds}
        />
      </Stack>
    </Stack>
  );
};

export default TimePicker;
