<script setup lang="ts">
import {
  SoneAvatar,
  SoneAvatarFallback,
  SoneBubble,
  SoneBubbleContent,
  SoneMessage,
  SoneMessageAvatar,
  SoneMessageContent,
  SoneMessageFooter,
  SoneMessageGroup,
  SoneMessageHeader,
} from "@surface-one/vue";
</script>

<template>
  <SoneMessageGroup style="max-width: 520px; width: 100%">
    <SoneMessage>
      <SoneMessageAvatar :as="SoneAvatar" size="sm"><SoneAvatarFallback>AP</SoneAvatarFallback></SoneMessageAvatar>
      <SoneMessageContent>
        <SoneMessageHeader>Ada Park · 10:04</SoneMessageHeader>
        <SoneBubble variant="muted">
          <SoneBubbleContent>Can we move the beta invite to next sprint?</SoneBubbleContent>
        </SoneBubble>
      </SoneMessageContent>
    </SoneMessage>
    <SoneMessage align="end">
      <SoneMessageAvatar :as="SoneAvatar" size="sm"><SoneAvatarFallback>LR</SoneAvatarFallback></SoneMessageAvatar>
      <SoneMessageContent>
        <SoneBubble align="end">
          <SoneBubbleContent>Yes, if the invite copy lands by Friday.</SoneBubbleContent>
        </SoneBubble>
        <SoneMessageFooter>Read</SoneMessageFooter>
      </SoneMessageContent>
    </SoneMessage>
  </SoneMessageGroup>
</template>
