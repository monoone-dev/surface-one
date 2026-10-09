import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SONE_ITEM_PARTS } from "@surface-one/angular/item";

const TEMPLATE = `<div class="demo-stack" style="max-width: 30rem">
  <div soneItem variant="outline">
    <span soneItemMedia variant="icon"><sone-icon icon="meetings" /></span>
    <div soneItemContent>
      <p soneItemTitle>Weekly sync <span soneBadge variant="secondary">New</span></p>
      <p soneItemDescription>Sep 24 · 42 min · 3 action items</p>
    </div>
    <div soneItemActions>
      <button soneBtn variant="outline" size="sm" type="button">Open</button>
    </div>
  </div>

  <ul soneItemGroup>
    <li soneItem size="sm">
      <div soneItemContent>
        <p soneItemTitle>Hiring debrief</p>
        <p soneItemDescription>Ada Park · Sep 23</p>
      </div>
    </li>
    <li soneItemSeparator></li>
    <li soneItem size="sm">
      <div soneItemContent>
        <p soneItemTitle>Board prep</p>
        <p soneItemDescription>Leo Grant · Sep 20</p>
      </div>
    </li>
  </ul>

  <button soneItem variant="muted" size="sm" type="button">
    <span soneItemMedia variant="icon"><sone-icon icon="notes" /></span>
    <span soneItemContent>
      <span soneItemTitle>Design review notes</span>
      <span soneItemDescription>The whole item is a button.</span>
    </span>
  </button>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import {
  SoneBadge,
  SoneButton,
  SoneIcon,
  SoneItem,
  SoneItemActions,
  SoneItemContent,
  SoneItemDescription,
  SoneItemGroup,
  SoneItemMedia,
  SoneItemSeparator,
  SoneItemTitle,
} from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack" style="max-width: 30rem">
    <SoneItem variant="outline">
      <SoneItemMedia as="span" variant="icon"><SoneIcon icon="meetings" /></SoneItemMedia>
      <SoneItemContent>
        <SoneItemTitle>Weekly sync <SoneBadge variant="secondary">New</SoneBadge></SoneItemTitle>
        <SoneItemDescription>Sep 24 · 42 min · 3 action items</SoneItemDescription>
      </SoneItemContent>
      <SoneItemActions>
        <SoneButton variant="outline" size="sm" type="button">Open</SoneButton>
      </SoneItemActions>
    </SoneItem>

    <SoneItemGroup as="ul">
      <SoneItem as="li" size="sm">
        <SoneItemContent>
          <SoneItemTitle>Hiring debrief</SoneItemTitle>
          <SoneItemDescription>Ada Park · Sep 23</SoneItemDescription>
        </SoneItemContent>
      </SoneItem>
      <SoneItemSeparator as="li" />
      <SoneItem as="li" size="sm">
        <SoneItemContent>
          <SoneItemTitle>Board prep</SoneItemTitle>
          <SoneItemDescription>Leo Grant · Sep 20</SoneItemDescription>
        </SoneItemContent>
      </SoneItem>
    </SoneItemGroup>

    <SoneItem as="button" variant="muted" size="sm" type="button">
      <SoneItemMedia as="span" variant="icon"><SoneIcon icon="notes" /></SoneItemMedia>
      <SoneItemContent as="span">
        <SoneItemTitle as="span">Design review notes</SoneItemTitle>
        <SoneItemDescription as="span">The whole item is a button.</SoneItemDescription>
      </SoneItemContent>
    </SoneItem>
  </div>
</template>
`;

@Component({
  selector: "docs-item-demo",
  imports: [
    ...SONE_ITEM_PARTS,
    SoneButtonDirective,
    SoneBadgeDirective,
    SoneIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class ItemDemo {}
