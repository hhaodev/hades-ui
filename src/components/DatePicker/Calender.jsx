import { useState } from "react";
import Button from "../Button";
import { DoubleLeftIcon, DoubleRightIcon, LeftIcon, RightIcon } from "../Icon";
import Stack from "../Stack";
import TimePicker from "./TimePicker";
import Divider from "../Divider";

function Calendar({ value, onSelect }) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(
    value ? new Date(value) : null
  );
  const [currentMonth, setCurrentMonth] = useState(
    new Date((value || today).getFullYear(), (value || today).getMonth(), 1)
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
    if (mode === "date") {
      if (selectedDate) {
        date.setHours(
          selectedDate.getHours(),
          selectedDate.getMinutes(),
          selectedDate.getSeconds()
        );
      }
      setSelectedDate?.(date);
    }
  };

  const handleSelectMonth = (monthIndex) => {
    const newMonth = new Date(currentMonth.getFullYear(), monthIndex, 1);
    setCurrentMonth(newMonth);
    setMode("date");
  };

  const handleChangeTime = (time) => {
    if (!selectedDate) return;

    const newDate = new Date(selectedDate);
    newDate.setHours(time.getHours());
    newDate.setMinutes(time.getMinutes());
    newDate.setSeconds(time.getSeconds());

    setSelectedDate?.(newDate);
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
              color:
                i === currentMonth.getMonth()
                  ? "#fff"
                  : "var(--hadesui-text-color)",
              borderRadius: 8,
              cursor: "pointer",
              textAlign: "center",
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
        const isCurrentMonth = date.getMonth() === month;
        const isSelected = selectedDate?.toDateString() === date.toDateString();

        week.push(
          <td key={d} style={{ padding: 0 }}>
            <Stack
              style={{
                padding: "10px",
                margin: "2px",
                textAlign: "center",
                borderRadius: 4,
                color:
                  isCurrentMonth || isSelected
                    ? "var(--hadesui-text-color)"
                    : "var(--hadesui-text2-color)",
                background: isSelected
                  ? "var(--hadesui-blue-6)"
                  : "transparent",
                cursor:
                  isCurrentMonth || isSelected ? "pointer" : "not-allowed",
                userSelect: "none",
                fontSize: 14,
              }}
              onClick={() => {
                if (isCurrentMonth) handleSelectDate(date);
              }}
              onMouseEnter={(e) => {
                if (isCurrentMonth && !isSelected) {
                  e.currentTarget.style.background =
                    "var(--hadesui-bg-btn-text)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
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
    <Stack flex wfull style={{ height: 380, overflowX: "auto" }}>
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
                const newToday = new Date();
                setCurrentMonth(
                  new Date(newToday.getFullYear(), newToday.getMonth(), 1)
                );
                setSelectedDate?.(newToday);
              }}
            >
              Now
            </Button>
            <Button
              theme="primary"
              onClick={() => {
                onSelect?.(selectedDate);
              }}
            >
              OK
            </Button>
          </Stack>
        )}
      </Stack>
      <Divider vertical />
      <TimePicker value={selectedDate} onChange={handleChangeTime} />
    </Stack>
  );
}

export default Calendar;
