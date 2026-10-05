import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneKbdGroupComponent } from "./kbd-group.component";
import { SoneKbdComponent } from "./kbd.component";

const meta: Meta<SoneKbdComponent> = {
  title: "Components/Data display/Kbd",
  component: SoneKbdComponent,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({ imports: [SoneKbdGroupComponent, SoneButtonDirective] }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-kbd>` — one key cap (spartan/ui `hlmKbd`: 20px tall, at least square, 12px medium). " +
          "`<sone-kbd-group>` wraps a combination in an outer `<kbd>` (`hlmKbdGroup`, 4px gap). Content is projected; " +
          "an unsized projected `<svg>` renders at 12px.\n\n" +
          "shadcn's cap is identical in Vega / Nova / Maia (h-5, min-w-5, px-1, rounded-sm, bg-muted, " +
          "no border) — the core. Studio / Paper theme a hairline and a tighter corner back in " +
          "through `--kbd-bg` / `--kbd-border-width` / `--kbd-border` / `--kbd-radius`." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/kbd](https://spartan.ng/components/kbd)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/kbd](https://ui.shadcn.com/docs/components/kbd)",
      },
    },
  },
  render: () => ({ template: `<sone-kbd>⌘K</sone-kbd>` }),
};
export default meta;
type Story = StoryObj<SoneKbdComponent>;

export const Default: Story = {};

export const Group: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-4)">
        <sone-kbd-group><sone-kbd>⌘</sone-kbd><sone-kbd>⇧</sone-kbd><sone-kbd>⌥</sone-kbd><sone-kbd>⌃</sone-kbd></sone-kbd-group>
        <sone-kbd-group><sone-kbd>⌘</sone-kbd><sone-kbd>K</sone-kbd></sone-kbd-group>
        <sone-kbd-group><sone-kbd>Ctrl</sone-kbd><span>+</span><sone-kbd>B</sone-kbd></sone-kbd-group>
        <sone-kbd-group><sone-kbd>esc</sone-kbd><sone-kbd>↵</sone-kbd><sone-kbd>⌫</sone-kbd><sone-kbd>Tab</sone-kbd></sone-kbd-group>
      </div>`,
  }),
};

export const WithIcon: Story = {
  render: () => ({
    template: `
      <sone-kbd-group>
        <sone-kbd>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          K
        </sone-kbd>
        <sone-kbd>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M9 10 4 15l5 5" /><path d="M20 4v7a4 4 0 0 1-4 4H4" />
          </svg>
        </sone-kbd>
      </sone-kbd-group>`,
  }),
};

export const InCopy: Story = {
  render: () => ({
    template: `
      <p style="color: var(--text-secondary); margin: 0">
        Press <sone-kbd-group><sone-kbd>⌘</sone-kbd><sone-kbd>K</sone-kbd></sone-kbd-group> to search,
        <sone-kbd>↑</sone-kbd> <sone-kbd>↓</sone-kbd> to move and <sone-kbd>esc</sone-kbd> to close.
      </p>`,
  }),
};

export const InButton: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: var(--space-3)">
        <button soneBtn variant="outline" size="sm" type="button">Accept <sone-kbd>↵</sone-kbd></button>
        <button soneBtn variant="outline" size="sm" type="button">Cancel <sone-kbd>esc</sone-kbd></button>
        <button soneBtn variant="ghost" size="sm" type="button">Record <sone-kbd-group><sone-kbd>⌘</sone-kbd><sone-kbd>R</sone-kbd></sone-kbd-group></button>
      </div>`,
  }),
};

export const OnOverlay: Story = {
  render: () => ({
    template: `
      <div style="display: inline-flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4);
                  background: var(--surface-overlay); border: 1px solid var(--border-strong); border-radius: var(--radius-md);
                  box-shadow: var(--shadow-lg); color: var(--text-primary); font-size: var(--font-size-sm)">
        New note <sone-kbd-group><sone-kbd>⌘</sone-kbd><sone-kbd>N</sone-kbd></sone-kbd-group>
      </div>`,
  }),
};
