import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SONE_TEXTAREA_PARTS } from "@surface-one/angular/textarea";

import { $, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

const BOX =
  "line-height: 20px; padding: 8px 0; border: 1px solid; box-sizing: border-box";

@Component({
  imports: [...SONE_TEXTAREA_PARTS, ...SONE_FIELD_PARTS, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div soneField [invalid]="invalid()">
      <label soneFieldLabel for="bio">Bio</label>
      <textarea
        soneTextarea
        #ta="soneTextarea"
        id="bio"
        style="${BOX}"
        [autosize]="autosize()"
        minRows="2"
        maxRows="4"
        maxlength="20"
        [(ngModel)]="text"
      ></textarea>
      <sone-textarea-count [for]="ta" />
      <p soneFieldDescription>Shown on your profile.</p>
    </div>
  `,
})
class TextareaHost {
  readonly autosize = signal(true);
  readonly invalid = signal(false);
  readonly text = signal("Hello");
}

describe("textarea[soneTextarea]", () => {
  it("is the native textarea with its slot, maxlength and the field's wiring", async () => {
    const fixture = await render(TextareaHost);
    await settle(fixture);
    const ta = $<HTMLTextAreaElement>("#bio");
    expect(ta.getAttribute("data-slot")).toBe("textarea");
    expect(ta.getAttribute("maxlength")).toBe("20");
    expect(ta.hasAttribute("data-autosize")).toBe(true);
    const desc = $('[data-slot="field-description"]');
    expect(ta.getAttribute("aria-describedby")).toBe(desc.id);
    fixture.componentInstance.invalid.set(true);
    await settle(fixture);
    expect(ta.getAttribute("aria-invalid")).toBe("true");
  });

  it("counts the characters, values written from outside included, and speaks only near the limit", async () => {
    const fixture = await render(TextareaHost);
    await settle(fixture);
    const count = $("sone-textarea-count");
    expect(count.getAttribute("data-slot")).toBe("textarea-count");
    expect(count.textContent).toContain("5/20");
    expect($('[aria-live="polite"]', count).textContent).toBe("");

    const ta = $<HTMLTextAreaElement>("#bio");
    ta.value = "Hello, typed words!";
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    await settle(fixture);
    expect(count.textContent).toContain("19/20");
    expect(count.getAttribute("data-state")).toBe("near");
    expect($('[aria-live="polite"]', count).textContent).toBe(
      "1 character left",
    );

    fixture.componentInstance.text.set("x".repeat(20));
    await settle(fixture);
    expect(count.textContent).toContain("20/20");
    expect(count.getAttribute("data-state")).toBe("limit");
  });

  it("fits its height to the content between minRows and maxRows", async () => {
    let content = 36;
    vi.spyOn(
      HTMLTextAreaElement.prototype,
      "scrollHeight",
      "get",
    ).mockImplementation(() => content);
    const fixture = await render(TextareaHost);
    await settle(fixture);
    const ta = $<HTMLTextAreaElement>("#bio");
    // Two rows minimum: 2 × 20 + 16 padding + 2 border.
    expect(ta.style.height).toBe("58px");
    expect(ta.style.overflowY).toBe("hidden");

    content = 200;
    ta.value = "a\nb\nc\nd\ne\nf\ng";
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    await settle(fixture);
    // Four rows at most, then it scrolls.
    expect(ta.style.height).toBe("98px");
    expect(ta.style.overflowY).toBe("auto");

    fixture.componentInstance.autosize.set(false);
    await settle(fixture);
    expect(ta.style.height).toBe("");
    expect(ta.hasAttribute("data-autosize")).toBe(false);
  });
});
