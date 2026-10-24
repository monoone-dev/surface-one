// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  SONE_DEFAULT_MESSAGES,
  addFiles,
  fileMatchesAccept,
  fileRejectionMessage,
  formatFileSize,
  isImageFile,
} from "../src";
import * as fileUpload from "../src/file-upload";

const f = (name: string, size: number, type: string) => ({ name, size, type });
const PNG = f("photo.png", 1_200_000, "image/png");
const PDF = f("brief.PDF", 300_000, "application/pdf");
const ZIP = f("all.zip", 9_000_000, "application/zip");

describe("the file upload rules", () => {
  it("are in the module React Native imports", () => {
    expect(fileUpload.addFiles).toBe(addFiles);
  });

  it("match the native accept list: extensions, MIME types and wildcards", () => {
    expect(fileMatchesAccept(PNG, null)).toBe(true);
    expect(fileMatchesAccept(PNG, "image/*")).toBe(true);
    expect(fileMatchesAccept(PDF, "image/*, .pdf")).toBe(true);
    expect(fileMatchesAccept(PDF, "application/pdf")).toBe(true);
    expect(fileMatchesAccept(ZIP, "image/*,.pdf")).toBe(false);
  });

  it("add accepted files and turn away the wrong type, the too large and the one too many", () => {
    const rules = {
      accept: "image/*,.pdf",
      maxSize: 2_000_000,
      maxFiles: 2,
      multiple: true,
    };
    const big = f("huge.png", 3_000_000, "image/png");
    const { value, rejected } = addFiles([PNG], [ZIP, big, PDF, PNG], rules);
    expect(value).toEqual([PNG, PDF]);
    expect(rejected.map((r) => [r.file.name, r.reason])).toEqual([
      ["all.zip", "type"],
      ["huge.png", "size"],
      ["photo.png", "count"],
    ]);
  });

  it("replace the one file without multiple, keeping it when nothing new fits", () => {
    expect(addFiles([PNG], [PDF, ZIP]).value).toEqual([PDF]);
    expect(addFiles([PNG], [PDF, PDF]).rejected[0]?.reason).toBe("count");
    expect(addFiles([PNG], [ZIP], { accept: "image/*" }).value).toEqual([PNG]);
  });

  it("write sizes for people and spot images", () => {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(1_234_567)).toBe("1.2 MB");
    expect(formatFileSize(2_000_000, "pl")).toBe("2 MB");
    expect(formatFileSize(-1)).toBe("");
    expect(isImageFile(PNG)).toBe(true);
    expect(isImageFile(PDF)).toBe(false);
  });

  it("say why a file was turned away", () => {
    const rules = { maxSize: 2_000_000, maxFiles: 3, multiple: true };
    const say = (reason: "type" | "size" | "count") =>
      fileRejectionMessage({ file: PNG, reason }, rules, SONE_DEFAULT_MESSAGES);
    expect(say("type")).toBe("photo.png is not an accepted file type.");
    expect(say("size")).toBe("photo.png is larger than 2 MB.");
    expect(say("count")).toBe("Only 3 files can be added.");
    expect(
      fileRejectionMessage(
        { file: PNG, reason: "count" },
        {},
        SONE_DEFAULT_MESSAGES,
      ),
    ).toBe("Only one file can be added.");
  });
});
