import { type Meta, type StoryObj } from "@storybook/angular";

import { SoneLoadMoreComponent } from "./load-more.component";

const meta: Meta<SoneLoadMoreComponent> = {
  title: "Components/Data display/Load More",
  component: SoneLoadMoreComponent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-load-more>` — the “Show more” button at the end of a paged list. It emits `(load)`; set " +
          "`busy` while the page loads (the button stays focusable, `aria-disabled`, with a spinner and " +
          "`busyLabel`). `remaining` adds the count to the label and hides the control at 0. `error` shows the " +
          'message (`role="alert"`) above a `retryLabel` button. `align`: `center` | `start`.',
      },
    },
  },
  argTypes: {
    busy: { control: "boolean" },
    remaining: { control: "number" },
    error: { control: "text" },
    align: { control: "inline-radio", options: ["center", "start"] },
  },
  args: { busy: false, remaining: 12, error: null, align: "center" },
  render: (args) => ({
    props: args,
    template: `<sone-load-more [busy]="busy" [remaining]="remaining" [error]="error" [align]="align" />`,
  }),
};
export default meta;
type Story = StoryObj<SoneLoadMoreComponent>;

export const Default: Story = {};
export const Loading: Story = { args: { busy: true } };
export const Failed: Story = {
  args: { error: "The next page could not be loaded." },
};
export const Unknown: Story = { args: { remaining: null, align: "start" } };
