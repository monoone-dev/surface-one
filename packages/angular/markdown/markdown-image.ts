export interface MarkdownImage {
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

export type MarkdownImageResolver = (
  href: string,
) => string | MarkdownImage | null;

export const SAFE_INLINE_IMAGE =
  /^data:image\/(?:png|jpe?g|gif|webp|avif);base64,[a-z0-9+/]+={0,2}$/i;

// The `sone-markdown` preview's rule: only an inline, base64 raster `data:` URL is ever an image
// source, so a rendered image can never cause network egress.
export const inlineDataImage: MarkdownImageResolver = (href) =>
  SAFE_INLINE_IMAGE.test(href) ? href : null;
