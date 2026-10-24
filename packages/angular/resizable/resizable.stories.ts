import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_RESIZABLE_PARTS } from "./resizable.component";

const meta: Meta = {
  title: "Components/Layout/Resizable",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [...SONE_RESIZABLE_PARTS] })],
  parameters: {
    docs: {
      description: {
        component:
          "`sone-resizable-group` + `sone-resizable-panel` / `sone-resizable-handle` — resizable panels " +
          'side by side (`direction="horizontal"`) or stacked (`vertical`). Sizes are percentages, two-way ' +
          "as `[(sizes)]`; each panel takes `defaultSize`, `minSize`, `maxSize`, `collapsible` and " +
          '`collapsedSize`. A handle is a WAI-ARIA window splitter (`role="separator"`, its value the size ' +
          "of the panel before it): drag it, or focus it and use the arrow keys (10%), Home / End and Enter " +
          "(collapse or restore a collapsible panel). `withHandle` draws a grip. `autoSaveId` with a " +
          "`storage` (`localStorage`, or your own `getItem` / `setItem`) keeps the sizes between visits — " +
          "the library never touches storage by itself. Web only." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [resizable](https://spartan.ng/components/resizable)\n" +
          "- shadcn/ui — [resizable](https://ui.shadcn.com/docs/components/resizable)\n" +
          "- WAI-ARIA — [Window Splitter pattern](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const BOX =
  "display: grid; place-items: center; height: 100%; padding: var(--space-6); font-weight: var(--font-weight-semibold)";

export const Default: Story = {
  render: () => ({
    template: `
      <sone-resizable-group style="max-width: 28rem; height: 12rem; border: var(--border-width-thin) solid var(--border); border-radius: var(--radius-lg)">
        <sone-resizable-panel defaultSize="50"><div style="${BOX}">One</div></sone-resizable-panel>
        <sone-resizable-handle />
        <sone-resizable-panel defaultSize="50">
          <sone-resizable-group direction="vertical">
            <sone-resizable-panel defaultSize="25"><div style="${BOX}">Two</div></sone-resizable-panel>
            <sone-resizable-handle />
            <sone-resizable-panel defaultSize="75"><div style="${BOX}">Three</div></sone-resizable-panel>
          </sone-resizable-group>
        </sone-resizable-panel>
      </sone-resizable-group>`,
  }),
};

export const WithHandle: Story = {
  render: () => ({
    props: { sizes: [] },
    template: `
      <sone-resizable-group [(sizes)]="sizes" style="max-width: 28rem; height: 12rem; border: var(--border-width-thin) solid var(--border); border-radius: var(--radius-lg)">
        <sone-resizable-panel defaultSize="25" minSize="15" collapsible><div style="${BOX}">Sidebar</div></sone-resizable-panel>
        <sone-resizable-handle withHandle />
        <sone-resizable-panel defaultSize="75" minSize="30"><div style="${BOX}">Content</div></sone-resizable-panel>
      </sone-resizable-group>
      <p style="color: var(--text-secondary)">sizes: {{ sizes.join(" / ") }}</p>`,
  }),
};

export const Vertical: Story = {
  render: () => ({
    template: `
      <sone-resizable-group direction="vertical" style="max-width: 28rem; height: 14rem; border: var(--border-width-thin) solid var(--border); border-radius: var(--radius-lg)">
        <sone-resizable-panel defaultSize="25"><div style="${BOX}">Header</div></sone-resizable-panel>
        <sone-resizable-handle withHandle />
        <sone-resizable-panel defaultSize="75"><div style="${BOX}">Content</div></sone-resizable-panel>
      </sone-resizable-group>`,
  }),
};
