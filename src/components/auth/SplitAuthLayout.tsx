import * as React from "react";
import { v } from "../../lib/variants";

type Overlay = "none" | "soft" | "strong";

export default function SplitAuthLayout({
  imageSrc,
  imageAlt = "",
  overlay = "soft",
  left,
  children,
  className,
}: {
  imageSrc: string;
  imageAlt?: string;
  overlay?: Overlay;
  left?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const overlayCls = v({
    base: "absolute inset-0 pointer-events-none",
    variants: {
      none: "",
      soft: "bg-gradient-to-b from-black/60 via-black/30 to-transparent",
      strong: "bg-black/40",
    },
    variant: overlay,
  });

  return (
    <div className={"min-h-[100dvh] flex flex-col md:flex-row " + (className || "")}>
      {/* LEFT: image, always covers */}
      <div className="relative md:flex-1 h-[40vh] md:h-auto">
        <img src={imageSrc} alt={imageAlt}
             className="absolute inset-0 w-full h-full object-cover" />
        <div aria-hidden="true" className={overlayCls} />
        {left ? (
          <div className="relative z-10 h-full flex items-center">
            <div className="px-8 md:px-12 lg:px-16 max-w-md mx-auto md:mx-0 text-white">
              {left}
            </div>
          </div>
        ) : null}
      </div>

      {/* RIGHT: form, vertically centered */}
      <div className="md:flex-1 bg-white flex items-center">
        <div className="w-full max-w-xl mx-auto py-16 px-8 md:px-12 lg:px-16">
          {children}
        </div>
      </div>
    </div>
  );
}
