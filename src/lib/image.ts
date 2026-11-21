// Cloudinary delivery helpers. Raw `secure_url`s serve the original upload
// (often 500 KB – 2.5 MB PNG/JPEG). Inserting f_auto,q_auto and a width
// makes Cloudinary serve WebP/AVIF at a sensible quality and size instead —
// typically 60–90% smaller. Non-Cloudinary URLs (bundled assets) pass
// through untouched.

const UPLOAD_SEGMENT = "/image/upload/";

const isCloudinary = (url: string | undefined): url is string =>
  !!url && url.includes("res.cloudinary.com") && url.includes(UPLOAD_SEGMENT);

export function cld(url: string, width?: number): string;
export function cld(url: string | undefined, width?: number): string | undefined;
export function cld(url: string | undefined, width?: number): string | undefined {
  if (!isCloudinary(url)) return url;
  const [before, after] = url.split(UPLOAD_SEGMENT);
  // Already transformed (first path segment isn't a version or folder) — leave it.
  if (/^[a-z]{1,3}_[^/]*\//.test(after)) return url;
  const t = ["f_auto", "q_auto", "c_limit", width ? `w_${width}` : null].filter(Boolean).join(",");
  return `${before}${UPLOAD_SEGMENT}${t}/${after}`;
}

const DEFAULT_WIDTHS = [400, 800, 1200, 1600];

/** srcset for a Cloudinary image; undefined for anything else. */
export function cldSrcSet(url: string | undefined, widths: number[] = DEFAULT_WIDTHS): string | undefined {
  if (!isCloudinary(url)) return undefined;
  return widths.map((w) => `${cld(url, w)} ${w}w`).join(", ");
}

/** Spread onto an <img>: src, srcSet and sizes in one go. */
export function responsiveImg(url: string | undefined, sizes: string, fallbackWidth = 800) {
  return {
    src: cld(url, fallbackWidth),
    srcSet: cldSrcSet(url),
    sizes: isCloudinary(url) ? sizes : undefined,
  };
}
