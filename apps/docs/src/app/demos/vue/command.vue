<script setup lang="ts">
import { ref } from "vue";
import {
  SoneButton,
  SoneCommand,
  SoneCommandDialog,
  SoneCommandEmpty,
  SoneCommandGroup,
  SoneCommandInput,
  SoneCommandItem,
  SoneCommandList,
  SoneCommandSeparator,
  SoneKbd,
} from "@surface-one/vue";

const notes = ["Q4 planning", "Design review — Łódź office", "Weekly sync", "Café roadmap", "Hiring loop"];
const picked = ref<string | null>(null);
const paletteOpen = ref(false);

function pickFromPalette(note: string) {
  picked.value = note;
  paletteOpen.value = false;
}
</script>

<template>
  <div class="demo-stack" style="max-width: 26rem">
    <SoneCommand style="box-shadow: 0 0 0 var(--border-width-thin) var(--border)">
      <SoneCommandInput placeholder="Type a command or search…" aria-label="Search commands" />
      <SoneCommandList aria-label="Commands">
        <SoneCommandEmpty>No results found.</SoneCommandEmpty>
        <SoneCommandGroup heading="Notes">
          <SoneCommandItem v-for="note in notes" :key="note" @select="picked = $event">{{ note }}</SoneCommandItem>
        </SoneCommandGroup>
        <SoneCommandSeparator />
        <SoneCommandGroup heading="Actions">
          <SoneCommandItem value="New note" :keywords="['create', 'add']" @select="picked = $event">New note</SoneCommandItem>
          <SoneCommandItem value="Start recording" :keywords="['record', 'meeting']" @select="picked = $event">Start recording</SoneCommandItem>
          <SoneCommandItem value="Export" disabled>Export (locked)</SoneCommandItem>
        </SoneCommandGroup>
      </SoneCommandList>
    </SoneCommand>
    <p style="margin: 0; color: var(--text-secondary)">Selected: {{ picked ?? "nothing yet" }}</p>
    <div class="demo-row">
      <SoneButton variant="outline" type="button" @click="paletteOpen = true">
        Open the palette <SoneKbd>⌘K</SoneKbd>
      </SoneButton>
    </div>
  </div>

  <SoneCommandDialog v-if="paletteOpen" label="Command palette" @dismiss="paletteOpen = false">
    <SoneCommand>
      <SoneCommandInput data-autofocus placeholder="Search notes…" aria-label="Search notes" />
      <SoneCommandList aria-label="Notes">
        <SoneCommandEmpty>No notes match.</SoneCommandEmpty>
        <SoneCommandItem v-for="note in notes" :key="note" @select="pickFromPalette">{{ note }}</SoneCommandItem>
      </SoneCommandList>
    </SoneCommand>
  </SoneCommandDialog>
</template>
