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
          "spacing). Need a separate title, description or action slot? Use `soneAlert` directly.\n\n" +
          "`floating` turns it into an opaque overlay banner for a fixed notice over the page: the " +
          "overlay surface (`--surface-overlay`), `--shadow-lg`, and a `--border-strong` border " +
          "(the status colour for `success`, `warning` and `danger`) instead of the translucent tint.",
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
        <sone-banner kind="success">Saved to your workspace.</sone-banner>
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
          <p>That folder is the app’s own backup.</p>
          <p>Importing it would read the app’s own notes back in. <a href="#">Pick a different folder</a>.</p>
        </sone-banner>
        <sone-banner kind="info">Links <a href="#">stay underlined</a> and inherit the banner’s ink.</sone-banner>
        <sone-banner kind="success">Saved. <a href="#">Open the note</a></sone-banner>
      </div>`,
  }),
};

export const Floating: Story = {
  render: () => ({
    template: `
      <div
        style="position: relative; display: grid; gap: var(--space-3); padding: var(--space-5);
               background: repeating-linear-gradient(45deg, var(--surface-raised) 0 var(--space-2),
               var(--surface-hover) var(--space-2) var(--space-4)); border-radius: var(--radius-lg)"
      >
        <sone-banner kind="info" floating>Signed out on this Mac — sharing pauses until you sign in.</sone-banner>
        <sone-banner kind="success" floating>Restructure finished — 42 notes moved.</sone-banner>
        <sone-banner kind="warning" floating>Filing was interrupted. <a href="#">Resume filing</a></sone-banner>
        <sone-banner kind="danger" floating>Couldn’t reach the server. Changes stay on this Mac.</sone-banner>
      </div>`,
  }),
};
