import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  SoneFileUploadComponent,
  type FileRejection,
} from "@surface-one/angular/file-upload";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";

import { $, $$, render, settle } from "./helpers";

const png = new File(["x".repeat(10)], "photo.png", { type: "image/png" });
const pdf = new File(["x".repeat(20)], "brief.pdf", {
  type: "application/pdf",
});
const zip = new File(["x"], "all.zip", { type: "application/zip" });

function pick(input: HTMLInputElement, files: File[]): void {
  Object.defineProperty(input, "files", { value: files, configurable: true });
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function drop(target: Element, type: string, files: File[]): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "dataTransfer", {
    value: { files, types: ["Files"], dropEffect: "none" },
  });
  target.dispatchEvent(event);
  return event;
}

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn();
});
afterEach(() => {
  document.body.innerHTML = "";
});

@Component({
  imports: [SoneFileUploadComponent, ...SONE_FIELD_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div soneField>
      <label soneFieldLabel for="files">Attachments</label>
      <sone-file-upload
        inputId="files"
        multiple
        accept="image/*,.pdf"
        [maxSize]="25"
        [maxFiles]="2"
        description="Images or PDF"
        [disabled]="disabled()"
        [(value)]="files"
        (rejected)="rejected.set($event)"
      />
      <p soneFieldDescription>Attached to the notes.</p>
    </div>
  `,
})
class UploadHost {
  readonly files = signal<File[]>([]);
  readonly disabled = signal(false);
  readonly rejected = signal<FileRejection<File>[]>([]);
}

describe("sone-file-upload", () => {
  it("is a native file input named by its zone and described by the field", async () => {
    const fixture = await render(UploadHost);
    await settle(fixture);
    const input = $<HTMLInputElement>("#files");
    expect(input.type).toBe("file");
    expect(input.multiple).toBe(true);
    expect(input.accept).toBe("image/*,.pdf");
    expect($('label[for="files"].file-upload-label').textContent).toContain(
      "Drop files here or click to browse",
    );
    const ids = input.getAttribute("aria-describedby")!.split(" ");
    expect(ids).toContain($(".file-upload-description").id);
    expect(ids).toContain($('[data-slot="field-description"]').id);
  });

  it("adds picked and dropped files, lists them and names what it turned away", async () => {
    const fixture = await render(UploadHost);
    await settle(fixture);
    const host = fixture.componentInstance;
    pick($<HTMLInputElement>("#files"), [png, zip]);
    await settle(fixture);
    expect(host.files()).toEqual([png]);
    expect(host.rejected().map((r) => r.reason)).toEqual(["type"]);
    expect($('[role="alert"]').textContent).toContain(
      "all.zip is not an accepted file type.",
    );
    expect($<HTMLImageElement>(".file-upload-preview").src).toBe(
      "blob:preview",
    );

    const zone = $('[data-slot="file-upload-dropzone"]');
    drop(zone, "dragenter", [pdf]);
    await settle(fixture);
    expect(zone.hasAttribute("data-dragging")).toBe(true);
    const event = drop(zone, "drop", [pdf, png]);
    await settle(fixture);
    expect(event.defaultPrevented).toBe(true);
    expect(zone.hasAttribute("data-dragging")).toBe(false);
    expect(host.files()).toEqual([png, pdf]);
    expect($('[role="alert"]').textContent).toContain(
      "Only 2 files can be added.",
    );
    expect($('[data-slot="file-upload-list"]').getAttribute("aria-label")).toBe(
      "Selected files",
    );
    expect($$(".file-upload-name").map((n) => n.textContent)).toEqual([
      "photo.png",
      "brief.pdf",
    ]);
  });

  it("removes a file, revokes its preview and moves focus on", async () => {
    const fixture = await render(UploadHost);
    fixture.componentInstance.files.set([png, pdf]);
    await settle(fixture);
    const remove = $$<HTMLButtonElement>('[data-slot="file-upload-remove"]');
    expect(remove[0]!.getAttribute("aria-label")).toBe("Remove photo.png");
    remove[0]!.click();
    await settle(fixture);
    expect(fixture.componentInstance.files()).toEqual([pdf]);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
    expect(document.activeElement?.getAttribute("aria-label")).toBe(
      "Remove brief.pdf",
    );
  });

  it("takes no files while disabled", async () => {
    const fixture = await render(UploadHost);
    fixture.componentInstance.disabled.set(true);
    await settle(fixture);
    expect($<HTMLInputElement>("#files").disabled).toBe(true);
    const event = drop($('[data-slot="file-upload-dropzone"]'), "drop", [png]);
    await settle(fixture);
    expect(event.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.files()).toEqual([]);
  });
});
