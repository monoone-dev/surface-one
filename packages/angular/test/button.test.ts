import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";

import { SoneButtonDirective } from "@surface-one/angular/button";

@Component({
  imports: [SoneButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      soneBtn
      [variant]="variant()"
      size="sm"
      type="button"
      (click)="clicks.set(clicks() + 1)"
    >
      Save
    </button>
  `,
})
class ButtonHost {
  readonly variant = signal<"default" | "outline">("default");
  readonly clicks = signal(0);
}

describe("soneBtn", () => {
  it("renders the variant and size and stays a native button", async () => {
    const fixture = TestBed.createComponent(ButtonHost);
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector(
      "button",
    ) as HTMLButtonElement;
    expect(button.getAttribute("data-slot")).toBe("button");
    expect(button.getAttribute("data-variant")).toBe("default");
    expect(button.getAttribute("data-size")).toBe("sm");
    button.click();
    expect(fixture.componentInstance.clicks()).toBe(1);
    fixture.componentInstance.variant.set("outline");
    await fixture.whenStable();
    expect(button.getAttribute("data-variant")).toBe("outline");
  });
});
