"use client";

import { BackgroundItem } from "./background-item";
import {
  BOARD_BACKGROUND_PHOTOS,
  boardBackgroundRootUrl,
  boardBackgroundThumbnailUrl,
} from "./board-background-images";

export type BackgroundImagePickerProps = {
  readonly value: string | null;
  /** Canonical image URL (no thumbnail params) — use this for API / database. */
  readonly onChange: (rootImageUrl: string) => void;
};

export function BackgroundImagePicker({
  value,
  onChange,
}: BackgroundImagePickerProps) {
  return (
    <ul
      aria-label="Photo backgrounds"
      className="m-0 grid list-none grid-cols-4 gap-2 p-0"
    >
      {BOARD_BACKGROUND_PHOTOS.map((item) => {
        const thumbnailSrc = boardBackgroundThumbnailUrl(item.photoPath);
        const rootSrc = boardBackgroundRootUrl(item.photoPath);
        return (
          <BackgroundItem
            image={thumbnailSrc}
            isPhoto
            key={item.id}
            onSelect={() => {
              onChange(rootSrc);
            }}
            selected={value === rootSrc}
            title={item.title}
          />
        );
      })}
    </ul>
  );
}
