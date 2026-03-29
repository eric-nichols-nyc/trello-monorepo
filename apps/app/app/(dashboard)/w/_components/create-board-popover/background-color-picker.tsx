"use client";

import { BackgroundItem } from "./background-item";

const BOARD_SOLID_BACKGROUNDS = [
  { id: "blue", color: "#0079bf", title: "Blue" },
  { id: "orange", color: "#d29034", title: "Orange" },
  { id: "green", color: "#519839", title: "Green" },
  { id: "red", color: "#b04632", title: "Red" },
] as const;

export type BackgroundColorPickerProps = {
  readonly value: string | null;
  readonly onChange: (colorHex: string) => void;
};

export function BackgroundColorPicker({
  value,
  onChange,
}: BackgroundColorPickerProps) {
  return (
    <ul
      aria-label="Solid background colors"
      className="m-0 grid list-none grid-cols-4 gap-2 p-0"
    >
      {BOARD_SOLID_BACKGROUNDS.map((item) => (
        <BackgroundItem
          color={item.color}
          key={item.id}
          onSelect={() => {
            onChange(item.color);
          }}
          selected={value === item.color}
          title={item.title}
        />
      ))}
    </ul>
  );
}
