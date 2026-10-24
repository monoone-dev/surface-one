import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { Text } from "react-native";
import { describe, expect, it } from "vitest";

import {
  SoneCarousel,
  SoneCarouselContent,
  SoneCarouselDots,
  SoneCarouselItem,
  SoneCarouselNext,
  SoneCarouselPrevious,
} from "../src/components/carousel";

function Demo({ loop = false }: { loop?: boolean }) {
  const [index, setIndex] = useState(0);
  return (
    <>
      <SoneCarousel
        ariaLabel="Highlights"
        index={index}
        onIndexChange={setIndex}
        loop={loop}
      >
        <SoneCarouselContent>
          {[1, 2, 3].map((n) => (
            <SoneCarouselItem key={n}>
              <Text>Slide {n}</Text>
            </SoneCarouselItem>
          ))}
        </SoneCarouselContent>
        <SoneCarouselPrevious />
        <SoneCarouselNext />
        <SoneCarouselDots />
      </SoneCarousel>
      <Text testID="index">{index}</Text>
    </>
  );
}

describe("SoneCarousel", () => {
  it("is a named region of slides labelled N of M", () => {
    render(<Demo />);
    expect(screen.getByRole("region").getAttribute("aria-label")).toBe(
      "Highlights",
    );
    expect(screen.getByLabelText("1 of 3")).toBeTruthy();
    expect(screen.getByLabelText("3 of 3")).toBeTruthy();
  });

  it("steps with Previous / Next and the dots, stopping at the ends", () => {
    render(<Demo />);
    const prev = screen.getByLabelText("Previous slide");
    expect(prev.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(screen.getByLabelText("Next slide"));
    expect(screen.getByTestId("index").textContent).toBe("1");
    fireEvent.click(screen.getByLabelText("Go to slide 3"));
    expect(screen.getByTestId("index").textContent).toBe("2");
    expect(
      screen.getByLabelText("Next slide").getAttribute("aria-disabled"),
    ).toBe("true");
    expect(
      screen.getByLabelText("Go to slide 3").getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("wraps when looping", () => {
    render(<Demo loop />);
    fireEvent.click(screen.getByLabelText("Previous slide"));
    expect(screen.getByTestId("index").textContent).toBe("2");
  });
});
