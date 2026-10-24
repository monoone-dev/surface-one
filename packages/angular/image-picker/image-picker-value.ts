// The image picker's value and preview, with no framework in it: the Angular
// `sone-image-picker`, the Vue and React `SoneImagePicker` (through @surface-one/core)
// share it. The accept / size check is the file upload's (`addFiles`).

/** A picked image: the `File` from the native input, or the URL of an existing one. */
export type ImagePickerValue = File | string | null;

/** True for a picked `File` (a URL value is an image that is already stored). */
export const isImagePickerFile = (
  value: ImagePickerValue | undefined,
): value is File => typeof File !== "undefined" && value instanceof File;

/**
 * The `src` of a picker's preview, kept in one place so the object URL of a picked
 * `File` is created once and revoked as soon as the value changes (or on `clear()`).
 * A URL value is its own `src`; where there is no `URL.createObjectURL` (the server) a
 * `File` has none.
 */
export function createImagePreview(): {
  src(value: ImagePickerValue | undefined): string | null;
  clear(): void;
} {
  let current: { file: File; url: string } | null = null;
  const clear = (): void => {
    if (current) URL.revokeObjectURL(current.url);
    current = null;
  };
  return {
    src(value) {
      if (!isImagePickerFile(value)) {
        clear();
        return typeof value === "string" && value ? value : null;
      }
      if (current?.file === value) return current.url;
      clear();
      if (typeof URL === "undefined" || !URL.createObjectURL) return null;
      current = { file: value, url: URL.createObjectURL(value) };
      return current.url;
    },
    clear,
  };
}

/** The picker's `aspect-ratio`: a number (`16 / 9` as `1.78`) or a CSS ratio (`"4 / 3"`). */
export const imagePickerRatio = (ratio: number | string | null | undefined) =>
  ratio === null || ratio === undefined || ratio === "" ? null : String(ratio);
