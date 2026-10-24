<script setup lang="ts">
import { SonePageHero, type PageLink } from "@surface-one/vue";

const links: PageLink[] = [
  { label: "Start for free", href: "#start", trailingIcon: "arrow-right" },
  { label: "See pricing", href: "#pricing" },
];
</script>

<template>
  <SonePageHero
    headline="New: offline notes"
    title="Every meeting, written down"
    description="Record, transcribe and share the notes of every meeting — searchable, private and in your language."
    orientation="horizontal"
    :level="3"
    :links="links"
  >
    <div
      role="img"
      aria-label="A meeting summary on a laptop"
      style="aspect-ratio: 4 / 3; border: var(--border-width-thin) solid var(--border); border-radius: var(--radius-xl); background: var(--surface-hover)"
    ></div>
  </SonePageHero>
</template>
