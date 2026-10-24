import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_NAVIGATION_MENU_PARTS } from "./navigation-menu.directive";

const meta: Meta = {
  title: "Components/Navigation/Navigation Menu",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [...SONE_NAVIGATION_MENU_PARTS] })],
  parameters: {
    docs: {
      description: {
        component:
          "`nav[soneNavigationMenu]` + `soneNavigationMenuList` / `soneNavigationMenuItem` / " +
          "`soneNavigationMenuTrigger` / `soneNavigationMenuContent` / `soneNavigationMenuLink` (`active`) — " +
          "site navigation, not an ARIA menu: triggers are buttons with `aria-expanded` and `aria-controls`, links " +
          'are links (`aria-current="page"`), Tab goes through them in order. One content is open at a time ' +
          "(`[(value)]`): a click, ArrowDown (on its first link) or a hover (after `openDelay`, 200 ms; at once " +
          "while another is open) opens it; leaving the item (`closeDelay`, 150 ms), Escape (focus back on the " +
          "trigger), a click outside, focus leaving the menu or following a link close it. ArrowLeft / ArrowRight, " +
          "Home and End move between top-level items. Closed contents stay in the page (`hidden`), so the links " +
          "are prerendered. The content opens under its item (shadcn/ui `viewport={false}`)." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [navigation-menu](https://spartan.ng/components/navigation-menu)\n" +
          "- shadcn/ui — [navigation-menu](https://ui.shadcn.com/docs/components/navigation-menu)\n" +
          "- Nuxt UI — [NavigationMenu](https://ui.nuxt.com/docs/components/navigation-menu)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => ({
    template: `
      <div style="min-height: 18rem">
        <nav soneNavigationMenu aria-label="Main">
          <ul soneNavigationMenuList>
            <li soneNavigationMenuItem value="start">
              <button soneNavigationMenuTrigger>Getting started</button>
              <div soneNavigationMenuContent>
                <a soneNavigationMenuLink href="#intro">Introduction<span class="text-hint">Tokens, skins and the components.</span></a>
                <a soneNavigationMenuLink href="#install">Installation<span class="text-hint">Add SurfaceOne to an app.</span></a>
                <a soneNavigationMenuLink href="#theming">Theming<span class="text-hint">Skins, accents and dark mode.</span></a>
              </div>
            </li>
            <li soneNavigationMenuItem value="components">
              <button soneNavigationMenuTrigger>Components</button>
              <div soneNavigationMenuContent>
                <a soneNavigationMenuLink href="#dialog">Dialog</a>
                <a soneNavigationMenuLink href="#hover-card">Hover Card</a>
                <a soneNavigationMenuLink href="#menu">Menu</a>
              </div>
            </li>
            <li soneNavigationMenuItem>
              <a soneNavigationMenuLink href="#docs" active>Docs</a>
            </li>
          </ul>
        </nav>
      </div>`,
  }),
};

export const OpenByDefault: Story = {
  render: () => ({
    props: { value: "components" },
    template: `
      <div style="min-height: 14rem">
        <nav soneNavigationMenu aria-label="Open" [(value)]="value">
          <ul soneNavigationMenuList>
            <li soneNavigationMenuItem value="components">
              <button soneNavigationMenuTrigger>Components</button>
              <div soneNavigationMenuContent>
                <a soneNavigationMenuLink href="#button">Button</a>
                <a soneNavigationMenuLink href="#card" active>Card</a>
              </div>
            </li>
          </ul>
        </nav>
        <p style="color: var(--text-secondary)">value: {{ value }}</p>
      </div>`,
  }),
};
