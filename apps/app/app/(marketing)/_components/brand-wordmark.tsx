"use client";

import { LayoutGrid } from "lucide-react";

function LogoMark() {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
      <LayoutGrid
        aria-hidden
        className="h-4 w-4 text-primary-foreground"
        strokeWidth={2}
      />
    </div>
  );
}

export type BrandWordmarkProps = {
  /** Text next to the mark (default matches product name). */
  label?: string;
};

/** Logo tile + wordmark for marketing and workspace chrome. */
export function BrandWordmark({ label = "Trellnode" }: BrandWordmarkProps) {
  return (
    <>
      <LogoMark />
      <span className="font-semibold text-foreground text-xl">{label}</span>
    </>
  );
}
