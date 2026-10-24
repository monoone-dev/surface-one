import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { FileRejection } from "@surface-one/angular/file-upload";
import {
  SoneImagePickerComponent,
  type ImagePickerValue,
} from "@surface-one/angular/image-picker";

import { $, render, settle } from "./helpers";

const png = new File(["x".repeat(10)], "photo.png", { type: "image/png" });
const big = new File(["x".repeat(99)], "huge.png", { type: "image/png" });
const pdf = new File(["x"], "brief.pdf", { type: "application/pdf" });

function pick(input: HTMLInputElement, files: File[]): void {
  Object.defineProperty(input, "files", { value: files, configurable: true });
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn();
});
afterEach(() => {
  document.body.innerHTML = "";
});

@Component({
  imports: [SoneImagePickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sone-image-picker
      inputId="cover"
      name="cover"
      aspectRatio="4 / 3"
      [maxSize]="50"
      [(value)]="value"
      (rejected)="rejected.set($event)"
    />
  `,
})
class PickerHost {
  readonly value = signal<ImagePickerValue>(null);
  readonly rejected = signal<FileRejection<File>[]>([]);
}

describe("sone-image-picker", () => {
  it("is a native image input named by its placeholder", async () => {
    await render(PickerHost);
    const input = $<HTMLInputElement>("#cover");
    expect(input.type).toBe("file");
    expect(input.accept).toBe("image/*");
    expect(input.name).toBe("cover");
    expect(input.hidden).toBe(false);
    expect($('label[for="cover"]').textContent).toBe("Add image");
    expect($("sone-image-picker").hasAttribute("data-empty")).toBe(true);
    expect($<HTMLElement>(".image-picker-box").style.aspectRatio).toBe("4 / 3");
  });

  it("previews a picked file, then changes and removes it, revoking its object URL", async () => {
    const fixture = await render(PickerHost);
    pick($<HTMLInputElement>("#cover"), [png]);
    await settle(fixture);
    expect(fixture.componentInstance.value()).toBe(png);
    expect($<HTMLImageElement>(".image-picker-image").src).toBe("blob:preview");
    expect($<HTMLInputElement>("#cover").hidden).toBe(true);
    expect($("sone-image-picker").hasAttribute("data-empty")).toBe(false);
    const change = $<HTMLButtonElement>('[data-slot="image-picker-change"]');
    expect(change.getAttribute("aria-label")).toBe("Change image");
    expect(document.activeElement).toBe(change);

    const remove = $<HTMLButtonElement>('[data-slot="image-picker-remove"]');
    expect(remove.getAttribute("aria-label")).toBe("Remove image");
    remove.click();
    await settle(fixture);
    expect(fixture.componentInstance.value()).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
    expect($(".image-picker-image")).toBeNull();
    expect(document.activeElement).toBe($("#cover"));
  });

  it("shows a stored URL and announces a rejected file", async () => {
    const fixture = await render(PickerHost);
    fixture.componentInstance.value.set("/cover.png");
    await settle(fixture);
    expect($<HTMLImageElement>(".image-picker-image").getAttribute("src")).toBe(
      "/cover.png",
    );

    pick($<HTMLInputElement>("#cover"), [big]);
    await settle(fixture);
    expect(fixture.componentInstance.value()).toBe("/cover.png");
    expect($('[role="alert"]').textContent!.trim()).toBe(
      "huge.png is larger than 50 B.",
    );
    pick($<HTMLInputElement>("#cover"), [pdf]);
    await settle(fixture);
    expect(fixture.componentInstance.rejected()[0]!.reason).toBe("type");
    expect($('[role="alert"]').textContent!.trim()).toBe(
      "brief.pdf is not an accepted file type.",
    );
  });

  it("falls back to a message when the image does not load", async () => {
    const fixture = await render(PickerHost);
    fixture.componentInstance.value.set("/missing.png");
    await settle(fixture);
    $(".image-picker-image").dispatchEvent(new Event("error"));
    await settle(fixture);
    expect($('[data-slot="image-picker-error"]').textContent).toContain(
      "Image unavailable",
    );
  });
});
