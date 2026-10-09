import type { Meta, StoryObj } from "@storybook/angular";

import { SoneBannerComponent } from "./banner.component";

const meta: Meta<SoneBannerComponent> = {
  title: "Components/Feedback/Banner",
  component: SoneBannerComponent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-banner>` — a one-line status callout: a thin wrapper over the `soneAlert` surface " +
          "(`danger` → `destructive`) with a leading 16px status glyph (info circle, check, warning " +
          'triangle, alert circle). `danger` and `warning` announce with `role="alert"` ' +
          '(something failed or stopped), `info` and `success` with `role="status"`. The body takes ' +
          "shadcn's AlertDescription copy rules (underlined links that inherit the ink, paragraph " +
          "spacing). Need a separate title, description or action slot? Use `soneAlert` directly.",
      },
    },
  },
  argTypes: {
    kind: {
      control: "inline-radio",
      options: ["info", "success", "warning", "danger"],
    },
  },
  args: { kind: "info" },
  render: (args) => ({
    props: args,
    template: `<sone-banner [kind]="kind">Transcription finished — the note is ready.</sone-banner>`,
  }),
};
export default meta;
type Story = StoryObj<SoneBannerComponent>;

export const Info: Story = {};
export const Success: Story = { args: { kind: "success" } };
export const Warning: Story = { args: { kind: "warning" } };
export const Danger: Story = { args: { kind: "danger" } };

export const AllKinds: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: var(--space-3)">
        <sone-banner kind="info">Model download resumes when you’re back online.</sone-banner>
        <sone-banner kind="success">Saved to IndexOne.</sone-banner>
        <sone-banner kind="warning">System audio permission is missing — only your mic is recorded.</sone-banner>
        <sone-banner kind="danger">Couldn’t reach the summarizer. Your transcript is safe.</sone-banner>
        <sone-banner kind="info">
          A longer notice wraps under itself and keeps the glyph pinned to the first line: 3 titles
          appear more than once — turn on “Mirror the source tree” to keep them apart.
        </sone-banner>
      </div>`,
  }),
};

export const RichContent: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: var(--space-3); max-width: 34rem">
        <sone-banner kind="warning">
          <strong>Live captions stopped.</strong>
          Recording continues — the full transcript still runs after Stop.
          <a href="#">Check caption settings</a>
        </sone-banner>
        <sone-banner kind="danger">
          <p>That folder is IndexOne’s own backup.</p>
          <p>Importing it would read IndexOne’s own notes back in. <a href="#">Pick a different folder</a>.</p>
        </sone-banner>
        <sone-banner kind="info">Links <a href="#">stay underlined</a> and inherit the banner’s ink.</sone-banner>
        <sone-banner kind="success">Saved. <a href="#">Open the note</a></sone-banner>
      </div>`,
  }),
};
