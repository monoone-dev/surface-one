import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SONE_NAVIGATION_MENU_PARTS } from "@surface-one/angular/navigation-menu";

const TEMPLATE = `<div class="demo-row" style="align-items: flex-start; min-height: 16rem">
  <nav soneNavigationMenu aria-label="Product">
    <ul soneNavigationMenuList>
      <li soneNavigationMenuItem value="start">
        <button soneNavigationMenuTrigger>Getting started</button>
        <div soneNavigationMenuContent>
          <a soneNavigationMenuLink href="#introduction">
            Introduction
            <span class="text-hint">Tokens, skins and the components.</span>
          </a>
          <a soneNavigationMenuLink href="#installation">
            Installation
            <span class="text-hint">Add SurfaceOne to an app.</span>
          </a>
          <a soneNavigationMenuLink href="#theming">
            Theming
            <span class="text-hint">Skins, accents and dark mode.</span>
          </a>
        </div>
      </li>
      <li soneNavigationMenuItem value="components">
        <button soneNavigationMenuTrigger>Components</button>
        <div soneNavigationMenuContent>
          <a soneNavigationMenuLink href="#dialog">Dialog</a>
          <a soneNavigationMenuLink href="#hover-card">Hover Card</a>
          <a soneNavigationMenuLink href="#menubar">Menubar</a>
        </div>
      </li>
      <li soneNavigationMenuItem>
        <a soneNavigationMenuLink href="#docs" active>Docs</a>
      </li>
    </ul>
  </nav>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-navigation-menu-demo",
  imports: [...SONE_NAVIGATION_MENU_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class NavigationMenuDemo {}
