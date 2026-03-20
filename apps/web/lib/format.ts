/**
 * Returns up to 2 uppercase initials from a display name.
 * e.g. "Jane Doe" → "JD", "Alice" → "AL", "?" → "?"
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Formats a Philippine Peso amount. Returns "" for null/undefined/NaN.
 * Accepts number or numeric string (e.g. from API decimal fields).
 */
export function formatCurrency(
  amount: number | string | null | undefined,
): string {
  if (amount == null) return "";
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(n)) return "";
  return `₱${n.toLocaleString("en-PH")}`;
}

/**
 * Formats a YYYY-MM-DD date string to short locale format (e.g. "Mar 20, 2026").
 * Returns "—" for null/undefined/empty input.
 */
export function formatShortDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats a YYYY-MM-DD due date as a relative label:
 * "Overdue", "Today", "Tomorrow", or short date (e.g. "Mar 24").
 */
export function formatRelativeDueDate(dueDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = dueDate.split("-");
  const due = new Date(Number(year), Number(month) - 1, Number(day));
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
