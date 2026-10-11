<script setup lang="ts">
import {
  SoneButton,
  SoneField,
  SoneFieldDescription,
  SoneFieldError,
  SoneFieldGroup,
  SoneFieldLabel,
  SoneFieldLegend,
  SoneFieldSet,
  SoneInputGroup,
  SoneInputGroupAddon,
  SoneInputGroupInput,
  SoneInputGroupText,
} from "@surface-one/vue";
</script>

<template>
  <SoneFieldGroup as="form" style="max-width: 26rem" @submit.prevent>
    <SoneField>
      <SoneFieldLabel for="demo-name">Display name</SoneFieldLabel>
      <input id="demo-name" type="text" placeholder="Alex Doe" />
      <SoneFieldDescription>Shown to people you share notes with.</SoneFieldDescription>
    </SoneField>
    <SoneField invalid>
      <SoneFieldLabel for="demo-site">Website</SoneFieldLabel>
      <SoneInputGroup>
        <SoneInputGroupAddon as="span"><SoneInputGroupText>https://</SoneInputGroupText></SoneInputGroupAddon>
        <SoneInputGroupInput id="demo-site" type="text" value="not a host" />
      </SoneInputGroup>
      <SoneFieldError>Enter a host name, such as example.com.</SoneFieldError>
    </SoneField>
    <SoneField>
      <SoneFieldLabel for="demo-quota">Storage limit</SoneFieldLabel>
      <SoneInputGroup>
        <SoneInputGroupInput id="demo-quota" type="number" value="20" />
        <SoneInputGroupAddon as="span" align="inline-end"><SoneInputGroupText>GB</SoneInputGroupText></SoneInputGroupAddon>
        <SoneInputGroupAddon as="span" align="inline-end">
          <SoneButton variant="ghost" size="xs" type="button">Reset</SoneButton>
        </SoneInputGroupAddon>
      </SoneInputGroup>
    </SoneField>
    <SoneFieldSet>
      <SoneFieldLegend variant="label">Notify me about</SoneFieldLegend>
      <SoneFieldGroup variant="choices">
        <SoneField orientation="horizontal">
          <input id="demo-mentions" type="checkbox" checked />
          <SoneFieldLabel for="demo-mentions">Mentions and replies</SoneFieldLabel>
        </SoneField>
        <SoneField orientation="horizontal">
          <input id="demo-digest" type="checkbox" />
          <SoneFieldLabel for="demo-digest">Weekly digest</SoneFieldLabel>
        </SoneField>
      </SoneFieldGroup>
    </SoneFieldSet>
    <SoneField>
      <SoneFieldLabel for="demo-bio">Bio</SoneFieldLabel>
      <textarea id="demo-bio" placeholder="A sentence or two about you."></textarea>
    </SoneField>
  </SoneFieldGroup>
</template>
