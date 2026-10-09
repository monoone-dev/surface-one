import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SONE_ALERT_PARTS } from "./alert.directive";

const VARIANTS = [
  "default",
  "info",
  "success",
  "warning",
  "destructive",
] as const;

const meta: Meta = {
  title: "Components/Feedback/Alert",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [...SONE_ALERT_PARTS, SoneButtonDirective, SoneIconComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "spartan/ui Alert — `soneAlert` + `soneAlertTitle` / `soneAlertDescription` / `soneAlertAction` " +
          "and an optional leading 16px icon (`<sone-icon>` or an inline `<svg>`). Variants: spartan's " +
          "`default` / `destructive` plus Surface One's `warning` / `success` / `info`, drawn like " +
          "`destructive` in their own hue. **Minimalist (Nova)** = shadcn 1:1: the plain card surface, " +
          "the hue colours title, description (90%) and icon. **Studio / Paper** keep the soft status " +
          "tint with `--text-primary` copy and a glyph pulled toward the ink (≥3:1 on its tint) — " +
          "theme tokens (`--alert-tint`, `--alert-status-neutral`, `--alert-icon-hue`). `role` is the " +
          "author's: `alert` for an error the user must hear now, `status` for a change that appeared " +
          "while they worked, none / `note` for a standing notice." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/alert](https://spartan.ng/components/alert)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/alert](https://ui.shadcn.com/docs/components/alert)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const GLYPH: Record<string, string> = {
  default: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.25" stroke="currentColor" stroke-width="1.5"/><path d="M8 7.4v3.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="5.05" r=".85" fill="currentColor"/></svg>`,
  success: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.25" stroke="currentColor" stroke-width="1.5"/><path d="m5.4 8.2 1.8 1.8 3.4-3.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  warning: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M7.13 2.5a1 1 0 0 1 1.74 0l5.4 9.5a1 1 0 0 1-.87 1.5H2.6a1 1 0 0 1-.87-1.5l5.4-9.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 6.2v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="11.3" r=".85" fill="currentColor"/></svg>`,
  destructive: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.25" stroke="currentColor" stroke-width="1.5"/><path d="M8 4.9v3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="10.9" r=".85" fill="currentColor"/></svg>`,
};
GLYPH["info"] = GLYPH["default"];

const COPY: Record<string, [string, string]> = {
  default: [
    "Heads up",
    "Summaries are written by Claude Code unless you pick another provider.",
  ],
  info: [
    "Model download resumes",
    "Whisper finishes downloading when you are back online.",
  ],
  success: [
    "Note saved",
    "Weekly sync was saved to your workspace.",
  ],
  warning: [
    "System audio is off",
    "Only your microphone is recorded until you grant Screen Recording.",
  ],
  destructive: [
    "Couldn’t reach the summarizer",
    "Your transcript is safe — try again or switch provider.",
  ],
};

const full = (v: string, action = true) => `
  <div soneAlert variant="${v}" role="${v === "destructive" ? "alert" : "status"}">
    ${GLYPH[v]}
    <p soneAlertTitle>${COPY[v][0]}</p>
    <p soneAlertDescription>${COPY[v][1]}</p>
    ${action ? `<div soneAlertAction><button soneBtn variant="outline" size="xs" type="button">Details</button></div>` : ""}
  </div>`;

const column = (body: string) =>
  `<div style="display: grid; gap: var(--space-3); max-width: 34rem">${body}</div>`;

export const Variants: Story = {
  render: () => ({ template: column(VARIANTS.map((v) => full(v)).join("")) }),
};

export const Anatomy: Story = {
  render: () => ({
    template: column(`
      <div soneAlert variant="info"><p soneAlertTitle>Title only</p></div>
      <div soneAlert variant="info"><p soneAlertDescription>Description only — no title, no icon.</p></div>
      <div soneAlert variant="info">${GLYPH["info"]}<p soneAlertTitle>Icon + title</p></div>
      <div soneAlert variant="info">
        ${GLYPH["info"]}
        <p soneAlertTitle>Icon + title + description</p>
        <p soneAlertDescription>The icon spans both text rows.</p>
      </div>
      <div soneAlert variant="info">
        <p soneAlertTitle>Title + description + action, no icon</p>
        <p soneAlertDescription>The action sits top-right and spans both rows.</p>
        <div soneAlertAction><button soneBtn variant="outline" size="xs" type="button">Enable</button></div>
      </div>
      <div soneAlert variant="info">
        ${GLYPH["info"]}
        <p soneAlertTitle>A long title that has to wrap because the alert is narrow and the action takes room</p>
        <div soneAlertDescription>
          <p>Descriptions can hold several paragraphs.</p>
          <p>Links <a href="#">stay underlined</a> and inherit the text colour.</p>
        </div>
        <div soneAlertAction><button soneBtn variant="ghost" size="xs" type="button">Dismiss</button></div>
      </div>`),
  }),
};

export const WithSoneIcon: Story = {
  render: () => ({
    template: column(`
      <div soneAlert variant="warning" role="status">
        <sone-icon icon="lock" />
        <p soneAlertTitle>3 items belong to a locked folder</p>
        <p soneAlertDescription>Unlock the folder to see, restore or delete them.</p>
        <div soneAlertAction><button soneBtn variant="outline" size="xs" type="button">Unlock</button></div>
      </div>
      <div soneAlert variant="success" role="status">
        <sone-icon icon="check" />
        <p soneAlertTitle>Recording saved</p>
      </div>`),
  }),
};

export const RowLayout: Story = {
  render: () => ({
    template: column(
      VARIANTS.map(
        (v) => `
        <div soneAlert variant="${v}" role="status">
          ${GLYPH[v]}
          <span>${COPY[v][1]}</span>
          <div soneAlertAction><button soneBtn variant="ghost" size="sm" type="button">Retry</button></div>
        </div>`,
      ).join(""),
    ),
  }),
};

export const Plain: Story = {
  render: () => ({
    template: column(
      VARIANTS.map(
        (v) =>
          `<div soneAlert variant="${v}"><span>${v} — ${COPY[v][1]}</span></div>`,
      ).join(""),
    ),
  }),
};

export const InsideCard: Story = {
  render: () => ({
    template: `
      <div class="card" style="max-width: 34rem; display: grid; gap: var(--space-3)">
        ${full("warning", false)}
        ${full("destructive")}
      </div>`,
  }),
};
