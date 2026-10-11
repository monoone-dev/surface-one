<script setup lang="ts">
import { ref } from "vue";
import {
  SoneField,
  SoneFieldDescription,
  SoneFieldError,
  SoneFieldGroup,
  SoneFieldLabel,
  SoneSelect,
} from "@surface-one/vue";

const language = ref("en");
</script>

<template>
  <SoneFieldGroup style="max-width: 20rem">
    <SoneField>
      <SoneFieldLabel for="demo-language">Language</SoneFieldLabel>
      <SoneSelect v-model="language" select-id="demo-language">
        <option value="auto">Detect automatically</option>
        <option value="en">English</option>
        <option value="de">Deutsch</option>
        <option value="fr">Français</option>
      </SoneSelect>
      <SoneFieldDescription>Selected: {{ language }}</SoneFieldDescription>
    </SoneField>
    <SoneField invalid>
      <SoneFieldLabel for="demo-workspace">Workspace</SoneFieldLabel>
      <SoneSelect select-id="demo-workspace" invalid model-value="">
        <option value="">Choose a workspace…</option>
        <option value="team">Team workspace</option>
      </SoneSelect>
      <SoneFieldError>Pick a workspace to continue.</SoneFieldError>
    </SoneField>
    <div class="demo-row">
      <SoneSelect size="sm" aria-label="Sort order" model-value="newest">
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </SoneSelect>
      <SoneSelect disabled aria-label="Region (locked)" model-value="eu">
        <option value="eu">Europe</option>
      </SoneSelect>
    </div>
  </SoneFieldGroup>
</template>
