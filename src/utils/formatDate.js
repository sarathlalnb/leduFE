/**
 * Shared date/time formatting utilities.
 * All functions use the browser's LOCAL timezone — no UTC override.
 * This ensures times scheduled by the admin (e.g. 4:30 PM IST) are always
 * displayed as 4:30 PM everywhere in the app.
 */

/** "15/08/2026" — DD/MM/YYYY local date */
export function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB"); // e.g. 15/08/2026
}

/** "4:30 PM" — local 12-hour time */
export function formatTime(date) {
  if (!date) return "—";
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "15/08/2026, 4:30 PM" — combined local date + time */
export function formatDateTime(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "Aug 15" — short month + day, local */
export function formatShortDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** "Monday" — weekday name, local */
export function formatWeekday(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { weekday: "long" });
}
