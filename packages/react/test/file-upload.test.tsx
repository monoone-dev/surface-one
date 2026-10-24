import { act, fireEvent, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SoneFileUpload } from "../src/components/file-upload";

const png = new File(["x".repeat(10)], "photo.png", { type: "image/png" });
const pdf = new File(["x".repeat(20)], "brief.pdf", {
  type: "application/pdf",
});
const zip = new File(["x"], "all.zip", { type: "application/zip" });

const transfer = (files: File[]) => ({
  dataTransfer: { files, types: ["Files"], dropEffect: "none" },
});

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn();
});
afterEach(() => vi.restoreAllMocks());

describe("SoneFileUpload", () => {
  it("renders the dropzone around the native input like Angular", () => {
    const out = renderToString(
      <SoneFileUpload
        inputId="files"
        multiple
        accept="image/*"
        description="Images only"
        invalid
      />,
    );
    expect(out).toContain(
      '<sone-file-upload data-slot="file-upload" data-invalid=""><div class="file-upload-dropzone" data-slot="file-upload-dropzone">',
    );
    expect(out).toMatch(
      /<input type="file" class="file-upload-input" data-slot="file-upload-input" id="files" accept="image\/\*" multiple="" aria-invalid="true" aria-describedby="sone-file-upload-[^"]+-description"\/>/,
    );
    expect(out).toContain(
      '<label class="file-upload-label" for="files">Drop files here or click to browse</label>',
    );
  });

  it("adds picked and dropped files under the rules and removes them", () => {
    const onValueChange = vi.fn();
    const onRejected = vi.fn();
    const { container } = render(
      <SoneFileUpload
        multiple
        accept="image/*,.pdf"
        maxSize={25}
        maxFiles={2}
        onValueChange={onValueChange}
        onRejected={onRejected}
      />,
    );
    const input = container.querySelector("input")!;
    fireEvent.change(input, { target: { files: [png, zip] } });
    expect(onValueChange).toHaveBeenLastCalledWith([png]);
    expect(onRejected.mock.calls[0]![0][0].reason).toBe("type");
    expect(container.querySelector('[role="alert"]')!.textContent).toBe(
      "all.zip is not an accepted file type.",
    );
    expect(
      container.querySelector(".file-upload-preview")!.getAttribute("src"),
    ).toBe("blob:preview");

    const zone = container.querySelector('[data-slot="file-upload-dropzone"]')!;
    fireEvent.dragEnter(zone, transfer([pdf]));
    expect(zone.hasAttribute("data-dragging")).toBe(true);
    fireEvent.drop(zone, transfer([pdf, png]));
    expect(zone.hasAttribute("data-dragging")).toBe(false);
    expect(onValueChange).toHaveBeenLastCalledWith([png, pdf]);
    expect(container.querySelector('[role="alert"]')!.textContent).toBe(
      "Only 2 files can be added.",
    );

    const remove = container.querySelectorAll<HTMLButtonElement>(
      '[data-slot="file-upload-remove"]',
    );
    expect(remove[0]!.getAttribute("aria-label")).toBe("Remove photo.png");
    act(() => remove[0]!.click());
    expect(onValueChange).toHaveBeenLastCalledWith([pdf]);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
    expect(document.activeElement?.getAttribute("aria-label")).toBe(
      "Remove brief.pdf",
    );
  });
});
