<script setup lang="ts">
import { ref } from "vue";
import {
  SoneItem,
  SoneItemContent,
  SoneItemDescription,
  SoneItemTitle,
  SoneMark,
  SoneSourceList,
  SoneSourceListTrigger,
} from "@surface-one/vue";

interface Source {
  id: string;
  title: string;
  date: string;
}

const sources: Source[] = [
  { id: "s1", title: "Harbour Lane kickoff", date: "Mar 3" },
  { id: "s2", title: "Pricing review", date: "Mar 5" },
  { id: "s3", title: "Team retro", date: "Mar 9" },
  { id: "s4", title: "Onboarding notes", date: "Mar 12" },
  { id: "s5", title: "Vendor call", date: "Mar 14" },
];

const byId = (source: Source): string => source.id;
const open = ref(false);
</script>

<template>
  <div class="demo-stack" style="max-width: 32rem">
    <SoneSourceList variant="chip" label="Sources" :items="sources" :track-by="byId" :limit="3">
      <template #item="{ item }: { item: Source }">
        <SoneItem as="span" variant="outline" size="xs">{{ item.title }} · {{ item.date }}</SoneItem>
      </template>
    </SoneSourceList>

    <SoneSourceList variant="row" size="sm" label="Sources" show-count :items="sources" :track-by="byId" :limit="3">
      <template #item="{ item }: { item: Source }">
        <SoneItem variant="muted" size="xs">
          <SoneItemContent>
            <SoneItemTitle as="span">{{ item.title }}</SoneItemTitle>
            <SoneItemDescription as="span">{{ item.date }}</SoneItemDescription>
          </SoneItemContent>
        </SoneItem>
      </template>
    </SoneSourceList>

    <div>
      <SoneSourceListTrigger
        :count="sources.length"
        :aria-expanded="open"
        :aria-controls="open ? 'answer-sources' : undefined"
        @click="open = !open"
      >
        <SoneMark icon="meetings" tone="lagoon" size="sm" />
        <SoneMark icon="notes" tone="iris" size="sm" />
        <SoneMark icon="tasks" tone="amber" size="sm" />
      </SoneSourceListTrigger>
    </div>
    <SoneSourceList
      v-if="open"
      id="answer-sources"
      variant="row"
      size="sm"
      aria-label="Sources"
      :items="sources"
      :track-by="byId"
    >
      <template #item="{ item }: { item: Source }">
        <SoneItem as="span" variant="muted" size="xs">{{ item.title }} · {{ item.date }}</SoneItem>
      </template>
    </SoneSourceList>
  </div>
</template>
