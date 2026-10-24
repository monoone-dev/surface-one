<script setup lang="ts">
import { ref } from "vue";
import {
  SoneBadge,
  SoneMenuItem,
  SoneRowMenu,
  SoneTable,
  type SoneTableColumn,
} from "@surface-one/vue";

interface Note {
  id: string;
  title: string;
  folder: string;
  modified: string;
}

const notes = ref<Note[]>([
  { id: "n1", title: "Q4 planning — decisions and owners", folder: "Product", modified: "Sep 24" },
  { id: "n2", title: "Hiring loop debrief", folder: "People", modified: "Sep 22" },
  { id: "n3", title: "Research synthesis: onboarding interviews", folder: "Research", modified: "Sep 19" },
  { id: "n4", title: "Vendor call — licensing terms", folder: "Legal", modified: "Sep 12" },
]);
const selectedId = ref<string | null>("n1");

const columns: SoneTableColumn[] = [
  { key: "title", header: "Title" },
  { key: "folder", header: "Folder", width: "140px" },
  { key: "modified", header: "Last modified", width: "140px", alignEnd: true },
  { key: "actions", header: "Actions", width: "48px", hideHeader: true },
];
const byId = (note: Note) => note.id;
const isSelected = (note: Note) => note.id === selectedId.value;
const remove = (id: string) => {
  notes.value = notes.value.filter((row) => row.id !== id);
};
</script>

<template>
  <SoneTable
    :rows="notes"
    :columns="columns"
    :row-key="byId"
    :is-selected="isSelected"
    caption="Notes modified in the last 30 days."
    empty-text="No notes left. Every row went to the trash."
  >
    <template #cell-folder="{ row }">
      <SoneBadge variant="outline">{{ (row as Note).folder }}</SoneBadge>
    </template>
    <template #cell-actions="{ row }">
      <SoneRowMenu :label="'Actions for ' + (row as Note).title">
        <SoneMenuItem type="button" @click="selectedId = (row as Note).id">Select</SoneMenuItem>
        <SoneMenuItem variant="destructive" type="button" @click="remove((row as Note).id)">
          Move to trash
        </SoneMenuItem>
      </SoneRowMenu>
    </template>
  </SoneTable>
</template>
