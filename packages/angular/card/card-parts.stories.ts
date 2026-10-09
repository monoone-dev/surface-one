import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneSeparatorDirective } from "@surface-one/angular/separator";
import { SONE_CARD_PARTS } from "./card-parts.directive";

const meta: Meta = {
  title: "Components/Layout/Card anatomy",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        ...SONE_CARD_PARTS,
        SoneButtonDirective,
        SoneSeparatorDirective,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "spartan/ui Card: `soneCard` + `soneCardHeader` (grid: title / description, `soneCardAction` " +
          "top-right spanning both rows) / `soneCardTitle` (16px, 14px at `sm`) / `soneCardDescription` " +
          "(14px secondary) / `soneCardContent` / `soneCardFooter` (flex row). Sizes: `default` " +
          '(24px padding and gap) · `sm` (16px). Plain `class="card"` ' +
          "is the same surface without the stacked layout. `.panel-card` is the calm, shadow-less " +
          "in-panel block (spartan has no card variant for it).\n\n" +
          "**Per skin** (toolbar → Skin): Minimalist = shadcn Nova 1:1 (16/12px, `ring-foreground/10` " +
          "edge, no shadow or blur, action gap 4px, and the footer becomes a `muted/50` band that " +
          "bleeds to the card edge under a hairline — see *Footer band*); Studio = Vega rhythm in " +
          "an opaque card (24/16px, `shadow-xs` contact shadow, 4px action gap); Paper = Maia (18px " +
          "corner, header and action gap 8px, no shadow, the `sm` title stays 16px). A leading / trailing `<img>` runs " +
          "edge to edge (see *Image*)." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://www.spartan.ng/components/card](https://www.spartan.ng/components/card)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/card](https://ui.shadcn.com/docs/components/card)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const storage = (size: string, extra = "") => `
  <section soneCard size="${size}" style="width: 24rem" ${extra}>
    <header soneCardHeader>
      <h3 soneCardTitle>Storage</h3>
      <p soneCardDescription>Audio kept on this Mac.</p>
      <button soneCardAction soneBtn variant="ghost" size="sm" type="button">Reveal</button>
    </header>
    <div soneCardContent>12.4 GB of 20 GB used — 38 recordings, 6 sealed.</div>
    <footer soneCardFooter>
      <button soneBtn variant="outline" size="sm" type="button">Free up space</button>
      <button soneBtn variant="ghost" size="sm" type="button">Settings</button>
    </footer>
  </section>`;

export const Card: Story = { render: () => ({ template: storage("default") }) };

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: var(--space-5); align-items: flex-start">
        ${storage("default")}
        ${storage("sm")}
      </div>`,
  }),
};

export const HeaderMatrix: Story = {
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(2, 20rem); gap: var(--space-4)">
        <section soneCard size="sm"><header soneCardHeader><h3 soneCardTitle>Title only</h3></header></section>
        <section soneCard size="sm">
          <header soneCardHeader>
            <h3 soneCardTitle>Title + action</h3>
            <button soneCardAction soneBtn variant="outline" size="xs" type="button">Edit</button>
          </header>
        </section>
        <section soneCard size="sm">
          <header soneCardHeader>
            <h3 soneCardTitle>Title + description</h3>
            <p soneCardDescription>No action — the title takes the full width of the header.</p>
          </header>
        </section>
        <section soneCard size="sm">
          <header soneCardHeader>
            <h3 soneCardTitle>A long card title that wraps onto a second line</h3>
            <p soneCardDescription>Action spans both rows, top-right.</p>
            <button soneCardAction soneBtn variant="ghost" size="icon-sm" type="button" aria-label="More">…</button>
          </header>
        </section>
      </div>`,
  }),
};

export const FooterBand: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: var(--space-5); align-items: flex-start">
        <section soneCard style="width: 20rem">
          <header soneCardHeader>
            <h3 soneCardTitle>Backups</h3>
            <p soneCardDescription>Saves a copy of every note to a folder you choose.</p>
          </header>
          <div soneCardContent>Last backup 3 min ago · 214 notes.</div>
          <footer soneCardFooter>
            <button soneBtn size="sm" type="button">Back up now</button>
            <button soneBtn variant="ghost" size="sm" type="button">Choose folder</button>
          </footer>
        </section>
        <section soneCard size="sm" style="width: 18rem">
          <header soneCardHeader>
            <h3 soneCardTitle>Small card</h3>
            <p soneCardDescription>The band follows the 16 → 12px rhythm.</p>
          </header>
          <footer soneCardFooter><button soneBtn variant="outline" size="sm" type="button">Open</button></footer>
        </section>
      </div>`,
  }),
};

export const WithSeparator: Story = {
  render: () => ({
    template: `
      <section soneCard style="width: 24rem">
        <header soneCardHeader>
          <h3 soneCardTitle>Weekly sync</h3>
          <p soneCardDescription>Tue 14:00 · 42 min</p>
        </header>
        <div soneCardContent>Decided to ship the Paper skin behind a toggle.</div>
        <div soneSeparator></div>
        <footer soneCardFooter><button soneBtn variant="link" size="sm" type="button">Open note</button></footer>
      </section>`,
  }),
};

export const Image: Story = {
  render: () => ({
    template: `
      <section soneCard style="width: 20rem">
        <img alt="" width="320" height="120"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='120'%3E%3Crect width='320' height='120' fill='%23a3a3a3'/%3E%3C/svg%3E" />
        <header soneCardHeader>
          <h3 soneCardTitle>Offsite recap</h3>
          <p soneCardDescription>Whiteboard photo attached to the note.</p>
        </header>
        <div soneCardContent>Three decisions, two owners, one follow-up on Friday.</div>
      </section>`,
  }),
};

export const SurfaceComparison: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: var(--space-4)">
        <div class="card" style="width: 16rem">
          <strong>.card</strong>
          <p style="margin: var(--space-2) 0 0; color: var(--text-secondary)">Opaque, 1px ring edge; the skin's card shadow (none in Minimalist).</p>
        </div>
        <div class="panel-card" style="width: 16rem; padding: var(--space-5)">
          <strong>.panel-card</strong>
          <p style="margin: var(--space-2) 0 0; color: var(--text-secondary)">Calm: raised fill + subtle hairline, no shadow.</p>
        </div>
      </div>`,
  }),
};
