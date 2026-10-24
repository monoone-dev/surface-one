<script setup lang="ts">
import { SoneButton, SoneIcon, SonePageFooter, type PageFooterColumn } from "@surface-one/vue";

const columns: PageFooterColumn[] = [
  {
    label: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    label: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Blog", href: "#blog" },
    ],
  },
  {
    label: "Legal",
    links: [
      { label: "Privacy", href: "#privacy" },
      { label: "Terms", href: "#terms" },
    ],
  },
];
</script>

<template>
  <SonePageFooter aria-label="Demo footer" copyright="© 2026 Acme Notes" :columns="columns">
    <template #brand>
      <strong style="color: var(--text-primary)">Acme Notes</strong>
      <span>Every meeting, written down.</span>
    </template>
    <template #right>
      <SoneButton as="a" variant="ghost" size="icon" href="#newsletter" aria-label="Newsletter">
        <SoneIcon icon="mail" />
      </SoneButton>
    </template>
  </SonePageFooter>
</template>
