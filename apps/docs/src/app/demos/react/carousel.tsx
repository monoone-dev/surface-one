import { useState } from "react";
import {
  SoneCard,
  SoneCarousel,
  SoneCarouselContent,
  SoneCarouselDots,
  SoneCarouselItem,
  SoneCarouselNext,
  SoneCarouselPrevious,
} from "@surface-one/react";

const slides = [
  { title: "Tokens", text: "Every colour and step has a name." },
  { title: "Skins", text: "Six looks, light and dark." },
  { title: "Accents", text: "One palette across the brand." },
  { title: "Twins", text: "Angular, Vue and React alike." },
];

export default function CarouselDemo() {
  const [index, setIndex] = useState(0);
  return (
    <div className="demo-stack" style={{ maxWidth: "24rem", width: "100%" }}>
      <SoneCarousel aria-label="Release highlights" loop index={index} onIndexChange={setIndex}>
        <SoneCarouselContent>
          {slides.map((slide) => (
            <SoneCarouselItem key={slide.title}>
              <SoneCard style={{ display: "grid", placeContent: "center", gap: "var(--space-1)", aspectRatio: "4 / 3", textAlign: "center" }}>
                <strong style={{ fontSize: "var(--font-size-2xl)" }}>{slide.title}</strong>
                <span style={{ color: "var(--text-secondary)" }}>{slide.text}</span>
              </SoneCard>
            </SoneCarouselItem>
          ))}
        </SoneCarouselContent>
        <SoneCarouselPrevious />
        <SoneCarouselNext />
        <SoneCarouselDots />
      </SoneCarousel>
      <p style={{ margin: 0, color: "var(--text-secondary)", textAlign: "center" }}>
        Slide {index + 1} of {slides.length}
      </p>
    </div>
  );
}
