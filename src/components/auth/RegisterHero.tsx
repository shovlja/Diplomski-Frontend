import * as React from "react";
import { Span } from "@/components/ui/Span";

type Props = {
  imageSrc: string;
};

export function RegisterHero({ imageSrc }: Props) {
  return (
    <>
      {/* BACKGROUND (ispod svega) */}
      <img
        src={imageSrc}
        alt="Welcome"
        className="absolute inset-0 h-full w-full object-cover object-left [filter:brightness(.9)_contrast(1.05)_saturate(1.02)]"
        style={{ transformOrigin: "left center" }}
      />
      {/* blag left->right scrim + vignette za čitljivost */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-transparent" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(120%_70%_at_25%_85%,rgba(0,0,0,.65)_0,rgba(0,0,0,.45)_42%,rgba(0,0,0,0)_78%)]" />

      {/* HERO copy (leva donja strana) */}
      <div className="absolute left-10 md:left-16 bottom-14 w-[min(92%,56rem)]">
        <div className="mb-4 h-[3px] w-20 rounded-full bg-[color:var(--accent-on-dark,#0EA5E9)] opacity-90" />
        <h1 className="font-display text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)] tracking-tight leading-tight text-5xl md:text-6xl">
          <Span tone="brand" className="font-bold" size="lg">Organize </Span>
          Work. Ship
          <Span className="font-bold" tone="brand" size="lg"> Faster.</Span>
          
        </h1>
        <p className="mt-4 text-white/90 text-base md:text-lg max-w-3xl">
        Plan boards, track tasks, and move as one team — clean, fast, and beautifully simple.
        </p>
      </div>
    </>
  );
}
