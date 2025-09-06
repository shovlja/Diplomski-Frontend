// helpers (bez dependencija)
export function cx(...cls: (string | false | null | undefined)[]) {
    return cls.filter(Boolean).join(" ");
  }
  
  export function greetingByTime(d = new Date()) {
    const h = d.getHours();
    if (h < 6) return "Good night";
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }
  
  export function startOfMonth(d = new Date()) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }
  export function daysInMonth(d = new Date()) {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  }
  