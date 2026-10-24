import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import { SONE_CAROUSEL_PARTS } from "@surface-one/angular/carousel";

import { $, $$, key, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

@Component({
  imports: [...SONE_CAROUSEL_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sone-carousel aria-label="Highlights" [(index)]="index" [loop]="loop()">
      <div soneCarouselContent>
        @for (n of [1, 2, 3]; track n) {
          <div soneCarouselItem>Slide {{ n }}</div>
        }
      </div>
      <button soneCarouselPrevious></button>
      <button soneCarouselNext></button>
      <sone-carousel-dots />
    </sone-carousel>
  `,
})
class CarouselHost {
  readonly index = signal(0);
  readonly loop = signal(false);
}

@Component({
  imports: [...SONE_CAROUSEL_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sone-carousel aria-label="News" [autoplay]="5000">
      <div soneCarouselContent>
        <div soneCarouselItem>One</div>
        <div soneCarouselItem>Two</div>
      </div>
    </sone-carousel>
  `,
})
class AutoplayHost {}

describe("sone-carousel", () => {
  it("is a named carousel region of slides labelled N of M", async () => {
    await render(CarouselHost);
    const root = $("sone-carousel");
    expect(root.getAttribute("role")).toBe("region");
    expect(root.getAttribute("aria-roledescription")).toBe("carousel");
    expect(root.getAttribute("aria-label")).toBe("Highlights");
    const slides = $$('[data-slot="carousel-item"]');
    expect(slides.map((s) => s.getAttribute("aria-label"))).toEqual([
      "1 of 3",
      "2 of 3",
      "3 of 3",
    ]);
    expect(slides[0].getAttribute("role")).toBe("group");
    expect(slides[0].getAttribute("aria-roledescription")).toBe("slide");
    const track = $('[data-slot="carousel-content"]');
    expect(track.getAttribute("aria-live")).toBe("polite");
    expect(track.tabIndex).toBe(0);
    expect($("[soneCarouselNext]").getAttribute("aria-controls")).toBe(
      track.id,
    );
    // Nothing rotates, so there is no rotation control.
    expect($('[data-slot="carousel-rotation"]')).toBeNull();
  });

  it("steps with Previous / Next, disabled at the ends, and binds the index", async () => {
    const fixture = await render(CarouselHost);
    const prev = $<HTMLButtonElement>("[soneCarouselPrevious]");
    const next = $<HTMLButtonElement>("[soneCarouselNext]");
    expect(prev.getAttribute("aria-label")).toBe("Previous slide");
    expect(prev.disabled).toBe(true);
    next.click();
    await settle(fixture);
    expect(fixture.componentInstance.index()).toBe(1);
    expect($$("[data-current]")).toHaveLength(1);
    expect(
      $('[data-slot="carousel-item"][data-current]').textContent,
    ).toContain("Slide 2");
    next.click();
    await settle(fixture);
    expect(next.disabled).toBe(true);
    fixture.componentInstance.loop.set(true);
    await settle(fixture);
    expect(next.disabled).toBe(false);
    next.click();
    await settle(fixture);
    expect(fixture.componentInstance.index()).toBe(0);
  });

  it("steps with the arrow keys while focus is inside", async () => {
    const fixture = await render(CarouselHost);
    const track = $('[data-slot="carousel-content"]');
    track.focus();
    expect(key(track, "ArrowRight").defaultPrevented).toBe(true);
    await settle(fixture);
    expect(fixture.componentInstance.index()).toBe(1);
    key(track, "ArrowLeft");
    await settle(fixture);
    expect(fixture.componentInstance.index()).toBe(0);
    expect(key(track, "ArrowDown").defaultPrevented).toBe(false);
  });

  it("has a dot per slide, the current one marked", async () => {
    const fixture = await render(CarouselHost);
    const dots = $$('[data-slot="carousel-dot"]');
    expect(dots).toHaveLength(3);
    expect($('[data-slot="carousel-dots"]').getAttribute("role")).toBe("group");
    expect(dots[2].getAttribute("aria-label")).toBe("Go to slide 3");
    dots[2].click();
    await settle(fixture);
    expect(fixture.componentInstance.index()).toBe(2);
    expect(dots[2].getAttribute("aria-current")).toBe("true");
    expect(dots[0].hasAttribute("aria-current")).toBe(false);
  });

  it("shows a rotation control while it rotates, and goes quiet meanwhile", async () => {
    const fixture = await render(AutoplayHost);
    const control = $<HTMLButtonElement>('[data-slot="carousel-rotation"]');
    expect(control.getAttribute("aria-label")).toBe(
      "Stop automatic slide show",
    );
    expect($('[data-slot="carousel-content"]').getAttribute("aria-live")).toBe(
      "off",
    );
    control.click();
    await settle(fixture);
    expect(control.getAttribute("aria-label")).toBe(
      "Start automatic slide show",
    );
    expect($('[data-slot="carousel-content"]').getAttribute("aria-live")).toBe(
      "polite",
    );
  });
});
