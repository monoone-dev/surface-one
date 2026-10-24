<script setup lang="ts">
import { ref } from "vue";
import { SoneButton, SonePageSiteHeader } from "@surface-one/vue";

const menuOpen = ref(false);
</script>

<template>
  <SonePageSiteHeader v-model:open="menuOpen" title="Acme Notes" href="#">
    <template #nav>
      <nav aria-label="Demo site" class="cluster" data-gap="4">
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <a href="#blog">Blog</a>
      </nav>
    </template>
    <template #actions>
      <SoneButton as="a" size="sm" href="#start">Get started</SoneButton>
    </template>
    <template #menu>
      <nav aria-label="Demo site menu" class="stack">
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <a href="#blog">Blog</a>
      </nav>
    </template>
  </SonePageSiteHeader>
</template>
