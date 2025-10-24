// Robust helpers shared by notifications UI

export function parseAsDate(d: string | Date): Date | null {
  if (d instanceof Date) return d;
  if (!d) return null;
  // Ako datum nema TZ, tretiraj ga kao UTC da izbegnemo NaN u nekim browserima
  const hasTZ = /[zZ]|[+-]\d{2}:?\d{2}$/.test(d);
  const dt = new Date(hasTZ ? d : `${d}Z`);
  return isNaN(dt.getTime()) ? null : dt;
}

export function timeAgo(input: string | Date): string {
  const date = parseAsDate(input);
  if (!date) return "";

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return "just now";

  const sec = Math.floor(diffMs / 1000);
  if (sec < 45) return "just now";
  if (sec < 90) return "1m ago";

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;

  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;

  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}w ago`;

  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;

  const yr = Math.floor(day / 365);
  return `${yr}y ago`;
}

export function initials(name?: string | null): string {
  const n = (name ?? "").trim();
  if (!n) return "U";
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0]![0]!.toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}
