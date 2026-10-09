import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneToasterComponent, type SoneToast } from "./toaster.component";

const TOASTS: SoneToast[] = [
  { id: 1, kind: "success", message: "Saved to IndexOne." },
  {
    id: 2,
    kind: "info",
    message: "A new version is ready.",
    action: { label: "Restart" },
  },
  { id: 3, kind: "danger", message: "Couldn't reach the server." },
];

const meta: Meta = {
  title: "Components/Feedback/Toaster",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneToasterComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-toaster>` — spartan/ui `hlm-toaster` (shadcn Sonner). Presentational: the host owns " +
          "the queue and timers and passes `[toasts]`; `(dismiss)` and `(action)` report the toast id.",
      },
    },
  },
  render: () => ({
    props: { toasts: TOASTS },
    template: `<sone-toaster [toasts]="toasts" />`,
  }),
};
export default meta;
export const Default: StoryObj = {};
