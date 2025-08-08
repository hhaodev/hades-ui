import React, { useState } from "react";
import Button from "../Button";
import { DoubleLeftIcon, DoubleRightIcon, LeftIcon, RightIcon } from "../Icon";
import Stack from "../Stack";
import TimePicker from "./TimePicker";
import Divider from "../Divider";
import { toDate } from "../../utils";

function Calendar({
  value,
  onSelect,
  hasTimePicker,
  min,
  // = new Date(2025, 6, 25, 16, 58, 0)
  max,
  // = new Date(2025, 6, 28, 0, 1, 0)
  inRangePicker,
}) {
  const today = new Date();
  const initialDate = toDate(value);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTime, setSelectedTime] = useState(initialDate);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(
      (initialDate || today).getFullYear(),
      (initialDate || today).getMonth(),
      1
    )
  );
  const [mode, setMode] = useState("date");

  const goToMonth = (offset) => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
    );
  };

  const goToYear = (offset) => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear() + offset, prev.getMonth(), 1)
    );
  };

  const handleSelectDate = (date) => {
    if (!date) return;
    setSelectedDate(date);
    if (!selectedTime) {
      const defaultTime = new Date(date);
      defaultTime.setHours(0, 0, 0, 0);
      setSelectedTime(defaultTime);
    } else {
      const newDateTime = new Date(date);
      newDateTime.setHours(
        selectedTime.getHours(),
        selectedTime.getMinutes(),
        selectedTime.getSeconds(),
        selectedTime.getMilliseconds()
      );
      setSelectedTime(newDateTime);
    }
  };

  const handleSelectMonth = (monthIndex) => {
    const newMonth = new Date(currentMonth.getFullYear(), monthIndex, 1);
    setCurrentMonth(newMonth);
    setMode("date");
  };

  const handleChangeTime = (time) => {
    const newDate = new Date(selectedTime);
    newDate.setHours(time.getHours());
    newDate.setMinutes(time.getMinutes());
    newDate.setSeconds(time.getSeconds());

    setSelectedTime?.(newDate);
  };

  const renderMonthPicker = () => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return (
      <Stack
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          marginTop: 12,
        }}
      >
        {monthNames.map((m, i) => (
          <Stack
            key={m}
            onClick={() => handleSelectMonth(i)}
            style={{
              padding: "18px",
              fontSize: 14,
              backgroundColor:
                i === currentMonth.getMonth()
                  ? "var(--hadesui-blue-6)"
                  : "transparent",
              color: "var(--hadesui-text-color)",
              borderRadius: 8,
              cursor: "pointer",
              textAlign: "center",
              transition: "color 0.2s ease, background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (i !== currentMonth.getMonth()) {
                e.currentTarget.style.background = "var(--hadesui-bg-btn-text)";
              }
            }}
            onMouseLeave={(e) => {
              if (i !== currentMonth.getMonth()) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            {m}
          </Stack>
        ))}
      </Stack>
    );
  };

  const isDateBetween = (date, min, max) => {
    if (!(date instanceof Date)) return false;

    const time = date.getTime();
    const minTime = min instanceof Date ? min.getTime() : -Infinity;
    const maxTime = max instanceof Date ? max.getTime() : Infinity;

    return time >= minTime && time <= maxTime;
  };

  const isMergedValid = () => {
    if (!selectedDate || !selectedTime) return false;

    const merged = new Date(selectedDate);
    merged.setHours(
      selectedTime.getHours(),
      selectedTime.getMinutes(),
      selectedTime.getSeconds()
    );

    return isDateBetween(merged, min, max);
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  function isDateInRange(date) {
    if (!date) return false;

    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (hasTimePicker) {
      if (min) {
        const minDateOnly = new Date(
          min.getFullYear(),
          min.getMonth(),
          min.getDate()
        );

        if (dateOnly.getTime() === minDateOnly.getTime()) {
          const dateWithMaxTime = new Date(dateOnly);
          dateWithMaxTime.setHours(23, 59, 59, 999);
          if (dateWithMaxTime.getTime() < min.getTime()) return false;
        } else if (dateOnly.getTime() < minDateOnly.getTime()) {
          return false;
        }
      }

      if (max) {
        const maxDateOnly = new Date(
          max.getFullYear(),
          max.getMonth(),
          max.getDate()
        );

        if (dateOnly.getTime() === maxDateOnly.getTime()) {
          const dateWithMinTime = new Date(dateOnly);
          dateWithMinTime.setHours(0, 0, 0, 0);
          if (dateWithMinTime.getTime() > max.getTime()) return false;
        } else if (dateOnly.getTime() > maxDateOnly.getTime()) {
          return false;
        }
      }

      return true;
    } else {
      const minDateOnly = min
        ? new Date(min.getFullYear(), min.getMonth(), min.getDate())
        : null;
      const maxDateOnly = max
        ? new Date(max.getFullYear(), max.getMonth(), max.getDate())
        : null;

      if (minDateOnly && dateOnly < minDateOnly) return false;
      if (maxDateOnly && dateOnly > maxDateOnly) return false;

      return true;
    }
  }

  function isInHoverRangeSpan(date, hoverDate, min, max) {
    if (!(date instanceof Date) || !(hoverDate instanceof Date)) return false;

    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const h = new Date(
      hoverDate.getFullYear(),
      hoverDate.getMonth(),
      hoverDate.getDate()
    );

    if (min instanceof Date) {
      const m = new Date(min.getFullYear(), min.getMonth(), min.getDate());
      const start = m < h ? m : h;
      const end = m < h ? h : m;
      return d >= start && d <= end;
    }

    if (max instanceof Date) {
      const m = new Date(max.getFullYear(), max.getMonth(), max.getDate());
      const start = h < m ? h : m;
      const end = h < m ? m : h;
      return d >= start && d <= end;
    }

    return false;
  }

  const getWeeks = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const startDay = new Date(year, month, 1).getDay();

    const weeks = [];
    let day = 1 - startDay;

    for (let w = 0; w < 6; w++) {
      const week = [];

      for (let d = 0; d < 7; d++, day++) {
        const date = new Date(year, month, day);
        const today = isToday(date);
        const isCurrentMonth = date.getMonth() === month;
        const isSelected = selectedDate?.toDateString() === date.toDateString();
        const isInRange = isDateInRange(date);
        const isInRangHover =
          inRangePicker && isInHoverRangeSpan(date, selectedDate, min, max);
        const isDisabled =
          !isInRange || (!isCurrentMonth && !isSelected && !isInRangHover);
        const isMinMaxSelect =
          inRangePicker &&
          (date.toDateString() ===
            (min ? min?.toDateString() : selectedDate?.toDateString()) ||
            date.toDateString() ===
              (max ? max?.toDateString() : selectedDate?.toDateString()));
        week.push(
          <td key={d} style={{ padding: 0 }}>
            <Stack
              style={{
                padding:
                  !isMinMaxSelect && (isDisabled || isInRangHover) && !today
                    ? "12px"
                    : "10px",
                margin:
                  !isMinMaxSelect && (isDisabled || isInRangHover) && !today
                    ? "0px"
                    : "2px",
                textAlign: "center",
                borderRadius: 8,
                color:
                  isSelected || isInRangHover || isMinMaxSelect
                    ? "var(--hadesui-text-color)"
                    : isCurrentMonth && !isDisabled
                    ? "var(--hadesui-text-color)"
                    : "var(--hadesui-text2-color)",
                background:
                  isSelected || isMinMaxSelect
                    ? "var(--hadesui-blue-6)"
                    : isInRangHover && !today
                    ? "linear-gradient(to bottom, transparent 0%, transparent 20%, var(--hadesui-blue-6) 20%, var(--hadesui-blue-6) 80%, transparent 80%, transparent 100%)"
                    : isDisabled && !today
                    ? "linear-gradient(to bottom, transparent 0%, transparent 20%, var(--hadesui-bg-disable-calender) 20%, var(--hadesui-bg-disable-calender) 80%, transparent 80%, transparent 100%)"
                    : "transparent",
                cursor:
                  isCurrentMonth && !isDisabled ? "pointer" : "not-allowed",
                userSelect: "none",
                fontSize: 14,
                transition: "color 0.2s ease, background-color 0.2s ease",
                border: `1px solid ${
                  today ? "var(--hadesui-blue-6)" : "transparent"
                } `,
              }}
              onClick={() => {
                if (!isDisabled && isCurrentMonth) {
                  handleSelectDate(date);
                }
              }}
              onMouseEnter={(e) => {
                if (
                  !isDisabled &&
                  !isSelected &&
                  !isMinMaxSelect &&
                  !isInRangHover
                ) {
                  e.currentTarget.style.background =
                    "var(--hadesui-bg-btn-text)";
                }
              }}
              onMouseLeave={(e) => {
                if (
                  !isSelected &&
                  !isDisabled &&
                  !isMinMaxSelect &&
                  !isInRangHover
                ) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {date.getDate()}
            </Stack>
          </td>
        );
      }

      weeks.push(<tr key={w}>{week}</tr>);
    }

    return weeks;
  };

  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <Stack flex wfull style={{ height: 395, overflowX: "auto" }}>
      <Stack flexCol align="center" style={{ padding: 16 }}>
        <Stack
          flex
          justify="space-between"
          align="center"
          wfull
          style={{
            marginBottom: 8,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <Stack flex>
            <Button theme="icon" onClick={() => goToYear(-1)}>
              <DoubleLeftIcon size={18} />
            </Button>
            <Button theme="icon" onClick={() => goToMonth(-1)}>
              <LeftIcon size={18} />
            </Button>
          </Stack>
          <Button
            theme="icon"
            onClick={() => {
              if (mode === "month") {
                setMode("date");
              } else {
                setMode("month");
              }
            }}
            style={{
              fontSize: 16,
            }}
          >
            {monthLabel}
          </Button>
          <Stack flex>
            <Button theme="icon" onClick={() => goToMonth(1)}>
              <RightIcon size={18} />
            </Button>
            <Button theme="icon" onClick={() => goToYear(1)}>
              <DoubleRightIcon size={18} />
            </Button>
          </Stack>
        </Stack>
        {mode === "date" ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <th
                    key={d}
                    style={{
                      fontWeight: 500,
                      fontSize: 14,
                      padding: "8px 4px",
                    }}
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{getWeeks()}</tbody>
          </table>
        ) : (
          renderMonthPicker()
        )}

        {mode === "date" && (
          <Stack flex justify="end" wfull>
            <Button
              theme="link"
              onClick={() => {
                const now = new Date();

                setSelectedDate(
                  new Date(now.getFullYear(), now.getMonth(), now.getDate())
                );

                const t = new Date();
                t.setHours(
                  now.getHours(),
                  now.getMinutes(),
                  now.getSeconds(),
                  0
                );
                t.setFullYear(1970, 0, 1);
                setSelectedTime(t);
              }}
            >
              Now
            </Button>

            <Button
              theme="primary"
              disabled={!isMergedValid()}
              onClick={() => {
                if (!selectedDate || !selectedTime) return;

                const merged = new Date(selectedDate);
                merged.setHours(
                  selectedTime.getHours(),
                  selectedTime.getMinutes(),
                  selectedTime.getSeconds()
                );

                const isValid = isDateBetween(merged, min, max);

                if (!isValid) return;

                onSelect?.(merged);
              }}
            >
              OK
            </Button>
          </Stack>
        )}
      </Stack>

      {hasTimePicker && (
        <React.Fragment>
          <Divider vertical />
          <TimePicker
            value={selectedTime}
            currentDate={selectedDate}
            onChange={handleChangeTime}
            min={min}
            max={max}
          />
        </React.Fragment>
      )}
    </Stack>
  );
}

export default Calendar;
