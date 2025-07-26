/**
 *
 * ### Supported format tokens:
 * - `YYYY` – 4-digit year (e.g., 2025)
 * - `YY` – 2-digit year (e.g., 25)
 * - `MMMM` – Full month name (e.g., January)
 * - `MMM` – Short month name (e.g., Jan)
 * - `MM` – Month with leading zero (01–12)
 * - `M` – Month (1–12)
 * - `DD` – Day of month with leading zero (01–31)
 * - `D` – Day of month (1–31)
 * - `hh` – Hours in 24-hour format with leading zero (00–23)
 * - `h` – Hours in 12-hour format (1–12)
 * - `HH` – Hours in 12-hour format with leading zero (01–12)
 * - `mm` – Minutes with leading zero (00–59)
 * - `ss` – Seconds with leading zero (00–59)
 * - `A` – AM/PM
 * - `a` – am/pm
 *
 * @param {Date} date - The date to format.
 * @param {string} [format="DD-MM-YYYY"] - The format string.
 * @returns {string} The formatted date string.
 */
export const formatDate = (date, format = "DD-MM-YYYY hh:mm:ss") => {
  if (!(date instanceof Date) || isNaN(date)) return "";

  const pad = (num) => String(num).padStart(2, "0");

  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const isAM = hours24 < 12;

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

  const replacements = {
    YYYY: date.getFullYear(),
    YY: String(date.getFullYear()).slice(-2),
    MMMM: monthsFull[date.getMonth()],
    MMM: monthsShort[date.getMonth()],
    MM: pad(date.getMonth() + 1),
    M: date.getMonth() + 1,
    DD: pad(date.getDate()),
    D: date.getDate(),
    hh: pad(hours24),
    h: hours12,
    HH: pad(hours12),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
    A: isAM ? "AM" : "PM",
    a: isAM ? "am" : "pm",
  };

  return format.replace(
    /YYYY|YY|MMMM|MMM|MM|M|DD|D|hh|h|HH|mm|ss|A|a/g,
    (token) => replacements[token]
  );
};
