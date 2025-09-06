import * as React from "react";

export function useMockStats(role: "ADMIN" | "USER") {
  const [stats, setStats] = React.useState({ a: 0, b: 0, c: 0, d: 0 });
  React.useEffect(() => {
    const base = role === "ADMIN"
      ? { a: 3,  b: 27, c: 14, d: 121 } // new users, active users, boards, audit events
      : { a: 12, b: 7,  c: 5,  d: 4   }; // my tasks, done this week, boards, mentions
    setStats(base);
  }, [role]);
  return stats;
}

export function useMockActivity() {
  const [series] = React.useState(() =>
    Array.from({ length: 7 }, () => Math.floor(5 + Math.random() * 25))
  );
  return series;
}
