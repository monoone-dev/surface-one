import { act, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  SoneCarousel,
  SoneCarouselContent,
  SoneCarouselDots,
  SoneCarouselItem,
  SoneCarouselNext,
  SoneCarouselPrevious,
} from "../src/components/carousel";

afterEach(() => vi.useRealTimers());

function Demo(props: { autoplay?: number; loop?: boolean }) {
  const [index, setIndex] = useState(0);
  return (
    <>
      <SoneCarousel
        aria-label="Highlights"
        index={index}
        onIndexChange={setIndex}
        {...props}
      >
        <SoneCarouselContent>
          {[1, 2, 3].map((n) => (
            <SoneCarouselItem key={n}>Slide {n}</SoneCarouselItem>
          ))}
        </SoneCarouselContent>
        <SoneCarouselPrevious />
        <SoneCarouselNext />
        <SoneCarouselDots />
      </SoneCarousel>
      <output>{index}</output>
    </>
  );
}

describe("SoneCarousel", () => {
  it("renders the carousel region like Angular on the server", () => {
    const out = renderToString(<Demo />);
    expect(out).toContain(
      '<sone-carousel aria-label="Highlights" class="carousel" data-slot="carousel" role="region" aria-roledescription="carousel" data-orientation="horizontal">',
    );
    expect(out).toContain('data-slot="carousel-content"');
    expect(out).toContain('aria-live="polite"');
    expect(out).toContain('role="group" aria-roledescription="slide"');
    expect(out).toContain('aria-label="Previous slide"');
    expect(out).not.toContain("carousel-rotation");
  });

  it("names the slides N of M, steps and controls the index", () => {
    const { container } = render(<Demo />);
    const $ = (s: string) => container.querySelector(s) as HTMLElement;
    const slides = [
      ...container.querySelectorAll('[data-slot="carousel-item"]'),
    ];
    expect(slides.map((s) => s.getAttribute("aria-label"))).toEqual([
      "1 of 3",
      "2 of 3",
      "3 of 3",
    ]);
    expect(($('[data-slot="carousel-content"]') as HTMLElement).tabIndex).toBe(
      0,
    );
    expect(
      ($('[data-slot="carousel-previous"]') as HTMLButtonElement).disabled,
    ).toBe(true);
    fireEvent.click($('[data-slot="carousel-next"]'));
    expect($("output").textContent).toBe("1");
    expect($("[data-current]").textContent).toBe("Slide 2");
    fireEvent.keyDown($('[data-slot="carousel-content"]'), {
      key: "ArrowRight",
    });
    expect($("output").textContent).toBe("2");
    expect(
      ($('[data-slot="carousel-next"]') as HTMLButtonElement).disabled,
    ).toBe(true);
    const dots = container.querySelectorAll('[data-slot="carousel-dot"]');
    expect(dots).toHaveLength(3);
    expect(dots[2].getAttribute("aria-current")).toBe("true");
    fireEvent.click(dots[0]);
    expect($("output").textContent).toBe("0");
  });

  it("rotates with autoplay and shows the rotation control", () => {
    vi.useFakeTimers();
    const { container } = render(<Demo autoplay={1000} loop />);
    const $ = (s: string) => container.querySelector(s) as HTMLElement;
    const control = $('[data-slot="carousel-rotation"]');
    expect(control.getAttribute("aria-label")).toBe(
      "Stop automatic slide show",
    );
    expect($('[data-slot="carousel-content"]').getAttribute("aria-live")).toBe(
      "off",
    );
    act(() => vi.advanceTimersByTime(1000));
    expect($("output").textContent).toBe("1");
    fireEvent.click(control);
    expect(control.getAttribute("aria-label")).toBe(
      "Start automatic slide show",
    );
    act(() => vi.advanceTimersByTime(3000));
    expect($("output").textContent).toBe("1");
  });
});
