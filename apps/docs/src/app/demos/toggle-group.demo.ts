import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SONE_TOGGLE_PARTS } from "@surface-one/angular/toggle-group";

const TEMPLATE = `<div class="demo-stack">
  <div class="demo-row">
    <div soneToggleGroup variant="outline" role="group" aria-label="View">
      @for (v of ['List', 'Board', 'Calendar']; track v) {
        <button soneToggleGroupItem type="button" [pressed]="view() === v" (click)="view.set(v)">{{ v }}</button>
      }
    </div>
    <button soneToggle variant="outline" type="button" [pressed]="pinned()" (click)="pinned.set(!pinned())">
      <sone-icon icon="star" inline="start" /> Pinned
    </button>
    <button soneToggle type="button" aria-label="Lock editing" [pressed]="locked()" (click)="locked.set(!locked())">
      <sone-icon icon="lock" />
    </button>
  </div>
  <div style="display: grid; gap: var(--space-3)">
    <div soneTabsList role="tablist" aria-label="Project">
      @for (t of ['Overview', 'Activity', 'Settings']; track t) {
        <button soneTabsTrigger role="tab" type="button" [id]="'demo-tab-' + t"
          [active]="tab() === t" [attr.tabindex]="tab() === t ? 0 : -1" (click)="tab.set(t)">{{ t }}</button>
      }
    </div>
    <div role="tabpanel" [attr.aria-labelledby]="'demo-tab-' + tab()" style="color: var(--text-secondary)">
      {{ tab() }} content goes here.
    </div>
  </div>
  <!-- dashed: the off state reads as "still to pick"; stretch: equal-width tabs -->
  <div style="display: grid; gap: var(--space-3); max-width: 24rem">
    <div soneToggleGroup variant="dashed" size="sm" spacing="2" role="group" aria-label="Destination">
      @for (d of ['Existing folder', 'New folder']; track d) {
        <button soneToggleGroupItem type="button" [pressed]="dest() === d" (click)="dest.set(d)">{{ d }}</button>
      }
    </div>
    <div soneTabsList stretch aria-label="Kind">
      @for (k of ['Folder', 'Workspace']; track k) {
        <button soneTabsTrigger type="button" [active]="kind() === k" (click)="kind.set(k)">{{ k }}</button>
      }
    </div>
  </div>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { ref } from "vue";
import {
  SoneIcon,
  SoneTabsList,
  SoneTabsTrigger,
  SoneToggle,
  SoneToggleGroup,
  SoneToggleGroupItem,
} from "@surface-one/vue";

const view = ref("List");
const pinned = ref(true);
const locked = ref(false);
const tab = ref("Overview");
const dest = ref("Existing folder");
const kind = ref("Folder");
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <SoneToggleGroup variant="outline" role="group" aria-label="View">
        <SoneToggleGroupItem
          v-for="v in ['List', 'Board', 'Calendar']"
          :key="v"
          type="button"
          :pressed="view === v"
          @click="view = v"
          >{{ v }}</SoneToggleGroupItem
        >
      </SoneToggleGroup>
      <SoneToggle variant="outline" type="button" :pressed="pinned" @click="pinned = !pinned">
        <SoneIcon icon="star" inline="start" /> Pinned
      </SoneToggle>
      <SoneToggle type="button" aria-label="Lock editing" :pressed="locked" @click="locked = !locked">
        <SoneIcon icon="lock" />
      </SoneToggle>
    </div>
    <div style="display: grid; gap: var(--space-3)">
      <SoneTabsList role="tablist" aria-label="Project">
        <SoneTabsTrigger
          v-for="t in ['Overview', 'Activity', 'Settings']"
          :id="'demo-tab-' + t"
          :key="t"
          role="tab"
          type="button"
          :active="tab === t"
          @click="tab = t"
          >{{ t }}</SoneTabsTrigger
        >
      </SoneTabsList>
      <div role="tabpanel" :aria-labelledby="'demo-tab-' + tab" style="color: var(--text-secondary)">
        {{ tab }} content goes here.
      </div>
    </div>
    <div style="display: grid; gap: var(--space-3); max-width: 24rem">
      <SoneToggleGroup variant="dashed" size="sm" :spacing="2" role="group" aria-label="Destination">
        <SoneToggleGroupItem
          v-for="d in ['Existing folder', 'New folder']"
          :key="d"
          type="button"
          :pressed="dest === d"
          @click="dest = d"
          >{{ d }}</SoneToggleGroupItem
        >
      </SoneToggleGroup>
      <SoneTabsList stretch aria-label="Kind">
        <SoneTabsTrigger
          v-for="k in ['Folder', 'Workspace']"
          :key="k"
          type="button"
          :active="kind === k"
          @click="kind = k"
          >{{ k }}</SoneTabsTrigger
        >
      </SoneTabsList>
    </div>
  </div>
</template>
`;

@Component({
  selector: "docs-toggle-group-demo",
  imports: [...SONE_TOGGLE_PARTS, SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class ToggleGroupDemo {
  readonly view = signal("List");
  readonly pinned = signal(true);
  readonly locked = signal(false);
  readonly tab = signal("Overview");
  readonly dest = signal("Existing folder");
  readonly kind = signal("Folder");
}
