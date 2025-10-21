import * as React from "react";
import { Button } from "@/components/ui/Button";

type Props = {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
};

export default function ConfirmDialog({ open, title, message, onClose }: Props) {
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  if (!open) return null;
  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        {title && <h3 className="mb-2 text-lg font-semibold text-zinc-900">{title}</h3>}
        <p className="text-[15px] text-zinc-700">{message}</p>
        <div className="mt-5 flex justify-end">
          <Button className="cursor-pointer" onClick={onClose}>OK</Button>
        </div>
      </div>
    </div>
  );
}
