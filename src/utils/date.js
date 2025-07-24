/**
 * Format a Date object to a string based on the given pattern.
 * Supported tokens:
 * - YYYY: full year
 * - MM: month (01-12)
 * - DD: day of month (01-31)
 * - hh: hours (00-23)
 * - mm: minutes (00-59)
 * - ss: seconds (00-59)
 *
 * @param {Date} date
 * @param {string} format (default "DD-MM-YYYY")
 * @returns {string}
 */
export const formatDate = (date, format = "DD-MM-YYYY") => {
  if (!(date instanceof Date) || isNaN(date)) return "";

  const pad = (num) => String(num).padStart(2, "0");

  const replacements = {
    YYYY: date.getFullYear(),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    hh: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
  };

  return format.replace(/YYYY|MM|DD|hh|mm|ss/g, (token) => replacements[token]);
};
