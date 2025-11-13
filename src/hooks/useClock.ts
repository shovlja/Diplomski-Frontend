import * as React from "react";

export function useClock() {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const date = new Intl.DateTimeFormat("en-US", {
    weekday: "long", month: "long", day: "2-digit", year: "numeric",
  }).format(now);
  return { now, time, date };
}
