"use client";

import { cn } from "@repo/design-system/lib/utils";

import { ColorTile } from "./color-tile";

export type CoverColorSwatch = { readonly hex: string; readonly label: string };

export const DEFAULT_COVER_COLORS: readonly CoverColorSwatch[] = [
  { hex: "#61bd4f", label: "Green" },
  { hex: "#f2d600", label: "Yellow" },
  { hex: "#ff9f1a", label: "Orange" },
  { hex: "#eb5a46", label: "Red" },
  { hex: "#c377e0", label: "Purple" },
  { hex: "#0079bf", label: "Blue" },
  { hex: "#00c2e0", label: "Sky" },
  { hex: "#51e898", label: "Lime" },
  { hex: "#ff78cb", label: "Pink" },
  { hex: "#344563", label: "Dark blue" },
];

export type ColorPaletteProps = {
  readonly className?: string;
  readonly colors?: readonly CoverColorSwatch[];
  readonly selectedHex?: string | null;
  readonly onSelect?: (hex: string) => void;
};

export function ColorPalette({
  className,
  colors = DEFAULT_COVER_COLORS,
  selectedHex = null,
  onSelect,
}: ColorPaletteProps) {
  return (
    <div className={cn("grid grid-cols-5 gap-2", className)}>
      {colors.map(({ hex, label }) => (
        <ColorTile
          color={hex}
          key={hex}
          label={label}
          onClick={() => onSelect?.(hex)}
          selected={selectedHex === hex}
        />
      ))}
    </div>
  );
}
