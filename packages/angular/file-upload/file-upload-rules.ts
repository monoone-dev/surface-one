// What a file upload accepts, with no framework in it: the Angular `sone-file-upload`,
// the Vue and React `SoneFileUpload` (through @surface-one/core) and the React Native one
// (whose picked files are plain `{ name, size, type, uri }` objects) share it.

/** The fields of a `File` the rules read — a browser `File`, or a picked file on a phone. */
export interface FileLike {
  readonly name: string;
  readonly size: number;
  readonly type: string;
}

/** Why a file was turned away: not an accepted `type`, over `maxSize`, or past `maxFiles`. */
export type FileRejectionReason = "type" | "size" | "count";

export interface FileRejection<F extends FileLike = FileLike> {
  readonly file: F;
  readonly reason: FileRejectionReason;
}

export interface FileUploadRules {
  /** The native `accept` list: extensions (`.pdf`), MIME types (`image/png`) or wildcards (`image/*`). */
  readonly accept?: string | null;
  /** The largest file, in bytes. */
  readonly maxSize?: number | null;
  /** The most files the value holds (with `multiple`). */
  readonly maxFiles?: number | null;
  /** More than one file; without it a new file replaces the current one. */
  readonly multiple?: boolean;
}

/** True when `file` matches the native `accept` list (an empty list accepts anything). */
export function fileMatchesAccept(
  file: FileLike,
  accept: string | null | undefined,
): boolean {
  const patterns = (accept ?? "")
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
  if (!patterns.length) return true;
  const name = file.name.toLowerCase();
  const type = (file.type ?? "").toLowerCase();
  return patterns.some((p) => {
    if (p.startsWith(".")) return name.endsWith(p);
    if (p.endsWith("/*")) return type.startsWith(p.slice(0, -1));
    return type === p;
  });
}

/**
 * The value after adding `incoming` to `current` under `rules`: files of a type `accept`
 * does not list or over `maxSize` are rejected, and so is every file past `maxFiles`
 * (without `multiple`, past the first). Without `multiple` an accepted file replaces
 * the current one.
 */
export function addFiles<F extends FileLike>(
  current: readonly F[],
  incoming: readonly F[],
  rules: FileUploadRules = {},
): { readonly value: F[]; readonly rejected: FileRejection<F>[] } {
  const rejected: FileRejection<F>[] = [];
  const valid: F[] = [];
  for (const file of incoming) {
    if (!fileMatchesAccept(file, rules.accept)) {
      rejected.push({ file, reason: "type" });
    } else if (rules.maxSize != null && file.size > rules.maxSize) {
      rejected.push({ file, reason: "size" });
    } else {
      valid.push(file);
    }
  }
  if (!rules.multiple) {
    const [first, ...rest] = valid;
    for (const file of rest) rejected.push({ file, reason: "count" });
    return { value: first ? [first] : [...current], rejected };
  }
  const value = [...current];
  const max = rules.maxFiles ?? Number.POSITIVE_INFINITY;
  for (const file of valid) {
    if (value.length >= max) rejected.push({ file, reason: "count" });
    else value.push(file);
  }
  return { value, rejected };
}

const UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

/** A file size for people: `512 B`, `1.2 MB` (powers of 1000, one decimal past KB). */
export function formatFileSize(bytes: number, locale = "en"): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < UNITS.length - 1) {
    value /= 1000;
    unit++;
  }
  const number = new Intl.NumberFormat(locale, {
    maximumFractionDigits: unit === 0 ? 0 : 1,
  }).format(value);
  return `${number} ${UNITS[unit]}`;
}

/** True for a file a browser can show as an `<img>` preview. */
export const isImageFile = (file: FileLike): boolean =>
  (file.type ?? "").toLowerCase().startsWith("image/");
