<script setup lang="ts">
import { ref } from "vue";
import { SonePagination } from "@surface-one/vue";

const page = ref(5);
</script>

<template>
  <div class="demo-stack">
    <SonePagination v-model:page="page" :total="240" :page-size="20" />
    <p class="text-hint" style="text-align: center">Showing page {{ page }} of 12</p>
  </div>
</template>
