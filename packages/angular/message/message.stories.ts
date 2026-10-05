import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_AVATAR_PARTS } from "@surface-one/angular/avatar";
import { SONE_BUBBLE_PARTS } from "@surface-one/angular/bubble";
import { SONE_MESSAGE_PARTS } from "./message.directive";

const meta: Meta = {
  title: "Components/Chat/Message",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        ...SONE_MESSAGE_PARTS,
        ...SONE_BUBBLE_PARTS,
        ...SONE_AVATAR_PARTS,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`[soneMessage]` — one entry of a thread: an avatar beside a column of header, bubble(s) and " +
          "footer. spartan/ui Message, 1:1: `[soneMessage] [align]` (`start` | `end`, `data-align`), " +
          "`[soneMessageAvatar]` (bottom of the row, lifted over a footer — put it on a `<sone-avatar>`), " +
          "`[soneMessageContent]`, `[soneMessageHeader]` / `[soneMessageFooter]` (muted `xs` meta lines) and " +
          "`[soneMessageGroup]`. Chat and the transcripts are built from it. CSS: `message.css`.\n\n" +
          "**Reference**\n" +
          "- spartan/ui — [https://www.spartan.ng/components/message](https://www.spartan.ng/components/message)",
      },
    },
  },
  render: () => ({
    template: `
      <div soneMessageGroup style="max-width: 520px">
        <div soneMessage>
          <sone-avatar soneMessageAvatar size="sm"><span soneAvatarFallback>AK</span></sone-avatar>
          <div soneMessageContent>
            <div soneMessageHeader>Anna · 12:04</div>
            <div soneBubble variant="muted"><div soneBubbleContent>Can we move the beta invite to next sprint?</div></div>
          </div>
        </div>
        <div soneMessage align="end">
          <sone-avatar soneMessageAvatar size="sm"><span soneAvatarFallback>ME</span></sone-avatar>
          <div soneMessageContent>
            <div soneBubble align="end"><div soneBubbleContent>Yes, if the copy lands by Friday.</div></div>
            <div soneMessageFooter>Read</div>
          </div>
        </div>
      </div>`,
  }),
};
export default meta;

export const Default: StoryObj = {};

export const Ghost: StoryObj = {
  render: () => ({
    template: `
      <div soneMessage style="max-width: 520px">
        <div soneMessageContent>
          <div soneMessageHeader>Assistant</div>
          <div soneBubble variant="ghost"><div soneBubbleContent>
            The team agreed to cut the checklist from twelve steps to five, and to ship the shorter
            version behind a flag first. Anna owns the rollout.
          </div></div>
          <div soneMessageFooter>2 sources</div>
        </div>
      </div>`,
  }),
};
