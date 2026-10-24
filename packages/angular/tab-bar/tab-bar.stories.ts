import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneTabBarComponent } from "./tab-bar.component";
import type { TabBarItem } from "./tab-bar-items";

const ITEMS: TabBarItem[] = [
  { value: "home", label: "Home", icon: "dashboards" },
  { value: "search", label: "Search", icon: "search" },
  { value: "inbox", label: "Inbox", icon: "bell" },
  { value: "profile", label: "Profile", icon: "user" },
];

const meta: Meta = {
  title: "Components/Navigation/Tab bar",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneTabBarComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-tab-bar>` — mobile-style bottom navigation for the web, the twin of the React Native " +
          "`SoneTabBar`: a `nav` of `items` (`{ value, label, icon, href, disabled }`), links with " +
          '`aria-current="page"` or buttons, the active one two-way as `[(value)]`. `labels="active"` ' +
          "(the default) shows the active tab's label only — the others keep theirs for screen readers; " +
          '`labels="always"` shows every label. `floating` (the default) is a centred pill that sticks to ' +
          'the bottom of the page; `[floating]="false"` a full-width bar. Both clear the home indicator ' +
          "with `env(safe-area-inset-bottom)`.\n\n**Reference**\n" +
          "- Material Design — [navigation bar](https://m3.material.io/components/navigation-bar/overview)\n" +
          "- Apple HIG — [tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Floating: Story = {
  render: () => ({
    props: { items: ITEMS, value: "home" },
    template: `<sone-tab-bar ariaLabel="Main" [items]="items" [(value)]="value" />
      <p style="color: var(--text-secondary)">value: {{ value }}</p>`,
  }),
};

export const FullWidth: Story = {
  render: () => ({
    props: { items: ITEMS, value: "inbox" },
    template: `<div style="max-width: 24rem"><sone-tab-bar ariaLabel="Main" [items]="items" [(value)]="value" [floating]="false" labels="always" /></div>`,
  }),
};

export const Links: Story = {
  render: () => ({
    props: {
      items: ITEMS.map((item) => ({ ...item, href: `#${item.value}` })),
      value: "search",
    },
    template: `<sone-tab-bar ariaLabel="Main" [items]="items" [(value)]="value" />`,
  }),
};
