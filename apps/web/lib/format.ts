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
