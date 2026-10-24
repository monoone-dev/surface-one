import { act, fireEvent, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SoneImagePicker } from "../src/components/image-picker";

const png = new File(["x".repeat(10)], "photo.png", { type: "image/png" });
const big = new File(["x".repeat(99)], "huge.png", { type: "image/png" });

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn();
});
afterEach(() => vi.restoreAllMocks());

describe("SoneImagePicker", () => {
  it("renders the empty field like Angular", () => {
    const out = renderToString(<SoneImagePicker inputId="cover" invalid />);
    expect(out).toContain(
      '<sone-image-picker data-slot="image-picker" data-empty="" data-invalid=""><div class="image-picker-box" data-slot="image-picker-box" style="aspect-ratio:16 / 9"><input type="file" class="image-picker-input" data-slot="image-picker-input" id="cover" accept="image/*" aria-invalid="true"/>',
    );
    expect(out).toContain(
      '<label class="image-picker-label" for="cover">Add image</label>',
    );
  });

  it("shows a stored URL with change and remove buttons", () => {
    const out = renderToString(
      <SoneImagePicker value="/cover.png" alt="Cover" />,
    );
    expect(out).toContain(
      '<img class="image-picker-image" data-slot="image-picker-image" src="/cover.png" alt="Cover"/>',
    );
    expect(out).toContain('aria-label="Change image"');
    expect(out).toContain('aria-label="Remove image"');
  });

  it("previews a pick, rejects one too large and removes the image", () => {
    const onValueChange = vi.fn();
    const onRejected = vi.fn();
    const { container } = render(
      <SoneImagePicker
        maxSize={50}
        onValueChange={onValueChange}
        onRejected={onRejected}
      />,
    );
    const input = container.querySelector("input")!;
    fireEvent.change(input, { target: { files: [big] } });
    expect(onRejected).toHaveBeenCalledOnce();
    expect(container.querySelector('[role="alert"]')!.textContent).toBe(
      "huge.png is larger than 50 B.",
    );
    act(() => {
      fireEvent.change(input, { target: { files: [png] } });
    });
    expect(onValueChange).toHaveBeenCalledWith(png);
    expect(container.querySelector("img")!.getAttribute("src")).toBe(
      "blob:preview",
    );
    expect(document.activeElement?.getAttribute("data-slot")).toBe(
      "image-picker-change",
    );
    act(() => {
      fireEvent.click(
        container.querySelector('[data-slot="image-picker-remove"]')!,
      );
    });
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
    expect(container.querySelector("img")).toBeNull();
  });
});
