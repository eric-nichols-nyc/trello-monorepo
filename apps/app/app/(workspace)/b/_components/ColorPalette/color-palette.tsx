"use client";

import { cn } from "@repo/design-system/lib/utils";

import { ColorTile } from "./color-tile";

export type CoverColorSwatch = { readonly hex: string; readonly label: string };

/** Muted, rectangular swatch grid (2×5) aligned with card-cover picker reference. */
export const DEFAULT_COVER_COLORS: readonly CoverColorSwatch[] = [
  { hex: "#4a6352", label: "Forest green" },
  { hex: "#b5a03a", label: "Mustard gold" },
  { hex: "#c26a3c", label: "Burnt orange" },
  { hex: "#a64a42", label: "Brick red" },
  { hex: "#7a5f96", label: "Purple" },
  { hex: "#4568c9", label: "Royal blue" },
  { hex: "#4a6f7a", label: "Teal" },
  { hex: "#6e6b3f", label: "Olive" },
  { hex: "#8a4f6f", label: "Plum" },
  { hex: "#5c6369", label: "Charcoal" },
];

export type ColorPaletteProps = {
  readonly className?: string;
  readonly colors?: readonly CoverColorSwatch[];
  readonly selectedHex?: string | null;
  readonly onSelect?: (hex: string) => void;
  readonly disabled?: boolean;
};

function normalizeHex(value: string): string {
  return value.trim().toLowerCase();
}

export function ColorPalette({
  className,
  colors = DEFAULT_COVER_COLORS,
  selectedHex = null,
  onSelect,
  disabled = false,
}: ColorPaletteProps) {
  const selected = selectedHex != null ? normalizeHex(selectedHex) : null;
  return (
    <div className={cn("grid grid-cols-5 gap-2", className)}>
      {colors.map(({ hex, label }) => (
        <ColorTile
          color={hex}
          disabled={disabled}
          key={hex}
          label={label}
          onClick={() => onSelect?.(hex)}
          selected={selected !== null && selected === normalizeHex(hex)}
        />
      ))}
    </div>
  );
}
