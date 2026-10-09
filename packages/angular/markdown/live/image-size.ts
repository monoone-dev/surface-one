export interface ImageSize {
  readonly width: number;
  readonly height: number;
}

const MAX_CACHED = 32;
const HEADER_BASE64_CHARS = 87_384;
const JPEG_SOF = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

const sizes = new Map<string, ImageSize | null>();

export function dataImageSize(src: string): ImageSize | null {
  const cached = sizes.get(src);
  if (cached !== undefined) {
    return cached;
  }
  const size = sniff(src);
  if (sizes.size >= MAX_CACHED) {
    sizes.clear();
  }
  sizes.set(src, size);
  return size;
}

function headerBytes(src: string): Uint8Array | null {
  const comma = src.indexOf(",");
  if (!src.startsWith("data:image/") || comma === -1) {
    return null;
  }
  const payload = src.slice(comma + 1, comma + 1 + HEADER_BASE64_CHARS);
  const whole = payload.slice(0, payload.length - (payload.length % 4));
  try {
    return Uint8Array.from(atob(whole), (c) => c.charCodeAt(0));
  } catch {
    // Not valid base64: no size to reserve, the image still renders at its natural size.
    return null;
  }
}

function sniff(src: string): ImageSize | null {
  const b = headerBytes(src);
  if (!b || b.length < 30) {
    return null;
  }
  const u16be = (i: number) => (b[i] << 8) | b[i + 1];
  const u16le = (i: number) => b[i] | (b[i + 1] << 8);
  const u24le = (i: number) => b[i] | (b[i + 1] << 8) | (b[i + 2] << 16);
  const u32be = (i: number) =>
    ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;
  const ascii = (i: number, n: number) =>
    String.fromCharCode(...b.subarray(i, i + n));
  let size: ImageSize | null = null;
  if (b[0] === 0x89 && ascii(1, 3) === "PNG") {
    size = { width: u32be(16), height: u32be(20) };
  } else if (ascii(0, 4) === "GIF8") {
    size = { width: u16le(6), height: u16le(8) };
  } else if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") {
    const chunk = ascii(12, 4);
    if (chunk === "VP8 ") {
      size = { width: u16le(26) & 0x3fff, height: u16le(28) & 0x3fff };
    } else if (chunk === "VP8L") {
      size = {
        width: 1 + (((b[22] & 0x3f) << 8) | b[21]),
        height:
          1 + (((b[24] & 0x0f) << 10) | (b[23] << 2) | ((b[22] & 0xc0) >> 6)),
      };
    } else if (chunk === "VP8X") {
      size = { width: 1 + u24le(24), height: 1 + u24le(27) };
    }
  } else if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = b[i + 1];
      if (marker === 0xff) {
        i++;
        continue;
      }
      if (JPEG_SOF.has(marker)) {
        size = { width: u16be(i + 7), height: u16be(i + 5) };
        break;
      }
      if (
        marker === 0xd8 ||
        marker === 0x01 ||
        (marker >= 0xd0 && marker <= 0xd7)
      ) {
        i += 2;
        continue;
      }
      i += 2 + u16be(i + 2);
    }
  }
  return size && size.width > 0 && size.height > 0 ? size : null;
}
