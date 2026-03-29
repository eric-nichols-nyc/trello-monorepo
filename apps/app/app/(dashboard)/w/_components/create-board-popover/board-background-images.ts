/** Origin for Unsplash image CDN (no trailing slash). */
export const UNSPLASH_IMAGE_ORIGIN = "https://images.unsplash.com";

export type BoardBackgroundPhotoDefinition = {
  readonly id: string;
  readonly title: string;
  /**
   * Path after `images.unsplash.com/` (no leading slash), e.g.
   * `photo-1646784208071-7f35325e10cb`.
   */
  readonly photoPath: string;
};

/**
 * Stock photos for board backgrounds. Thumbnails use `boardBackgroundThumbnailUrl`;
 * persist `boardBackgroundRootUrl` (or full URL from `boardBackgroundPersistedUrl`) to the API.
 */
export const BOARD_BACKGROUND_PHOTOS = [
  {
    id: "img-1",
    title: "Landscape",
    photoPath: "photo-1646784208071-7f35325e10cb",
  },
  {
    id: "img-2",
    title: "Ocean",
    photoPath: "photo-1752606402432-9eeb131c6101",
  },
  {
    id: "img-3",
    title: "City",
    photoPath: "photo-1752606402425-fa8ed3166a91",
  },
  {
    id: "img-4",
    title: "Forest",
    photoPath: "photo-1764366795867-a0e7fcbf791e",
  },
] as const satisfies readonly BoardBackgroundPhotoDefinition[];

/** Canonical image URL with no size params — safe to store as the board background reference. */
export function boardBackgroundRootUrl(photoPath: string): string {
  return `${UNSPLASH_IMAGE_ORIGIN}/${photoPath}`;
}

/**
 * Full-quality URL for downloads or hero usage (explicit size; adjust `w` / `q` as needed).
 * Use this when the DB should store a ready-to-fetch URL instead of the root only.
 */
export function boardBackgroundPersistedUrl(
  photoPath: string,
  options: { readonly width?: number; readonly quality?: number } = {}
): string {
  const width = options.width ?? 1920;
  const quality = options.quality ?? 85;
  const params = new URLSearchParams({
    auto: "format",
    fit: "max",
    w: String(width),
    q: String(quality),
  });
  return `${UNSPLASH_IMAGE_ORIGIN}/${photoPath}?${params.toString()}`;
}

/** Small URL for the create-board picker grid only. */
export function boardBackgroundThumbnailUrl(photoPath: string): string {
  const params = new URLSearchParams({
    auto: "format",
    fit: "crop",
    w: "120",
    h: "120",
    q: "80",
  });
  return `${UNSPLASH_IMAGE_ORIGIN}/${photoPath}?${params.toString()}`;
}
