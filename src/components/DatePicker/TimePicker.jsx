import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import Stack from "../Stack";

const range = (start, end) =>
  Array.from({ length: end - start + 1 }, (_, i) =>
    String(i + start).padStart(2, "0")
  );

const TimeColumn = ({ values, value, onChange }) => {
  const menuRef = useRef(null);
  const itemRefs = useRef({});
  const didScroll = useRef(false);

  useLayoutEffect(() => {
    if (!value || didScroll.current) return;
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
        didScroll.current = true;
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [value]);

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
          onClick={() => onChange(v)}
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
  const [hour, setHour] = useState("00");
  const [minute, setMinute] = useState("00");
  const [second, setSecond] = useState("00");

  useEffect(() => {
    if (value instanceof Date) {
      setHour(String(value.getHours()).padStart(2, "0"));
      setMinute(String(value.getMinutes()).padStart(2, "0"));
      setSecond(String(value.getSeconds()).padStart(2, "0"));
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

  const renderTime = () => {
    return (
      <Stack
        style={{
          fontSize: 14,
          textAlign: "center",
          width: "100%",
          height: "20px",
        }}
      >{`${hour} : ${minute} : ${second}`}</Stack>
    );
  };

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
          value={hour}
          onChange={(v) => {
            setHour(v);
            update(v, minute, second);
          }}
        />
        <TimeColumn
          values={range(0, 59)}
          value={minute}
          onChange={(v) => {
            setMinute(v);
            update(hour, v, second);
          }}
        />
        <TimeColumn
          values={range(0, 59)}
          value={second}
          onChange={(v) => {
            setSecond(v);
            update(hour, minute, v);
          }}
        />
      </Stack>
    </Stack>
  );
};

export default TimePicker;
