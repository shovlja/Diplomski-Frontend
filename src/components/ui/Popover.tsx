import * as React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
};

/** Mali popover panel koji se zatvara klikom van/ESC. Renders inline (relative parent). */
export default function Popover({ open, onClose, className, children }: Props) {
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      ref={panelRef}
      className={
        "absolute right-0 z-20 mt-2 w-44 rounded-xl border bg-white p-1 shadow-lg " +
        (className || "")
      }
    >
      {children}
    </div>
  );
}
