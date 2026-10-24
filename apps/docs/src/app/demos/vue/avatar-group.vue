<script setup lang="ts">
import { SoneAvatar, SoneAvatarFallback, SoneAvatarGroup } from "@surface-one/vue";

const people = [
  { name: "Ada Lovelace" },
  { name: "Grace Hopper" },
  { name: "Alan Turing" },
  { name: "Katherine Johnson" },
  { name: "Margaret Hamilton" },
];
</script>

<template>
  <div class="demo-stack">
    <SoneAvatarGroup aria-label="Project members" :people="people" :max="3" />
    <SoneAvatarGroup aria-label="Reviewers" size="sm">
      <SoneAvatar role="img" aria-label="Ada Lovelace">
        <SoneAvatarFallback aria-hidden="true">AL</SoneAvatarFallback>
      </SoneAvatar>
      <SoneAvatar role="img" aria-label="Grace Hopper">
        <SoneAvatarFallback aria-hidden="true">GH</SoneAvatarFallback>
      </SoneAvatar>
    </SoneAvatarGroup>
  </div>
</template>
