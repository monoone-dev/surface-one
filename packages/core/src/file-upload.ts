// The file upload rules alone, for React Native (Metro does not tree-shake the
// `./angular` re-export). Angular stays the one source of this logic.
export * from "../../angular/file-upload/file-upload-rules";

import type { SoneMessages } from "./messages";
import {
  formatFileSize,
  type FileLike,
  type FileRejection,
  type FileUploadRules,
} from "../../angular/file-upload/file-upload-rules";

/** What the alert says about a file that was turned away (the Angular default's twin). */
export function fileRejectionMessage<F extends FileLike>(
  rejection: FileRejection<F>,
  rules: FileUploadRules,
  messages: Pick<
    SoneMessages,
    "fileUploadWrongType" | "fileUploadTooLarge" | "fileUploadTooMany"
  >,
  locale = "en",
): string {
  const name = rejection.file.name;
  if (rejection.reason === "type") return messages.fileUploadWrongType(name);
  if (rejection.reason === "size")
    return messages.fileUploadTooLarge(
      name,
      formatFileSize(rules.maxSize ?? 0, locale),
    );
  return messages.fileUploadTooMany(rules.multiple ? (rules.maxFiles ?? 1) : 1);
}

/** True when a drag carries files (not text or a link). */
export const dragHasFiles = (event: {
  readonly dataTransfer: DataTransfer | null;
}): boolean => Array.from(event.dataTransfer?.types ?? []).includes("Files");

/**
 * Puts `files` in a native file input, so a plain form post carries them. Browser-only;
 * a no-op where `DataTransfer` cannot be constructed (then only an empty value clears it).
 */
export function mirrorFilesToInput(
  input: HTMLInputElement | null,
  files: readonly File[],
): void {
  if (!input) return;
  try {
    const transfer = new DataTransfer();
    for (const file of files) transfer.items.add(file);
    input.files = transfer.files;
  } catch {
    if (!files.length) input.value = "";
  }
}

/** Object URLs for image previews, created once per file and revoked when it leaves. */
export function createFilePreviews(): {
  get(file: File): string | null;
  keep(files: readonly File[]): void;
  clear(): void;
} {
  const urls = new Map<File, string>();
  const keep = (files: readonly File[]): void => {
    for (const [file, url] of urls) {
      if (files.includes(file)) continue;
      URL.revokeObjectURL(url);
      urls.delete(file);
    }
  };
  return {
    get(file) {
      let url = urls.get(file);
      if (
        !url &&
        typeof URL !== "undefined" &&
        typeof URL.createObjectURL === "function"
      ) {
        url = URL.createObjectURL(file);
        urls.set(file, url);
      }
      return url ?? null;
    },
    keep,
    clear: () => keep([]),
  };
}
