<script setup lang="ts">
import { ref } from "vue";
import {
  SoneAlertDialog,
  SoneButton,
  SoneDialog,
  SoneDialogDescription,
  SoneDialogFooter,
  SoneDialogHeader,
  SoneDialogTitle,
  SoneField,
  SoneFieldLabel,
} from "@surface-one/vue";

const renameOpen = ref(false);
const deleteOpen = ref(false);
</script>

<template>
  <div class="demo-row">
    <SoneButton variant="outline" type="button" @click="renameOpen = true">Rename note…</SoneButton>
    <SoneButton variant="destructive" type="button" @click="deleteOpen = true">Delete note…</SoneButton>
  </div>

  <SoneDialog v-if="renameOpen" @dismiss="renameOpen = false">
    <SoneDialogHeader as="header">
      <SoneDialogTitle>Rename note</SoneDialogTitle>
      <SoneDialogDescription>The new name shows everywhere this note appears.</SoneDialogDescription>
    </SoneDialogHeader>
    <SoneField>
      <SoneFieldLabel for="rename-note">Name</SoneFieldLabel>
      <input id="rename-note" type="text" value="Q4 planning" data-autofocus="select" />
    </SoneField>
    <SoneDialogFooter as="footer">
      <SoneButton variant="outline" type="button" @click="renameOpen = false">Cancel</SoneButton>
      <SoneButton type="button" @click="renameOpen = false">Save</SoneButton>
    </SoneDialogFooter>
  </SoneDialog>

  <SoneAlertDialog v-if="deleteOpen" @dismiss="deleteOpen = false">
    <SoneDialogHeader as="header">
      <SoneDialogTitle>Delete “Q4 planning”?</SoneDialogTitle>
      <SoneDialogDescription>The note moves to Trash. You can restore it for 30 days.</SoneDialogDescription>
    </SoneDialogHeader>
    <SoneDialogFooter as="footer">
      <SoneButton variant="outline" type="button" data-autofocus @click="deleteOpen = false">Cancel</SoneButton>
      <SoneButton variant="destructive" type="button" @click="deleteOpen = false">Delete</SoneButton>
    </SoneDialogFooter>
  </SoneAlertDialog>
</template>
