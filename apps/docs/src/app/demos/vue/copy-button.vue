<script setup lang="ts">
import { SoneCopyButton } from "@surface-one/vue";
</script>

<template>
  <div class="demo-row" style="align-items: center">
    <SoneCopyButton value="npm install @surface-one/vue" />
    <SoneCopyButton value="mtg_01J9ZK3Q7R4M2" label="Copy meeting ID" icon-only variant="ghost" />
    <SoneCopyButton value='{ "mcpServers": {} }' label="Copy config" variant="secondary" />
  </div>
</template>
