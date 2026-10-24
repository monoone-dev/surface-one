import { mount } from "@vue/test-utils";
import { createSSRApp, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  SoneCarousel,
  SoneCarouselContent,
  SoneCarouselDots,
  SoneCarouselItem,
  SoneCarouselNext,
  SoneCarouselPrevious,
} from "../src/index";

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

function carousel(props: Record<string, unknown> = {}) {
  return () =>
    h(SoneCarousel, { "aria-label": "Highlights", ...props }, () => [
      h(SoneCarouselContent, null, () =>
        [1, 2, 3].map((n) =>
          h(SoneCarouselItem, { key: n }, () => `Slide ${n}`),
        ),
      ),
      h(SoneCarouselPrevious),
      h(SoneCarouselNext),
      h(SoneCarouselDots),
    ]);
}

describe("SoneCarousel", () => {
  it("renders the carousel region like Angular on the server", async () => {
    const out = await renderToString(createSSRApp({ render: carousel() }));
    expect(out).toContain(
      '<sone-carousel class="carousel" data-slot="carousel" role="region" aria-roledescription="carousel" data-orientation="horizontal" aria-label="Highlights">',
    );
    expect(out).toContain('data-slot="carousel-content" tabindex="0"');
    expect(out).toContain('aria-live="polite"');
    expect(out).toContain('role="group" aria-roledescription="slide"');
    expect(out).toContain('aria-label="Previous slide"');
    expect(out).not.toContain("carousel-rotation");
  });

  it("names the slides N of M, steps and binds the index", async () => {
    const index = ref(0);
    const wrapper = mount(
      () =>
        carousel({
          index: index.value,
          "onUpdate:index": (v: number) => (index.value = v),
        })(),
      { attachTo: document.body },
    );
    await nextTick();
    await nextTick();
    const slides = wrapper.findAll('[data-slot="carousel-item"]');
    expect(slides.map((s) => s.attributes("aria-label"))).toEqual([
      "1 of 3",
      "2 of 3",
      "3 of 3",
    ]);
    const prev = wrapper.get('[data-slot="carousel-previous"]');
    expect(prev.attributes("disabled")).toBeDefined();
    await wrapper.get('[data-slot="carousel-next"]').trigger("click");
    expect(index.value).toBe(1);
    expect(wrapper.get("[data-current]").text()).toBe("Slide 2");
    expect(prev.attributes("disabled")).toBeUndefined();
    await wrapper
      .get('[data-slot="carousel-content"]')
      .trigger("keydown", { key: "ArrowRight" });
    expect(index.value).toBe(2);
    expect(
      wrapper.get('[data-slot="carousel-next"]').attributes("disabled"),
    ).toBeDefined();
    const dots = wrapper.findAll('[data-slot="carousel-dot"]');
    expect(dots).toHaveLength(3);
    expect(dots[2].attributes("aria-current")).toBe("true");
    await dots[0].trigger("click");
    expect(index.value).toBe(0);
    wrapper.unmount();
  });

  it("rotates with autoplay and shows the rotation control", async () => {
    vi.useFakeTimers();
    const index = ref(0);
    const wrapper = mount(
      () =>
        carousel({
          autoplay: 1000,
          loop: true,
          index: index.value,
          "onUpdate:index": (v: number) => (index.value = v),
        })(),
      { attachTo: document.body },
    );
    await nextTick();
    await nextTick();
    const control = wrapper.get('[data-slot="carousel-rotation"]');
    expect(control.attributes("aria-label")).toBe("Stop automatic slide show");
    expect(
      wrapper.get('[data-slot="carousel-content"]').attributes("aria-live"),
    ).toBe("off");
    vi.advanceTimersByTime(1000);
    expect(index.value).toBe(1);
    await control.trigger("click");
    expect(control.attributes("aria-label")).toBe("Start automatic slide show");
    vi.advanceTimersByTime(3000);
    expect(index.value).toBe(1);
    wrapper.unmount();
  });
});
