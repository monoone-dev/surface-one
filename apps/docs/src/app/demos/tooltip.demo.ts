import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SoneTooltipDirective } from "@surface-one/angular/tooltip";

const TEMPLATE = `<div class="demo-stack">
  <div class="demo-row">
    <button soneBtn variant="ghost" size="icon" type="button" aria-label="New note" soneTooltip="New note (⌘N)">
      <sone-icon icon="note-add" />
    </button>
    <button soneBtn variant="ghost" size="icon" type="button" aria-label="Search" soneTooltip="Search">
      <sone-icon icon="search" />
    </button>
    <button soneBtn variant="ghost" size="icon" type="button" aria-label="Move to trash" soneTooltip="Move to trash">
      <sone-icon icon="trash" />
    </button>
  </div>
  <div class="demo-row">
    <button soneBtn variant="outline" size="sm" type="button" soneTooltip="Opens above" soneTooltipSide="top">Top</button>
    <button soneBtn variant="outline" size="sm" type="button" soneTooltip="Opens to the right" soneTooltipSide="right">Right</button>
    <button soneBtn variant="outline" size="sm" type="button" soneTooltip="Opens below (default)">Bottom</button>
    <button soneBtn variant="outline" size="sm" type="button" soneTooltip="Opens to the left" soneTooltipSide="left">Left</button>
    <button soneBtn variant="outline" size="sm" type="button" soneTooltip="Shown instantly, no arrow"
      [soneTooltipShowDelay]="0" [soneTooltipArrow]="false">No delay</button>
  </div>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { SoneButton, SoneIcon, vSoneTooltip } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <SoneButton v-sone-tooltip="'New note (⌘N)'" variant="ghost" size="icon" type="button" aria-label="New note">
        <SoneIcon icon="note-add" />
      </SoneButton>
      <SoneButton v-sone-tooltip="'Search'" variant="ghost" size="icon" type="button" aria-label="Search">
        <SoneIcon icon="search" />
      </SoneButton>
      <SoneButton v-sone-tooltip="'Move to trash'" variant="ghost" size="icon" type="button" aria-label="Move to trash">
        <SoneIcon icon="trash" />
      </SoneButton>
    </div>
    <div class="demo-row">
      <SoneButton v-sone-tooltip:top="'Opens above'" variant="outline" size="sm" type="button">Top</SoneButton>
      <SoneButton v-sone-tooltip:right="'Opens to the right'" variant="outline" size="sm" type="button">Right</SoneButton>
      <SoneButton v-sone-tooltip="'Opens below (default)'" variant="outline" size="sm" type="button">Bottom</SoneButton>
      <SoneButton v-sone-tooltip:left="'Opens to the left'" variant="outline" size="sm" type="button">Left</SoneButton>
      <SoneButton
        v-sone-tooltip="{ text: 'Shown instantly, no arrow', showDelay: 0, arrow: false }"
        variant="outline"
        size="sm"
        type="button"
        >No delay</SoneButton
      >
    </div>
  </div>
</template>
`;

/** The same demo with @surface-one/react (React 19 / Next.js). */
export const reactCode = `import { SoneButton, SoneIcon, SoneTooltip, useSoneTooltip } from "@surface-one/react";

export default function TooltipDemo() {
  // The hook form: put the returned ref on the element.
  const searchTooltip = useSoneTooltip<HTMLButtonElement>("Search");

  return (
    <div className="demo-stack">
      <div className="demo-row">
        <SoneTooltip text="New note (⌘N)">
          <SoneButton variant="ghost" size="icon" type="button" aria-label="New note">
            <SoneIcon icon="note-add" />
          </SoneButton>
        </SoneTooltip>
        <SoneButton ref={searchTooltip} variant="ghost" size="icon" type="button" aria-label="Search">
          <SoneIcon icon="search" />
        </SoneButton>
        <SoneTooltip text="Move to trash">
          <SoneButton variant="ghost" size="icon" type="button" aria-label="Move to trash">
            <SoneIcon icon="trash" />
          </SoneButton>
        </SoneTooltip>
      </div>
      <div className="demo-row">
        <SoneTooltip text="Opens above" side="top">
          <SoneButton variant="outline" size="sm" type="button">Top</SoneButton>
        </SoneTooltip>
        <SoneTooltip text="Opens to the right" side="right">
          <SoneButton variant="outline" size="sm" type="button">Right</SoneButton>
        </SoneTooltip>
        <SoneTooltip text="Opens below (default)">
          <SoneButton variant="outline" size="sm" type="button">Bottom</SoneButton>
        </SoneTooltip>
        <SoneTooltip text="Opens to the left" side="left">
          <SoneButton variant="outline" size="sm" type="button">Left</SoneButton>
        </SoneTooltip>
        <SoneTooltip text="Shown instantly, no arrow" showDelay={0} arrow={false}>
          <SoneButton variant="outline" size="sm" type="button">No delay</SoneButton>
        </SoneTooltip>
      </div>
    </div>
  );
}
`;

@Component({
  selector: "docs-tooltip-demo",
  imports: [SoneButtonDirective, SoneIconComponent, SoneTooltipDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class TooltipDemo {}
