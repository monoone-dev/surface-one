<script setup lang="ts">
import { ref } from "vue";
import {
  SoneButton,
  SoneField,
  SoneFieldLabel,
  SoneSheet,
  SoneSheetDescription,
  SoneSheetFooter,
  SoneSheetHeader,
  SoneSheetTitle,
  type SheetSide,
} from "@surface-one/vue";

const sides: SheetSide[] = ["right", "left", "bottom"];
const openSide = ref<SheetSide | null>(null);
</script>

<template>
  <div class="demo-row">
    <SoneButton v-for="side in sides" :key="side" variant="outline" type="button" @click="openSide = side">
      Open {{ side }}
    </SoneButton>
  </div>

  <SoneSheet v-if="openSide" :side="openSide" @dismiss="openSide = null">
    <SoneSheetHeader as="header">
      <SoneSheetTitle>Edit profile</SoneSheetTitle>
      <SoneSheetDescription>Changes are saved when you press Save.</SoneSheetDescription>
    </SoneSheetHeader>
    <div class="demo-stack">
      <SoneField>
        <SoneFieldLabel for="sheet-name">Name</SoneFieldLabel>
        <input id="sheet-name" type="text" value="Ada Park" autofocus />
      </SoneField>
      <SoneField>
        <SoneFieldLabel for="sheet-role">Role</SoneFieldLabel>
        <input id="sheet-role" type="text" value="Product designer" />
      </SoneField>
    </div>
    <SoneSheetFooter as="footer">
      <SoneButton variant="outline" type="button" @click="openSide = null">Cancel</SoneButton>
      <SoneButton type="button" @click="openSide = null">Save</SoneButton>
    </SoneSheetFooter>
  </SoneSheet>
</template>
