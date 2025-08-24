/**
 *  *
 * #### 📅 Date Tokens
 *
 * - `YYYY` → Full 4-digit year
 *   - 📌 Example: `2025`
 *
 * - `YY` → Last 2 digits of year
 *   - 📌 Example: `25` (from `2025`)
 *
 * - `MMMM` → Full month name (based on locale)
 *   - 📌 Example: `January`, `September`
 *
 * - `MMM` → Abbreviated month name (first 3 letters)
 *   - 📌 Example: `Jan`, `Sep`
 *
 * - `MM` → Month number (2 digits, padded with zero)
 *   - 📌 Range: `01`–`12`
 *   - 📌 Example: `03` for March
 *
 * - `M` → Month number (no leading zero)
 *   - 📌 Range: `1`–`12`
 *   - 📌 Example: `3` for March
 *
 * - `DD` → Day of the month (2 digits, padded with zero)
 *   - 📌 Range: `01`–`31`
 *
 * - `D` → Day of the month (no leading zero)
 *   - 📌 Range: `1`–`31`
 *
 * - `dddd` → Full name of the weekday
 *   - 📌 Example: `Sunday`, `Wednesday`
 *
 * - `ddd` → Abbreviated weekday name
 *   - 📌 Example: `Sun`, `Wed`
 *
 * ---
 *
 * #### ⏰ Time Tokens
 *
 * - `hh` → Hour (24-hour format, 2 digits)
 *   - 📌 Range: `00`–`23`
 *
 * - `h` → Hour (12-hour format, no leading zero)
 *   - 📌 Range: `1`–`12`
 *
 * - `HH` → Hour (12-hour format, 2 digits)
 *   - 📌 Range: `01`–`12`
 *
 * - `mm` → Minutes (2 digits)
 *   - 📌 Range: `00`–`59`
 *
 * - `ss` → Seconds (2 digits)
 *   - 📌 Range: `00`–`59`
 *
 * - `A` → Meridiem in uppercase
 *   - 📌 Example: `AM`, `PM`
 *
 * - `a` → Meridiem in lowercase
 *   - 📌 Example: `am`, `pm`
 *
 * ---
 *
 * #### 🔣 Literal Tokens (Separators)
 *
 * Any other character like `-`, `/`, `:`, `.`, `,`, space.
 *
 * ---
 *
 * /**
 * ### 📘 Supported Format Tokens for Date & Time Formatting
 *
 * Supports tokens similar to Moment.js and date-fns.
 * Use brackets [ ] to escape literal text (e.g. [at])
 *
 * See examples below.
 *
 * #### 🧪 Format Examples
 *
 * | Format                 | Output Example        | Description                                 |
 * |------------------------|------------------------|--------------------------------------------|
 * | `DD-MM-YYYY`           | `27-07-2025`           | Day–Month–Year                             |
 * | `MMMM D, YYYY`         | `July 27, 2025`        | Full month, day with comma and year        |
 * | `MMM D, YY`            | `Jul 5, 25`            | Short month, day, short year               |
 * | `YYYY/MM/DD`           | `2025/07/27`           | Slash separator                            |
 * | `h:mm A`               | `3:45 PM`              | 12-hour time with AM/PM                    |
 * | `hh:mm:ss`             | `15:45:02`             | 24-hour time with seconds                  |
 * | `ddd, MMM D`           | `Sun, Jul 27`          | Short weekday, short month, day            |
 * | `dddd, MMMM D, YYYY`   | `Sunday, July 27, 2025`| Full weekday and month with full date      |
 * | `YYYY-MM-DD hh:mm:ss`  | `2025-07-27 15:45:30`  | Full ISO-style date & time                 |
 * | `D-M-YY [at] hh:mm`    | `1-7-27 at 15:45`      | Return full text in []                     |
 *
 * ---
 *
 * @param {Date} date - The `Date` object to format.
 * @param {string} [format="DD-MM-YYYY"] - The format string that defines the output structure.
 * @returns {string} The formatted string result.
 */

const DEFAULT_FORMAT = "DD-MM-YYYY hh:mm:ss";

const daysFull = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const daysShort = daysFull.map((d) => d.slice(0, 3));

const monthsFull = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const monthsShort = monthsFull.map((m) => m.slice(0, 3));

export const formatDate = (input, format = DEFAULT_FORMAT) => {
  let date;
  if (input instanceof Date) {
    date = input;
  } else if (typeof input === "string" || typeof input === "number") {
    date = new Date(input);
  } else {
    return "";
  }

  const pad = (num) => String(num).padStart(2, "0");
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const isAM = hours24 < 12;

  const replacements = {
    YYYY: date.getFullYear(),
    YY: String(date.getFullYear()).slice(-2),
    MMMM: monthsFull[date.getMonth()],
    MMM: monthsShort[date.getMonth()],
    MM: pad(date.getMonth() + 1),
    M: date.getMonth() + 1,
    DD: pad(date.getDate()),
    D: date.getDate(),
    dddd: daysFull[date.getDay()],
    ddd: daysShort[date.getDay()],
    hh: pad(hours24),
    h: hours12,
    HH: pad(hours12),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
    A: isAM ? "AM" : "PM",
    a: isAM ? "am" : "pm",
  };

  const tokens = Object.keys(replacements).sort((a, b) => b.length - a.length);

  let result = "";
  let i = 0;

  while (i < format.length) {
    if (format[i] === "[" && format.indexOf("]", i) > i) {
      const end = format.indexOf("]", i);
      result += format.slice(i + 1, end);
      i = end + 1;
      continue;
    }

    let matched = false;
    for (const token of tokens) {
      if (format.slice(i, i + token.length) === token) {
        result += replacements[token];
        i += token.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      result += format[i];
      i++;
    }
  }

  return result;
};

export const toDate = (v) => {
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (v instanceof Date) return isNaN(v) ? null : v;

  if (typeof v === "string") {
    const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    const d = new Date(v);
    return isNaN(d) ? null : d;
  }

  if (typeof v === "number") {
    const d = new Date(v);
    return isNaN(d) ? null : d;
  }

  return null;
};
