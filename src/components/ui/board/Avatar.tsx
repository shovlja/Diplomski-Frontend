import * as React from "react";

export default function Avatar({
  name,
  size = 28,
}: {
  name: string;
  size?: number;
}) {
  const initials = getInitials(name);
  const bg = pickColor(name);
  const style: React.CSSProperties = {
    width: size,
    height: size,
    fontSize: Math.round(size * 0.42),
    backgroundColor: bg,
  };
  return (
    <div
      className="flex shrink-0 select-none items-center justify-center rounded-full font-semibold uppercase text-white"
      style={style}
      title={name}
    >
      {initials}
    </div>
  );
}

function getInitials(n: string) {
  const parts = (n || "?")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2);
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`;
}

function pickColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  // malo svetliji ton da tekst ostane čitljiv
  return `hsl(${h}, 70%, 45%)`;
}
