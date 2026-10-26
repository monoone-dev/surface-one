import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneRailButtonComponent } from "./rail-button.component";
import { SoneRailComponent, SoneRailGroupDirective } from "./rail.component";

const meta: Meta = {
  title: "Components/Navigation/Rail",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        SoneRailComponent,
        SoneRailGroupDirective,
        SoneRailButtonComponent,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-rail>` — a narrow column of icon buttons beside the page, on the glass in the Surface " +
          "skin: a `nav` landmark (`ariaLabel`) with `[soneRailGroup]` blocks spread from top to bottom. " +
          "Each `<sone-rail-button>` takes an `icon` and a `label` (its accessible name and tooltip); " +
          '`current` marks the place on screen (`aria-current="page"`) as a raised island with the accent ' +
          "icon, and `badge` adds a `busy` (pulsing), `attention` or `ok` dot.\n\n**Reference**\n" +
          "- shadcn/ui — [sidebar, collapsed to icons](https://ui.shadcn.com/docs/components/sidebar)\n" +
          "- Material Design — [navigation rail](https://m3.material.io/components/navigation-rail/overview)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const RAIL = (current: string) => `<div style="display: flex; height: 22rem">
  <sone-rail ariaLabel="App">
    <div soneRailGroup>
      <sone-rail-button icon="dashboards" label="Home" ${current === "home" ? "current" : ""} />
      <sone-rail-button icon="search" label="Search" ${current === "search" ? "current" : ""} />
      <sone-rail-button icon="message-square" label="Chats" badge="busy" />
      <sone-rail-button icon="bell" label="Inbox" badge="attention" />
    </div>
    <div soneRailGroup>
      <sone-rail-button icon="settings" label="Settings" />
    </div>
  </sone-rail>
</div>`;

export const Default: Story = { render: () => ({ template: RAIL("home") }) };

export const Badges: Story = {
  render: () => ({
    template: `<sone-rail ariaLabel="Status"><div soneRailGroup>
      <sone-rail-button icon="workflow" label="Runs, one running" badge="busy" />
      <sone-rail-button icon="bell" label="Inbox, needs attention" badge="attention" />
      <sone-rail-button icon="database" label="Sync, up to date" badge="ok" />
      <sone-rail-button icon="lock" label="Locked" disabled />
    </div></sone-rail>`,
  }),
};
