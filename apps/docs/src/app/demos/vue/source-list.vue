<script setup lang="ts">
import {
  SoneItem,
  SoneItemContent,
  SoneItemDescription,
  SoneItemTitle,
  SoneSourceList,
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
  </div>
</template>
