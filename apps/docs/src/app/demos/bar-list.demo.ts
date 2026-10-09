import { ChangeDetectionStrategy, Component } from "@angular/core";
import {
  SoneBadgeDirective,
  type BadgeVariant,
} from "@surface-one/angular/badge";
import {
  SONE_BAR_LIST_PARTS,
  type SoneBarListItem,
} from "@surface-one/angular/bar-list";

interface StatusRow extends SoneBarListItem {
  readonly variant: BadgeVariant;
}

const TEMPLATE = `<div class="demo-stack" style="max-width: 28rem; gap: var(--space-6)">
  <sone-bar-list [items]="statuses" ariaLabel="Meetings by status">
    <ng-template soneBarListLabel [soneBarListLabelOf]="statuses" let-row>
      <span soneBadge [variant]="row.variant">{{ row.label }}</span>
    </ng-template>
  </sone-bar-list>

  <sone-bar-list [items]="models" scale="total" [valueFormat]="tokens" ariaLabel="Tokens by model" />
</div>`;

export const code = TEMPLATE;

export const vueCode = `<script setup lang="ts">
import { SoneBadge, SoneBarList } from "@surface-one/vue";

const statuses = [
  { key: "summarized", label: "Summarized", value: 42, variant: "accent" },
  { key: "exported", label: "Exported", value: 31, tone: "success", variant: "success" },
  { key: "draft", label: "Draft", value: 6, variant: "outline" },
  { key: "error", label: "Error", value: 2, tone: "danger", variant: "destructive" },
];
const models = [
  { key: "sonnet", label: "claude-sonnet-4-5", value: 182_400, tone: "chart-1" },
  { key: "haiku", label: "claude-haiku-4-5", value: 64_200, tone: "chart-2" },
  { key: "llama", label: "llama3.1:8b (local Ollama)", value: 21_050, tone: "chart-3" },
];
const tokens = (n: number) => (n >= 1000 ? \`\${(n / 1000).toFixed(1)}k\` : String(n));
</script>

<template>
  <div class="demo-stack" style="max-width: 28rem; gap: var(--space-6)">
    <SoneBarList :items="statuses" aria-label="Meetings by status">
      <template #label="{ item }">
        <SoneBadge :variant="item.variant">{{ item.label }}</SoneBadge>
      </template>
    </SoneBarList>

    <SoneBarList
      :items="models"
      scale="total"
      :value-format="tokens"
      aria-label="Tokens by model"
    />
  </div>
</template>
`;

@Component({
  selector: "docs-bar-list-demo",
  imports: [SONE_BAR_LIST_PARTS, SoneBadgeDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class BarListDemo {
  readonly statuses: StatusRow[] = [
    { key: "summarized", label: "Summarized", value: 42, variant: "accent" },
    {
      key: "exported",
      label: "Exported",
      value: 31,
      tone: "success",
      variant: "success",
    },
    { key: "draft", label: "Draft", value: 6, variant: "outline" },
    {
      key: "error",
      label: "Error",
      value: 2,
      tone: "danger",
      variant: "destructive",
    },
  ];

  readonly models: SoneBarListItem[] = [
    {
      key: "sonnet",
      label: "claude-sonnet-4-5",
      value: 182_400,
      tone: "chart-1",
    },
    { key: "haiku", label: "claude-haiku-4-5", value: 64_200, tone: "chart-2" },
    {
      key: "llama",
      label: "llama3.1:8b (local Ollama)",
      title: "llama3.1:8b (local Ollama)",
      value: 21_050,
      tone: "chart-3",
    },
  ];

  readonly tokens = (n: number): string =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}
