<script setup lang="ts">
import {
  SoneAvatar,
  SoneAvatarFallback,
  SoneHoverCard,
  SoneHoverCardContent,
  SoneHoverCardTrigger,
} from "@surface-one/vue";
</script>

<template>
  <div class="demo-row" style="align-items: flex-start; min-height: 11rem">
    <SoneHoverCard :open-delay="300">
      <SoneHoverCardTrigger
        href="#ada-park"
        style="font-weight: var(--font-weight-medium); text-decoration: underline; text-underline-offset: var(--space-1)"
      >@adapark</SoneHoverCardTrigger>
      <SoneHoverCardContent>
        <div style="display: flex; gap: var(--space-3)">
          <SoneAvatar><SoneAvatarFallback>AP</SoneAvatarFallback></SoneAvatar>
          <div style="display: flex; flex-direction: column; gap: var(--space-1)">
            <strong>Ada Park</strong>
            <span>Product design. Writes up every sync within the hour.</span>
            <span style="color: var(--text-secondary); font-size: var(--font-size-xs)">Joined March 2021</span>
          </div>
        </div>
      </SoneHoverCardContent>
    </SoneHoverCard>
  </div>
</template>
