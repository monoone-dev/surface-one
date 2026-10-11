<script setup lang="ts">
import { SoneBadge, SoneBarList, type BadgeVariant, type SoneBarListItem } from "@surface-one/vue";

type Status = SoneBarListItem & { variant: BadgeVariant };

const statuses: Status[] = [
  { key: "summarized", label: "Summarized", value: 42, variant: "accent" },
  { key: "exported", label: "Exported", value: 31, tone: "success", variant: "success" },
  { key: "draft", label: "Draft", value: 6, variant: "outline" },
  { key: "error", label: "Error", value: 2, tone: "danger", variant: "destructive" },
];
const models: SoneBarListItem[] = [
  { key: "sonnet", label: "claude-sonnet-4-5", value: 182_400, tone: "chart-1" },
  { key: "haiku", label: "claude-haiku-4-5", value: 64_200, tone: "chart-2" },
  { key: "llama", label: "llama3.1:8b (local Ollama)", value: 21_050, tone: "chart-3" },
];
const tokens = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
</script>

<template>
  <div class="demo-stack" style="max-width: 28rem; gap: var(--space-6)">
    <SoneBarList :items="statuses" aria-label="Meetings by status">
      <template #label="{ item }">
        <SoneBadge :variant="(item as Status).variant">{{ item.label }}</SoneBadge>
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
