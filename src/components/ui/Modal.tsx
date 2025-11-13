// src/components/ui/Modal.tsx
import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
};

export default function Modal({ open, onClose, title, children, footer, size = "md" }: ModalProps) {
  if (!open) return null;

  const width =
    size === "sm" ? "max-w-md" : size === "lg" ? "max-w-2xl" : "max-w-xl";

  return createPortal(
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[100] grid place-items-center"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative w-[92vw] ${width} rounded-2xl bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="text-[15px] font-semibold text-zinc-900">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">×</Button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t px-5 py-3">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
