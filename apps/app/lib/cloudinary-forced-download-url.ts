/**
 * Returns a Cloudinary delivery URL that sets `Content-Disposition: attachment`
 * via `fl_attachment` so the browser downloads instead of opening inline (works cross-origin).
 *
 * For `fl_attachment:filename`, Cloudinary requires the name **without** a file extension
 * (they append the correct one) and disallows a raw `.` in the value (use `%252E` per docs);
 * otherwise delivery may return 400.
 *
 * Signed URLs (`/upload/s--…`) are returned unchanged — inserting a flag would break the signature.
 */
export function cloudinaryForcedDownloadUrl(
  url: string,
  suggestedName?: string | null
): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "res.cloudinary.com") {
      return url;
    }
    if (!/\/(image|raw|video|auto)\/upload\//.test(parsed.pathname)) {
      return url;
    }
    if (url.includes("fl_attachment")) {
      return url;
    }
    if (/\/(image|raw|video|auto)\/upload\/s--/.test(parsed.pathname)) {
      return url;
    }

    const marker = "/upload/";
    const idx = url.indexOf(marker);
    if (idx === -1) {
      return url;
    }
    const insertAt = idx + marker.length;
    const raw = suggestedName?.trim();
    let base = raw?.replace(/[/\\#,?&]/g, "_").slice(0, 200);
    if (base) {
      base = base.replace(/\.[^./\\]{1,15}$/i, "").trim();
    }
    const safe =
      base && base.length > 0
        ? base
            .replace(/[^A-Za-z0-9_\-! ]/g, "_")
            .replace(/ +/g, " ")
            .trim()
            .slice(0, 120)
        : "";
    const flag = safe.length > 0 ? `fl_attachment:${safe}` : "fl_attachment";
    return `${url.slice(0, insertAt)}${flag}/${url.slice(insertAt)}`;
  } catch {
    return url;
  }
}
