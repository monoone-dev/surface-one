import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SONE_CARD_PARTS } from "@surface-one/angular/card";
import { SONE_CAROUSEL_PARTS } from "@surface-one/angular/carousel";

const TEMPLATE = `<div class="demo-stack" style="max-width: 24rem; width: 100%">
  <sone-carousel aria-label="Release highlights" loop [(index)]="index">
    <div soneCarouselContent>
      @for (slide of slides; track slide.title) {
        <div soneCarouselItem>
          <div soneCard style="display: grid; place-content: center; gap: var(--space-1); aspect-ratio: 4 / 3; text-align: center">
            <strong style="font-size: var(--font-size-2xl)">{{ slide.title }}</strong>
            <span style="color: var(--text-secondary)">{{ slide.text }}</span>
          </div>
        </div>
      }
    </div>
    <button soneCarouselPrevious></button>
    <button soneCarouselNext></button>
    <sone-carousel-dots />
  </sone-carousel>
  <p style="margin: 0; color: var(--text-secondary); text-align: center">Slide {{ index() + 1 }} of {{ slides.length }}</p>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-carousel-demo",
  imports: [...SONE_CAROUSEL_PARTS, ...SONE_CARD_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class CarouselDemo {
  readonly index = signal(0);
  readonly slides = [
    { title: "Tokens", text: "Every colour and step has a name." },
    { title: "Skins", text: "Six looks, light and dark." },
    { title: "Accents", text: "One palette across the brand." },
    { title: "Twins", text: "Angular, Vue and React alike." },
  ];
}
