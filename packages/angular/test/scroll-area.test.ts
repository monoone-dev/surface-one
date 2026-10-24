import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import { SoneScrollAreaDirective } from "@surface-one/angular/scroll-area";

import { $, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

@Component({
  imports: [SoneScrollAreaDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      soneScrollArea
      aria-label="Tags"
      [orientation]="orientation()"
      fade
      style="height: 50px"
    >
      <p>Tags</p>
    </div>
  `,
})
class ScrollAreaHost {
  readonly orientation = signal<"vertical" | "horizontal">("vertical");
}

function overflow(el: HTMLElement, height: number): void {
  Object.defineProperty(el, "scrollHeight", {
    value: height,
    configurable: true,
  });
  Object.defineProperty(el, "clientHeight", { value: 50, configurable: true });
}

describe("soneScrollArea", () => {
  it("styles the container and follows the orientation", async () => {
    const fixture = await render(ScrollAreaHost);
    const area = $('[data-slot="scroll-area"]');
    expect(area.classList.contains("scroll-area")).toBe(true);
    expect(area.getAttribute("data-orientation")).toBe("vertical");
    expect(area.hasAttribute("data-fade")).toBe(true);
    fixture.componentInstance.orientation.set("horizontal");
    await settle(fixture);
    expect(area.getAttribute("data-orientation")).toBe("horizontal");
  });

  it("is a named region and a keyboard stop only while it overflows", async () => {
    const fixture = await render(ScrollAreaHost);
    const area = $('[data-slot="scroll-area"]');
    expect(area.getAttribute("role")).toBe("region");
    expect(area.hasAttribute("tabindex")).toBe(false);
    overflow(area, 200);
    area.dispatchEvent(new Event("scroll"));
    await new Promise((r) => requestAnimationFrame(r));
    await settle(fixture);
    expect(area.getAttribute("tabindex")).toBe("0");
    expect(area.hasAttribute("data-overflow-end")).toBe(true);
    expect(area.hasAttribute("data-overflow-start")).toBe(false);
  });
});
