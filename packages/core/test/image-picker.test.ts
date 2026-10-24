import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createImagePreview,
  imagePickerRatio,
  isImagePickerFile,
} from "../src";

const png = new File(["x"], "a.png", { type: "image/png" });
const jpg = new File(["y"], "b.jpg", { type: "image/jpeg" });

let next = 0;
beforeEach(() => {
  next = 0;
  URL.createObjectURL = vi.fn(() => `blob:${++next}`);
  URL.revokeObjectURL = vi.fn();
});
afterEach(() => vi.restoreAllMocks());

describe("the image picker value", () => {
  it("tells a picked file from a stored URL", () => {
    expect(isImagePickerFile(png)).toBe(true);
    expect(isImagePickerFile("/cover.png")).toBe(false);
    expect(isImagePickerFile(null)).toBe(false);
  });

  it("makes one object URL per file and revokes it when the value changes", () => {
    const preview = createImagePreview();
    expect(preview.src(png)).toBe("blob:1");
    expect(preview.src(png)).toBe("blob:1");
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(preview.src(jpg)).toBe("blob:2");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:1");
    expect(preview.src("/cover.png")).toBe("/cover.png");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:2");
    expect(preview.src(null)).toBeNull();
    expect(preview.src("")).toBeNull();
    preview.src(png);
    preview.clear();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:3");
  });

  it("writes the aspect ratio as CSS", () => {
    expect(imagePickerRatio(1)).toBe("1");
    expect(imagePickerRatio("4 / 3")).toBe("4 / 3");
    expect(imagePickerRatio(null)).toBeNull();
    expect(imagePickerRatio("")).toBeNull();
  });
});
