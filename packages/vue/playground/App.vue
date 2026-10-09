<script setup lang="ts">
import { ref, watchEffect } from "vue";

import {
  SoneAlert,
  SoneAlertDescription,
  SoneAlertDialog,
  SoneAlertTitle,
  SoneAvatar,
  SoneAvatarFallback,
  SoneBadge,
  SoneBanner,
  SoneButton,
  SoneButtonGroup,
  SoneCard,
  SoneCardContent,
  SoneCardDescription,
  SoneCardFooter,
  SoneCardHeader,
  SoneCardTitle,
  SoneChoiceCard,
  SoneChoiceCardDescription,
  SoneChoiceCardIndicator,
  SoneChoiceCardTitle,
  SoneChoiceGroup,
  SoneDialog,
  SoneDialogDescription,
  SoneDialogFooter,
  SoneDialogHeader,
  SoneDialogTitle,
  SoneDisclosure,
  SoneEmpty,
  SoneEmptyDescription,
  SoneEmptyHeader,
  SoneEmptyMedia,
  SoneEmptyTitle,
  SoneField,
  SoneFieldDescription,
  SoneFieldError,
  SoneFieldLabel,
  SoneIcon,
  SoneInputGroup,
  SoneInputGroupAddon,
  SoneInputGroupInput,
  SoneItem,
  SoneItemContent,
  SoneItemDescription,
  SoneItemMedia,
  SoneItemTitle,
  SoneKbd,
  SoneKbdGroup,
  SoneLogo,
  SoneMeter,
  SonePageHeader,
  SonePageHeaderActions,
  SonePageHeaderContent,
  SonePageHeaderDescription,
  SonePageHeaderEyebrow,
  SonePageHeaderTitle,
  SoneProgress,
  SoneSegmented,
  SoneSelect,
  SoneSeparator,
  SoneSheet,
  SoneSheetDescription,
  SoneSheetHeader,
  SoneSheetTitle,
  SoneSkeleton,
  SoneSlider,
  SoneSpinner,
  SoneSwitch,
  SoneTable,
  SoneTabsList,
  SoneTabsTrigger,
  vSoneTooltip,
} from "@surface-one/vue";

const skin = ref("studio");
const theme = ref("light");
watchEffect(() => {
  document.documentElement.dataset["skin"] = skin.value;
  document.documentElement.dataset["theme"] = theme.value;
});

const dialogOpen = ref(false);
const confirmOpen = ref(false);
const sheetOpen = ref(false);
const email = ref("");
const emailInvalid = ref(false);
const notify = ref(true);
const plan = ref("team");
const volume = ref(40);
const billing = ref("yearly");
const tab = ref("overview");
const country = ref("pl");

const rows = [
  { id: 1, name: "Studio", seats: 12, status: "Active" },
  { id: 2, name: "Paper", seats: 4, status: "Trial" },
  { id: 3, name: "Minimalist", seats: 30, status: "Active" },
];
</script>

<template>
  <main class="pg">
    <div class="pg-bar">
      <div class="pg-row">
        <SoneLogo label="SurfaceOne" size="sm" />
        <strong>SurfaceOne · Vue</strong>
        <SoneBadge variant="accent">0.3.0</SoneBadge>
      </div>
      <div class="pg-row">
        <SoneSegmented
          v-model="skin"
          aria-label="Skin"
          size="sm"
          :options="[
            { value: 'studio', label: 'Studio' },
            { value: 'paper', label: 'Paper' },
            { value: 'minimalist', label: 'Minimalist' },
            { value: 'neumorphism', label: 'Neumorphism' },
          ]"
        />
        <SoneSegmented
          v-model="theme"
          aria-label="Theme"
          size="sm"
          :options="[
            { value: 'light', label: 'Light', icon: 'sun', iconOnly: true },
            { value: 'dark', label: 'Dark', icon: 'moon', iconOnly: true },
          ]"
        />
      </div>
    </div>

    <SonePageHeader>
      <SonePageHeaderContent>
        <SonePageHeaderEyebrow>Design system</SonePageHeaderEyebrow>
        <SonePageHeaderTitle
          >Build landing pages with SurfaceOne</SonePageHeaderTitle
        >
        <SonePageHeaderDescription>
          The same tokens, skins and component styles as the Angular package —
          now as Vue 3 and Nuxt components.
        </SonePageHeaderDescription>
      </SonePageHeaderContent>
      <SonePageHeaderActions>
        <SoneButton variant="outline" as="a" href="#pricing"
          >Pricing</SoneButton
        >
        <SoneButton @click="dialogOpen = true">
          <SoneIcon icon="sparkles" inline="start" />Get started
        </SoneButton>
      </SonePageHeaderActions>
    </SonePageHeader>

    <SoneBanner kind="success"
      >Everything below renders from <code>@surface-one/vue</code>.</SoneBanner
    >

    <section class="pg-section">
      <h2>Buttons &amp; badges</h2>
      <div class="pg-row">
        <SoneButton>Default</SoneButton>
        <SoneButton variant="secondary">Secondary</SoneButton>
        <SoneButton variant="outline">Outline</SoneButton>
        <SoneButton variant="ghost">Ghost</SoneButton>
        <SoneButton variant="destructive">Destructive</SoneButton>
        <SoneButton variant="link">Link</SoneButton>
        <SoneButton
          size="icon"
          aria-label="Settings"
          v-sone-tooltip="'Settings'"
        >
          <SoneIcon icon="settings" />
        </SoneButton>
        <SoneButton as="a" href="#" aria-disabled="true"
          >Disabled link</SoneButton
        >
        <SoneButtonGroup>
          <SoneButton variant="outline">Day</SoneButton>
          <SoneButton variant="outline">Week</SoneButton>
          <SoneButton variant="outline">Month</SoneButton>
        </SoneButtonGroup>
      </div>
      <div class="pg-row">
        <SoneBadge>Default</SoneBadge>
        <SoneBadge variant="secondary">Secondary</SoneBadge>
        <SoneBadge variant="outline">Outline</SoneBadge>
        <SoneBadge variant="success">Success</SoneBadge>
        <SoneBadge variant="warning">Warning</SoneBadge>
        <SoneBadge variant="destructive">Destructive</SoneBadge>
        <SoneBadge variant="live">Live</SoneBadge>
        <SoneKbdGroup><SoneKbd>⌘</SoneKbd><SoneKbd>K</SoneKbd></SoneKbdGroup>
        <SoneSpinner />
      </div>
    </section>

    <section id="pricing" class="pg-section">
      <h2>Cards</h2>
      <SoneTabsList role="tablist" aria-label="Billing">
        <SoneTabsTrigger
          v-for="t in ['overview', 'usage', 'billing']"
          :key="t"
          role="tab"
          :active="tab === t"
          @click="tab = t"
          >{{ t }}</SoneTabsTrigger
        >
      </SoneTabsList>
      <div class="pg-grid">
        <SoneCard v-for="tier in ['Starter', 'Team', 'Enterprise']" :key="tier">
          <SoneCardHeader>
            <SoneCardTitle>{{ tier }}</SoneCardTitle>
            <SoneCardDescription
              >For teams that ship every week.</SoneCardDescription
            >
          </SoneCardHeader>
          <SoneCardContent>
            <SoneMeter
              label="Fit"
              :value="tier === 'Team' ? 4 : 2"
              detail="for 10 seats"
            />
          </SoneCardContent>
          <SoneCardFooter>
            <SoneButton :variant="tier === 'Team' ? 'default' : 'outline'"
              >Choose {{ tier }}</SoneButton
            >
          </SoneCardFooter>
        </SoneCard>
      </div>
    </section>

    <section class="pg-section">
      <h2>Form</h2>
      <div class="pg-grid">
        <div class="pg-stack">
          <SoneField :invalid="emailInvalid">
            <SoneFieldLabel for="email">Work email</SoneFieldLabel>
            <SoneInputGroup :invalid="emailInvalid">
              <SoneInputGroupAddon
                ><SoneIcon icon="link"
              /></SoneInputGroupAddon>
              <SoneInputGroupInput
                id="email"
                v-model="email"
                type="email"
                placeholder="you@company.com"
              />
            </SoneInputGroup>
            <SoneFieldDescription>We never share it.</SoneFieldDescription>
            <SoneFieldError v-if="emailInvalid"
              >Enter a valid email.</SoneFieldError
            >
          </SoneField>
          <SoneButton
            variant="outline"
            @click="emailInvalid = !email.includes('@')"
            >Validate</SoneButton
          >
          <SoneField orientation="horizontal">
            <SoneSwitch v-model="notify" input-id="notify" />
            <SoneFieldLabel for="notify"
              >Product updates ({{ notify ? "on" : "off" }})</SoneFieldLabel
            >
          </SoneField>
          <SoneField>
            <SoneFieldLabel for="country">Country</SoneFieldLabel>
            <SoneSelect v-model="country" select-id="country">
              <option value="pl">Poland</option>
              <option value="de">Germany</option>
              <option value="es">Spain</option>
            </SoneSelect>
          </SoneField>
          <SoneSlider v-model="volume" aria-label="Volume" />
          <SoneProgress :value="volume" aria-label="Volume level" />
          <SoneProgress aria-label="Loading" />
        </div>
        <SoneChoiceGroup aria-label="Plan" class="pg-stack">
          <SoneChoiceCard
            v-for="p in ['starter', 'team', 'enterprise']"
            :key="p"
            :selected="plan === p"
            @click="plan = p"
          >
            <SoneChoiceCardTitle>{{ p }}</SoneChoiceCardTitle>
            <SoneChoiceCardDescription
              >Billed {{ billing }}.</SoneChoiceCardDescription
            >
            <SoneChoiceCardIndicator />
          </SoneChoiceCard>
        </SoneChoiceGroup>
      </div>
    </section>

    <section class="pg-section">
      <h2>Feedback</h2>
      <SoneAlert>
        <SoneIcon icon="alert-circle" />
        <SoneAlertTitle>Heads up</SoneAlertTitle>
        <SoneAlertDescription
          >The alert parts are the same as in Angular.</SoneAlertDescription
        >
      </SoneAlert>
      <SoneBanner kind="warning">Your trial ends in 3 days.</SoneBanner>
      <div class="pg-row">
        <SoneAvatar><SoneAvatarFallback>LU</SoneAvatarFallback></SoneAvatar>
        <SoneAvatar size="lg" />
        <SoneSkeleton style="width: 160px; height: 16px" />
      </div>
      <SoneItem variant="outline">
        <SoneItemMedia variant="icon"
          ><SoneIcon icon="star" size="sm"
        /></SoneItemMedia>
        <SoneItemContent>
          <SoneItemTitle>Starred project</SoneItemTitle>
          <SoneItemDescription>Updated 2 hours ago</SoneItemDescription>
        </SoneItemContent>
      </SoneItem>
      <SoneEmpty>
        <SoneEmptyHeader>
          <SoneEmptyMedia variant="icon"
            ><SoneIcon icon="folder"
          /></SoneEmptyMedia>
          <SoneEmptyTitle>No projects yet</SoneEmptyTitle>
          <SoneEmptyDescription
            >Create one to get started.</SoneEmptyDescription
          >
        </SoneEmptyHeader>
      </SoneEmpty>
    </section>

    <section class="pg-section">
      <h2>Table &amp; FAQ</h2>
      <SoneTable
        :rows="rows"
        :row-key="(r: { id: number }) => r.id"
        :columns="[
          { key: 'name', header: 'Workspace' },
          { key: 'seats', header: 'Seats', alignEnd: true },
          { key: 'status', header: 'Status' },
        ]"
        caption="Workspaces"
      >
        <template #cell-status="{ row }">
          <SoneBadge
            :variant="
              (row as { status: string }).status === 'Active'
                ? 'success'
                : 'secondary'
            "
          >
            {{ (row as { status: string }).status }}
          </SoneBadge>
        </template>
      </SoneTable>
      <SoneSeparator />
      <div>
        <SoneDisclosure>
          <template #summary>Can I use it with Nuxt?</template>
          Yes — add <code>@surface-one/vue/nuxt</code> to <code>modules</code>.
        </SoneDisclosure>
        <SoneDisclosure>
          <template #summary>Does it support dark mode?</template>
          Every skin has light and dark values.
        </SoneDisclosure>
      </div>
    </section>

    <section class="pg-section">
      <h2>Overlays</h2>
      <div class="pg-row">
        <SoneButton variant="outline" @click="dialogOpen = true"
          >Open dialog</SoneButton
        >
        <SoneButton variant="outline" @click="confirmOpen = true"
          >Open alert dialog</SoneButton
        >
        <SoneButton variant="outline" @click="sheetOpen = true"
          >Open sheet</SoneButton
        >
      </div>
    </section>

    <SoneDialog v-model:open="dialogOpen" size="md">
      <SoneDialogHeader>
        <SoneDialogTitle>Start your trial</SoneDialogTitle>
        <SoneDialogDescription>14 days, no card needed.</SoneDialogDescription>
      </SoneDialogHeader>
      <SoneField>
        <SoneFieldLabel for="dlg-email">Email</SoneFieldLabel>
        <input id="dlg-email" type="email" autofocus />
      </SoneField>
      <SoneDialogFooter>
        <SoneButton variant="outline" @click="dialogOpen = false"
          >Cancel</SoneButton
        >
        <SoneButton @click="dialogOpen = false">Start</SoneButton>
      </SoneDialogFooter>
    </SoneDialog>

    <SoneAlertDialog v-if="confirmOpen" @dismiss="confirmOpen = false">
      <SoneDialogHeader>
        <SoneDialogTitle>Delete workspace?</SoneDialogTitle>
        <SoneDialogDescription>This cannot be undone.</SoneDialogDescription>
      </SoneDialogHeader>
      <SoneDialogFooter>
        <SoneButton variant="outline" @click="confirmOpen = false"
          >Cancel</SoneButton
        >
        <SoneButton variant="destructive" @click="confirmOpen = false"
          >Delete</SoneButton
        >
      </SoneDialogFooter>
    </SoneAlertDialog>

    <SoneSheet v-model:open="sheetOpen">
      <SoneSheetHeader>
        <SoneSheetTitle>Menu</SoneSheetTitle>
        <SoneSheetDescription>Navigate the site.</SoneSheetDescription>
      </SoneSheetHeader>
    </SoneSheet>
  </main>
</template>
