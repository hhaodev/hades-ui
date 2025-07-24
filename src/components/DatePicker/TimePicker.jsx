import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import Stack from "../Stack";

const range = (start, end) =>
  Array.from({ length: end - start + 1 }, (_, i) =>
    String(i + start).padStart(2, "0")
  );

const TimeColumn = ({ values, value, onChange }) => {
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
      gap={4}
      style={{
        height: "100%",
        overflowY: "auto",
        borderRadius: 4,
        padding: 4,
        textAlign: "center",
      }}
    >
      {values.map((v) => (
        <Stack
          ref={(el) => {
            if (el) itemRefs.current[v] = el;
          }}
          key={v}
          style={{
            padding: "4px 8px",
            cursor: "pointer",
            borderRadius: 4,
            backgroundColor:
              v === value ? "var(--hadesui-blue-6)" : "transparent",
            color: "var(--hadesui-text-color)",
            fontSize: 14,
          }}
          onClick={() => handleClick(v)}
          onMouseEnter={(e) => {
            if (v !== value) {
              e.currentTarget.style.background = "var(--hadesui-bg-btn-text)";
            }
          }}
          onMouseLeave={(e) => {
            if (v !== value) {
              e.currentTarget.style.background = "transparent";
            }
          }}
        >
          {v}
        </Stack>
      ))}
    </Stack>
  );
};

const TimePicker = ({ value, onChange }) => {
  const [time, setTime] = useState({
    hour: "00",
    minute: "00",
    second: "00",
  });

  useEffect(() => {
    if (value instanceof Date) {
      setTime({
        hour: String(value.getHours()).padStart(2, "0"),
        minute: String(value.getMinutes()).padStart(2, "0"),
        second: String(value.getSeconds()).padStart(2, "0"),
      });
    }
  }, [value]);

  const update = (h, m, s) => {
    if (!(value instanceof Date)) return;

    const newDate = new Date(value);
    newDate.setHours(Number(h));
    newDate.setMinutes(Number(m));
    newDate.setSeconds(Number(s));

    onChange?.(newDate);
  };

  const renderTime = () => (
    <Stack
      style={{
        fontSize: 14,
        textAlign: "center",
        width: "100%",
        height: "20px",
      }}
    >
      {`${time.hour} : ${time.minute} : ${time.second}`}
    </Stack>
  );

  return (
    <Stack
      flexCol
      style={{
        padding: 16,
        height: "100%",
      }}
    >
      <Stack>{renderTime()}</Stack>
      <Stack
        flex
        gap={8}
        style={{
          height: "calc(100% - 20px)",
        }}
      >
        <TimeColumn
          values={range(0, 23)}
          value={time.hour}
          onChange={(v) => {
            const newTime = { ...time, hour: v };
            setTime(newTime);
            update(v, newTime.minute, newTime.second);
          }}
        />
        <TimeColumn
          values={range(0, 59)}
          value={time.minute}
          onChange={(v) => {
            const newTime = { ...time, minute: v };
            setTime(newTime);
            update(newTime.hour, v, newTime.second);
          }}
        />
        <TimeColumn
          values={range(0, 59)}
          value={time.second}
          onChange={(v) => {
            const newTime = { ...time, second: v };
            setTime(newTime);
            update(newTime.hour, newTime.minute, v);
          }}
        />
      </Stack>
    </Stack>
  );
};

export default TimePicker;
