<script setup lang="ts">
import {
  SoneBreadcrumb,
  SoneBreadcrumbEllipsis,
  SoneBreadcrumbItem,
  SoneBreadcrumbLink,
  SoneBreadcrumbList,
  SoneBreadcrumbPage,
  SoneBreadcrumbSeparator,
} from "@surface-one/vue";
</script>

<template>
  <SoneBreadcrumb aria-label="Settings path">
    <SoneBreadcrumbList>
      <SoneBreadcrumbItem><SoneBreadcrumbLink href="#">Home</SoneBreadcrumbLink></SoneBreadcrumbItem>
      <SoneBreadcrumbSeparator />
      <SoneBreadcrumbItem><SoneBreadcrumbEllipsis /></SoneBreadcrumbItem>
      <SoneBreadcrumbSeparator />
      <SoneBreadcrumbItem><SoneBreadcrumbLink href="#">Settings</SoneBreadcrumbLink></SoneBreadcrumbItem>
      <SoneBreadcrumbSeparator />
      <SoneBreadcrumbItem><SoneBreadcrumbPage>Billing</SoneBreadcrumbPage></SoneBreadcrumbItem>
    </SoneBreadcrumbList>
  </SoneBreadcrumb>
</template>
