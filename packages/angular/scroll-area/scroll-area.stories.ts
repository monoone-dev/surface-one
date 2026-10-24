import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneSeparatorDirective } from "@surface-one/angular/separator";
import { SoneScrollAreaDirective } from "./scroll-area.directive";

const meta: Meta = {
  title: "Components/Layout/Scroll Area",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [SoneScrollAreaDirective, SoneSeparatorDirective],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`[soneScrollArea]` — a scroll container with thin, token-coloured scrollbars " +
          "(`scrollbar-width` / `scrollbar-color`, and the `::-webkit-scrollbar` pseudo-elements for " +
          "Safari) that keeps the browser's own scrolling: no scrollbar is emulated, so wheel, touch, " +
          "keyboard and assistive technology behave natively. Give it a height (a width for " +
          "`horizontal`); `orientation` is `vertical`, `horizontal` or `both`. While its content overflows " +
          'it is a keyboard stop (`tabindex="0"` unless you set one); name it with `aria-label` and it ' +
          "becomes a `region`. `fade` softens the edges where content is hidden (it masks the whole box: draw a border on a wrapper). On React Native, use " +
          "`ScrollView`." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [scroll-area](https://spartan.ng/components/scroll-area)\n" +
          "- shadcn/ui — [scroll-area](https://ui.shadcn.com/docs/components/scroll-area)\n" +
          "- Nuxt UI — [ScrollArea](https://ui.nuxt.com/docs/components/scroll-area)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const TAGS = `
  @for (n of tags; track n) {
    <div style="font-size: var(--font-size-sm)">v1.2.0-beta.{{ n }}</div>
    <hr soneSeparator style="margin-block: var(--space-2)" />
  }`;

export const Default: Story = {
  render: () => ({
    props: { tags: Array.from({ length: 40 }, (_, i) => 40 - i) },
    template: `
      <div soneScrollArea aria-label="Tags"
        style="height: 18rem; width: 12rem; border: var(--border-width-thin) solid var(--border); border-radius: var(--radius-md); padding: var(--space-4)">
        <h4 style="margin: 0 0 var(--space-4); font-size: var(--font-size-sm)">Tags</h4>
        ${TAGS}
      </div>`,
  }),
};

export const Fade: Story = {
  render: () => ({
    props: { tags: Array.from({ length: 40 }, (_, i) => 40 - i) },
    template: `
      <div style="width: 12rem; border: var(--border-width-thin) solid var(--border); border-radius: var(--radius-md)">
        <div soneScrollArea fade aria-label="Tags" style="height: 18rem; padding: var(--space-4)">
          ${TAGS}
        </div>
      </div>`,
  }),
};

export const Horizontal: Story = {
  render: () => ({
    props: { works: ["Ornella", "Tom", "Vladimir", "Ana", "Kim", "Ola"] },
    template: `
      <div style="width: 24rem; border: var(--border-width-thin) solid var(--border); border-radius: var(--radius-md)">
      <div soneScrollArea orientation="horizontal" fade aria-label="Artworks">
        <div style="display: flex; gap: var(--space-4); padding: var(--space-4); width: max-content">
          @for (w of works; track w) {
            <figure style="margin: 0">
              <div style="width: 9rem; aspect-ratio: 3 / 4; border-radius: var(--radius-md); background: var(--surface-hover)"></div>
              <figcaption style="padding-top: var(--space-2); font-size: var(--font-size-xs); color: var(--text-secondary)">Photo by {{ w }}</figcaption>
            </figure>
          }
        </div>
      </div>
      </div>`,
  }),
};
