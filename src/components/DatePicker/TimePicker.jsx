import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Stack from "../Stack";

const range = (start, end) =>
  Array.from({ length: end - start + 1 }, (_, i) =>
    String(i + start).padStart(2, "0")
  );

const isSameDate = (a, b) =>
  a?.getFullYear() === b?.getFullYear() &&
  a?.getMonth() === b?.getMonth() &&
  a?.getDate() === b?.getDate();

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

const TimePicker = ({ value, onChange, min, max, currentDate }) => {
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

  const update = (h, m, s) => {
    const newDate = new Date(value);
    newDate.setHours(Number(h));
    newDate.setMinutes(Number(m));
    newDate.setSeconds(Number(s));
    onChange?.(newDate);
  };

  const disabled = {
    hours: [],
    minutes: [],
    seconds: [],
  };

  if (value instanceof Date && currentDate) {
    if (min instanceof Date && isSameDate(currentDate, min)) {
      const minH = min.getHours();
      const minM = min.getMinutes();
      const minS = min.getSeconds();

      disabled.hours.push(...range(0, minH - 1));
      if (Number(time.hour) === minH) {
        disabled.minutes.push(...range(0, minM - 1));
        if (Number(time.minute) === minM) {
          disabled.seconds.push(...range(0, minS - 1));
        }
      }
    }

    if (max instanceof Date && isSameDate(currentDate, max)) {
      const maxH = max.getHours();
      const maxM = max.getMinutes();
      const maxS = max.getSeconds();

      disabled.hours.push(...range(maxH + 1, 23));
      if (Number(time.hour) === maxH) {
        disabled.minutes.push(...range(maxM + 1, 59));
        if (Number(time.minute) === maxM) {
          disabled.seconds.push(...range(maxS + 1, 59));
        }
      }
    }
  }

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
