"use client";

import { BackgroundColorPicker } from "./background-color-picker";
import { BackgroundImagePicker } from "./background-image-picker";

export type CreateBoardBackgroundSelection =
  | { readonly kind: "color"; readonly colorHex: string }
  | { readonly kind: "image"; readonly imageRootUrl: string }
  | null;

export type CreateBoardBackgroundPickerProps = {
  readonly value: CreateBoardBackgroundSelection;
  readonly onChange: (value: CreateBoardBackgroundSelection) => void;
};

export function CreateBoardBackgroundPicker({
  value,
  onChange,
}: CreateBoardBackgroundPickerProps) {
  const selectedColorHex = value?.kind === "color" ? value.colorHex : null;
  const selectedImageUrl = value?.kind === "image" ? value.imageRootUrl : null;

  return (
    <div className="space-y-4">
      <p className="font-medium text-foreground text-xs">Background</p>
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs">Colors</p>
        <BackgroundColorPicker
          onChange={(colorHex) => {
            onChange({ kind: "color", colorHex });
          }}
          value={selectedColorHex}
        />
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs">Photos</p>
        <BackgroundImagePicker
          onChange={(url) => {
            onChange({ kind: "image", imageRootUrl: url });
          }}
          value={selectedImageUrl}
        />
      </div>
    </div>
  );
}
