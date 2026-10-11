<script setup lang="ts">
import { ref } from "vue";
import { SoneSearchField } from "@surface-one/vue";

const query = ref("");
const submitted = ref("");
</script>

<template>
  <div class="demo-stack" style="max-width: 24rem">
    <SoneSearchField
      v-model="query"
      clearable
      placeholder="Search notes"
      aria-label="Search notes"
      @submit="submitted = $event"
    />
    <p role="status" style="margin: 0; color: var(--text-secondary)">
      Searched for: {{ submitted || "nothing yet" }}
    </p>

    <SoneSearchField size="sm" placeholder="Filter" aria-label="Filter sources" />
  </div>
</template>
