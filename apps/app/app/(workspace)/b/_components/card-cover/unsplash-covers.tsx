"use client";

import Image from "next/image";

/** Same asset repeated as a visual placeholder until real Unsplash results exist. */
const PLACEHOLDER_SRC = "/photo-1521495084171-3ad639e3d525.jpg";

/**
 * Curated photo thumbnails for card covers (Unsplash-style).
 * Selection and attribution wiring come later.
 */
export function UnsplashCovers() {
  return (
    <div className="space-y-2">
      <p className="font-semibold text-xs text-zinc-400">Photos</p>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }, (_, index) => (
          <button
            aria-label={`Photo suggestion ${index + 1}`}
            className="relative aspect-4/3 w-full min-h-0 overflow-hidden rounded-lg border border-zinc-600/60 bg-zinc-900 outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-sky-400/80 hover:opacity-90"
            key={`unsplash-thumb-${index}`}
            type="button"
          >
            <Image
              alt=""
              className="object-cover"
              fill
              sizes="96px"
              src={PLACEHOLDER_SRC}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
