/** "Marija Lukić" -> "ML"; "Marija" -> "M" */
export function initials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const letters = parts.map(p => p[0]?.toUpperCase() ?? "").join("");
  return letters || "U";
}

/** "2025-08-30T12:34:56Z" -> "2025-08-30" */
export function dateOnly(iso: string | Date) {
  const s = typeof iso === "string" ? iso : iso.toISOString();
  return s.slice(0, 10);
}

export function formatDateLong(iso: string | Date, locale = "en-US") {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(+d)) return "";
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "2-digit",
    year: "numeric",
  }).format(d);
}

/** Lepo izvlačenje poruke iz greške (axios/fetch agnostic) */
export function parseApiError(e: any, fallback = "Request failed"): string {
  return (
    e?.response?.data?.detail ??
    e?.response?.data?.message ??
    e?.message ??
    fallback
  );
}
