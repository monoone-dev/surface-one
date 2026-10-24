import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_CARD_PARTS } from "@surface-one/angular/card";
import { SONE_CAROUSEL_PARTS } from "./carousel.component";

const meta: Meta = {
  title: "Components/Data display/Carousel",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({ imports: [...SONE_CAROUSEL_PARTS, ...SONE_CARD_PARTS] }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`sone-carousel` + `soneCarouselContent` / `soneCarouselItem` / `soneCarouselPrevious` / " +
          "`soneCarouselNext` / `sone-carousel-dots` — a dependency-free carousel: the slides sit in a CSS " +
          "scroll-snap track, so swiping, the trackpad and the wheel are the browser's own. Previous / Next, " +
          "the dots and ArrowLeft / ArrowRight (ArrowUp / ArrowDown when `vertical`) step it, `[(index)]` is the " +
          "current slide, `loop` wraps at the ends and `--carousel-per-view` shows several slides at once. It " +
          'follows the WAI-ARIA carousel pattern: a `region` with `aria-roledescription="carousel"` (name it ' +
          'with `aria-label`), slides are `group`s with `aria-roledescription="slide"` named "N of M", and the ' +
          "track is a polite live region. Nothing moves on its own unless `autoplay` (ms) is set: it then holds " +
          "while the pointer rests on it or focus is inside, starts stopped under reduced motion, and shows a " +
          "rotation control." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [carousel](https://spartan.ng/components/carousel)\n" +
          "- shadcn/ui — [carousel](https://ui.shadcn.com/docs/components/carousel)\n" +
          "- Nuxt UI — [Carousel](https://ui.nuxt.com/docs/components/carousel)\n" +
          "- WAI-ARIA — [Carousel pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const SLIDES = `
  @for (n of [1, 2, 3, 4, 5]; track n) {
    <div soneCarouselItem>
      <div soneCard style="display: grid; place-items: center; aspect-ratio: 16 / 9">
        <span style="font-size: var(--font-size-3xl); font-weight: var(--font-weight-semibold)">{{ n }}</span>
      </div>
    </div>
  }`;

export const Default: Story = {
  render: () => ({
    template: `
      <sone-carousel aria-label="Highlights" style="max-width: 28rem">
        <div soneCarouselContent>${SLIDES}</div>
        <button soneCarouselPrevious></button>
        <button soneCarouselNext></button>
      </sone-carousel>`,
  }),
};

export const DotsAndLoop: Story = {
  render: () => ({
    props: { index: 2 },
    template: `
      <sone-carousel aria-label="Highlights" loop [(index)]="index" style="max-width: 28rem">
        <div soneCarouselContent>${SLIDES}</div>
        <button soneCarouselPrevious></button>
        <button soneCarouselNext></button>
        <sone-carousel-dots />
      </sone-carousel>
      <p style="color: var(--text-secondary)">Slide {{ index + 1 }}</p>`,
  }),
};

export const SeveralPerView: Story = {
  render: () => ({
    template: `
      <sone-carousel aria-label="Highlights" style="max-width: 36rem; --carousel-per-view: 3">
        <div soneCarouselContent>${SLIDES}</div>
        <button soneCarouselPrevious></button>
        <button soneCarouselNext></button>
      </sone-carousel>`,
  }),
};

export const Vertical: Story = {
  render: () => ({
    template: `
      <sone-carousel aria-label="Highlights" orientation="vertical" style="max-width: 20rem">
        <div soneCarouselContent style="height: 12rem">${SLIDES}</div>
        <button soneCarouselPrevious></button>
        <button soneCarouselNext></button>
      </sone-carousel>`,
  }),
};

export const Autoplay: Story = {
  render: () => ({
    template: `
      <sone-carousel aria-label="Highlights" [autoplay]="3000" style="max-width: 28rem">
        <div soneCarouselContent>${SLIDES}</div>
        <button soneCarouselPrevious></button>
        <button soneCarouselNext></button>
        <sone-carousel-dots />
      </sone-carousel>`,
  }),
};
