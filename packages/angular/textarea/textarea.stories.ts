import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SONE_TEXTAREA_PARTS } from "./textarea.directive";

const meta: Meta = {
  title: "Components/Forms/Textarea",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({ imports: [...SONE_TEXTAREA_PARTS, ...SONE_FIELD_PARTS] }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`textarea[soneTextarea]` — the native `<textarea>` in the skin's `--textarea-*` look " +
          "(padding, radius, leading and resize handle per skin). `autosize` fits the height to the " +
          "content between `minRows` and `maxRows` (it scrolls past them; the resize handle goes away), " +
          "`invalid` sets `aria-invalid` and the destructive ring, and `maxlength` is the native limit. " +
          '`<sone-textarea-count [for]="ta">` (`#ta="soneTextarea"`) shows `12/200`, tints as the limit ' +
          "nears and, once few characters are left, says how many in a polite live region. Inside " +
          "`[soneField]` the field points `aria-describedby` at its description and error." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [textarea](https://spartan.ng/components/textarea)\n" +
          "- shadcn/ui — [textarea](https://ui.shadcn.com/docs/components/textarea)\n" +
          "- Nuxt UI — [Textarea](https://ui.nuxt.com/docs/components/textarea)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => ({
    template: `
      <div soneField style="max-width: 28rem">
        <label soneFieldLabel for="story-message">Message</label>
        <textarea soneTextarea id="story-message" placeholder="Type your message here."></textarea>
      </div>`,
  }),
};

export const Autosize: Story = {
  render: () => ({
    template: `
      <div soneField style="max-width: 28rem">
        <label soneFieldLabel for="story-notes">Notes</label>
        <textarea soneTextarea id="story-notes" autosize minRows="2" maxRows="6"
          placeholder="Grows from two to six rows, then scrolls."></textarea>
      </div>`,
  }),
};

export const WithCounter: Story = {
  render: () => ({
    template: `
      <div soneField style="max-width: 28rem">
        <label soneFieldLabel for="story-bio">Bio</label>
        <textarea soneTextarea #bio="soneTextarea" id="story-bio" autosize minRows="3" maxlength="160">Designer in Kraków. I write about type, tokens and tidy interfaces.</textarea>
        <sone-textarea-count [for]="bio" />
        <p soneFieldDescription>Shown on your public profile.</p>
      </div>`,
  }),
};

export const Invalid: Story = {
  render: () => ({
    template: `
      <div soneField invalid style="max-width: 28rem">
        <label soneFieldLabel for="story-reason">Reason</label>
        <textarea soneTextarea id="story-reason" invalid></textarea>
        <p soneFieldError>Tell us why in a sentence or two.</p>
      </div>`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    template: `
      <div soneField disabled style="max-width: 28rem">
        <label soneFieldLabel for="story-locked">Locked note</label>
        <textarea soneTextarea id="story-locked" disabled>This note is read-only while the meeting is processing.</textarea>
      </div>`,
  }),
};
