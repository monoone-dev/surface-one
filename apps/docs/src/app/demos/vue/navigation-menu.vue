<script setup lang="ts">
import {
  SoneNavigationMenu,
  SoneNavigationMenuContent,
  SoneNavigationMenuItem,
  SoneNavigationMenuLink,
  SoneNavigationMenuList,
  SoneNavigationMenuTrigger,
} from "@surface-one/vue";
</script>

<template>
  <div class="demo-row" style="align-items: flex-start; min-height: 16rem">
    <SoneNavigationMenu aria-label="Product">
      <SoneNavigationMenuList>
        <SoneNavigationMenuItem value="start">
          <SoneNavigationMenuTrigger>Getting started</SoneNavigationMenuTrigger>
          <SoneNavigationMenuContent>
            <SoneNavigationMenuLink href="#introduction">
              Introduction
              <span class="text-hint">Tokens, skins and the components.</span>
            </SoneNavigationMenuLink>
            <SoneNavigationMenuLink href="#installation">
              Installation
              <span class="text-hint">Add SurfaceOne to an app.</span>
            </SoneNavigationMenuLink>
            <SoneNavigationMenuLink href="#theming">
              Theming
              <span class="text-hint">Skins, accents and dark mode.</span>
            </SoneNavigationMenuLink>
          </SoneNavigationMenuContent>
        </SoneNavigationMenuItem>
        <SoneNavigationMenuItem value="components">
          <SoneNavigationMenuTrigger>Components</SoneNavigationMenuTrigger>
          <SoneNavigationMenuContent>
            <SoneNavigationMenuLink href="#dialog">Dialog</SoneNavigationMenuLink>
            <SoneNavigationMenuLink href="#hover-card">Hover Card</SoneNavigationMenuLink>
            <SoneNavigationMenuLink href="#menubar">Menubar</SoneNavigationMenuLink>
          </SoneNavigationMenuContent>
        </SoneNavigationMenuItem>
        <SoneNavigationMenuItem>
          <SoneNavigationMenuLink href="#docs" active>Docs</SoneNavigationMenuLink>
        </SoneNavigationMenuItem>
      </SoneNavigationMenuList>
    </SoneNavigationMenu>
  </div>
</template>
