<script setup lang="ts">
import { computed, ref } from "vue";
import {
  SoneBadge,
  SoneButton,
  SoneChoiceCard,
  SoneChoiceCardDescription,
  SoneChoiceCardIndicator,
  SoneChoiceCardTitle,
  SoneChoiceGroup,
  SoneField,
  SoneFieldContent,
  SoneFieldDescription,
  SoneFieldGroup,
  SoneFieldLabel,
  SoneInputGroup,
  SoneInputGroupAddon,
  SoneInputGroupInput,
  SonePageHeader,
  SonePageHeaderActions,
  SonePageHeaderContent,
  SonePageHeaderDescription,
  SonePageHeaderEyebrow,
  SonePageHeaderTitle,
  SoneSegmented,
  SoneSelect,
  SoneSwitch,
  type SegmentOption,
} from "@surface-one/vue";

interface Preferences {
  displayName: string;
  language: string;
  timezone: string;
  digest: boolean;
  mentions: boolean;
  reminders: boolean;
  theme: string;
  density: string;
  quality: string;
}

interface Choice {
  readonly id: string;
  readonly title: string;
  readonly copy: string;
}

const DEFAULTS: Preferences = {
  displayName: "Ada Park",
  language: "en",
  timezone: "utc+1",
  digest: true,
  mentions: true,
  reminders: false,
  theme: "system",
  density: "comfortable",
  quality: "balanced",
};

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "de", label: "Deutsch" },
  { value: "pl", label: "Polski" },
] as const;
const timezones = [
  { value: "utc-5", label: "UTC−05:00 · Eastern Time" },
  { value: "utc", label: "UTC±00:00 · Coordinated Universal Time" },
  { value: "utc+1", label: "UTC+01:00 · Central European Time" },
  { value: "utc+9", label: "UTC+09:00 · Japan Standard Time" },
] as const;
const themes: readonly SegmentOption[] = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "system", label: "System", icon: "display" },
];
const densities: readonly Choice[] = [
  {
    id: "comfortable",
    title: "Comfortable",
    copy: "Roomy rows, easier to scan.",
  },
  { id: "compact", title: "Compact", copy: "Fits more on screen." },
];
const qualities: readonly Choice[] = [
  { id: "fast", title: "Fast", copy: "Ready in seconds." },
  {
    id: "balanced",
    title: "Balanced",
    copy: "Recommended for most meetings.",
  },
  { id: "accurate", title: "Accurate", copy: "Best for names and jargon." },
];

const saved = ref<Preferences>({ ...DEFAULTS });
const prefs = ref<Preferences>({ ...DEFAULTS });
const hasKey = ref<boolean | null>(false);
const savedOnce = ref(false);

const dirty = computed(() => {
  const a = prefs.value;
  const b = saved.value;
  return (Object.keys(a) as (keyof Preferences)[]).some((k) => a[k] !== b[k]);
});
const statusText = computed(() =>
  dirty.value
    ? "You have unsaved changes."
    : savedOnce.value
      ? "All changes saved."
      : "",
);

function save(): void {
  saved.value = { ...prefs.value };
  savedOnce.value = true;
}

function cancel(): void {
  prefs.value = { ...saved.value };
}

// The calendar sync key field (see the template).
const keyDraft = ref("");
function saveKey(): void {
  if (!keyDraft.value.trim()) return;
  // A real app hands the key to secure storage here, never logs it.
  hasKey.value = true;
  keyDraft.value = "";
}
</script>

<template>
  <div class="settings">
    <SonePageHeader as="div">
      <SonePageHeaderContent>
        <SonePageHeaderEyebrow>Account</SonePageHeaderEyebrow>
        <SonePageHeaderTitle as="h2">Settings</SonePageHeaderTitle>
        <SonePageHeaderDescription>
          Manage your profile, notifications and how the workspace looks.
        </SonePageHeaderDescription>
      </SonePageHeaderContent>
      <SonePageHeaderActions>
        <SoneBadge v-if="dirty" variant="warning">Unsaved changes</SoneBadge>
      </SonePageHeaderActions>
    </SonePageHeader>

    <div class="sections">
      <!-- Profile -->
      <div class="section" role="group" aria-labelledby="set-profile">
        <div class="section-intro">
          <h3 id="set-profile">Profile</h3>
          <p>How teammates see you across notes and meetings.</p>
        </div>
        <SoneFieldGroup class="section-body">
          <SoneField>
            <SoneFieldLabel for="set-name">Display name</SoneFieldLabel>
            <input
              id="set-name"
              v-model="prefs.displayName"
              type="text"
              autocomplete="off"
            />
            <SoneFieldDescription>
              Shown on shared notes and meeting invites.
            </SoneFieldDescription>
          </SoneField>
          <SoneField>
            <SoneFieldLabel for="set-language">Language</SoneFieldLabel>
            <SoneSelect v-model="prefs.language" select-id="set-language">
              <option v-for="l in languages" :key="l.value" :value="l.value">
                {{ l.label }}
              </option>
            </SoneSelect>
            <SoneFieldDescription>
              Used for the interface and for new transcripts.
            </SoneFieldDescription>
          </SoneField>
          <SoneField>
            <SoneFieldLabel for="set-tz">Time zone</SoneFieldLabel>
            <SoneSelect v-model="prefs.timezone" select-id="set-tz">
              <option v-for="z in timezones" :key="z.value" :value="z.value">
                {{ z.label }}
              </option>
            </SoneSelect>
          </SoneField>
        </SoneFieldGroup>
      </div>

      <!-- Notifications -->
      <div class="section" role="group" aria-labelledby="set-notify">
        <div class="section-intro">
          <h3 id="set-notify">Notifications</h3>
          <p>Choose what reaches you outside the app.</p>
        </div>
        <SoneFieldGroup class="section-body" variant="choices">
          <SoneField orientation="horizontal">
            <SoneFieldContent>
              <SoneFieldLabel for="set-digest">Weekly digest</SoneFieldLabel>
              <SoneFieldDescription>
                A Monday summary of decisions and open tasks.
              </SoneFieldDescription>
            </SoneFieldContent>
            <SoneSwitch v-model="prefs.digest" input-id="set-digest" />
          </SoneField>
          <SoneField orientation="horizontal">
            <SoneFieldContent>
              <SoneFieldLabel for="set-mentions">Mentions</SoneFieldLabel>
              <SoneFieldDescription>
                When someone mentions you in a note or comment.
              </SoneFieldDescription>
            </SoneFieldContent>
            <SoneSwitch v-model="prefs.mentions" input-id="set-mentions" />
          </SoneField>
          <SoneField orientation="horizontal">
            <SoneFieldContent>
              <SoneFieldLabel for="set-reminders"
                >Reminder alerts</SoneFieldLabel
              >
              <SoneFieldDescription>
                Ping me 15 minutes before a follow-up is due.
              </SoneFieldDescription>
            </SoneFieldContent>
            <SoneSwitch v-model="prefs.reminders" input-id="set-reminders" />
          </SoneField>
        </SoneFieldGroup>
      </div>

      <!-- Appearance -->
      <div class="section" role="group" aria-labelledby="set-appearance">
        <div class="section-intro">
          <h3 id="set-appearance">Appearance</h3>
          <p>Applies to this device only.</p>
        </div>
        <SoneFieldGroup class="section-body">
          <SoneField aria-labelledby="set-theme-label">
            <SoneFieldLabel as="span" id="set-theme-label"
              >Theme</SoneFieldLabel
            >
            <SoneSegmented
              v-model="prefs.theme"
              aria-label="Theme"
              :options="themes"
            />
          </SoneField>
          <SoneField aria-labelledby="set-density-label">
            <SoneFieldLabel as="span" id="set-density-label"
              >Density</SoneFieldLabel
            >
            <SoneChoiceGroup
              class="choices"
              aria-labelledby="set-density-label"
            >
              <SoneChoiceCard
                v-for="d in densities"
                :key="d.id"
                type="button"
                :selected="prefs.density === d.id"
                @click="prefs.density = d.id"
              >
                <SoneChoiceCardTitle>{{ d.title }}</SoneChoiceCardTitle>
                <SoneChoiceCardDescription>{{
                  d.copy
                }}</SoneChoiceCardDescription>
                <SoneChoiceCardIndicator />
              </SoneChoiceCard>
            </SoneChoiceGroup>
          </SoneField>
        </SoneFieldGroup>
      </div>

      <!-- Transcription -->
      <div class="section" role="group" aria-labelledby="set-transcription">
        <div class="section-intro">
          <h3 id="set-transcription">Transcription</h3>
          <p>Trade speed for accuracy on new recordings.</p>
        </div>
        <SoneFieldGroup class="section-body">
          <SoneField aria-labelledby="set-quality-label">
            <SoneFieldLabel as="span" id="set-quality-label"
              >Quality</SoneFieldLabel
            >
            <SoneChoiceGroup
              class="choices choices-3"
              aria-labelledby="set-quality-label"
            >
              <SoneChoiceCard
                v-for="q in qualities"
                :key="q.id"
                type="button"
                :selected="prefs.quality === q.id"
                @click="prefs.quality = q.id"
              >
                <SoneChoiceCardTitle>{{ q.title }}</SoneChoiceCardTitle>
                <SoneChoiceCardDescription>{{
                  q.copy
                }}</SoneChoiceCardDescription>
                <SoneChoiceCardIndicator />
              </SoneChoiceCard>
            </SoneChoiceGroup>
          </SoneField>
          <div class="secret">
            <SoneFieldLabel for="set-sync-key"
              >Calendar sync key</SoneFieldLabel
            >
            <!-- No Vue secret field yet: the same markup and classes as <sone-secret-field>. -->
            <div
              data-slot="secret-field"
              :data-state="
                hasKey === null ? 'unknown' : hasKey ? 'set' : 'unset'
              "
            >
              <SoneField>
                <div
                  v-if="hasKey !== null"
                  class="secret-status"
                  data-slot="secret-field-status"
                >
                  <span class="text-secondary">Status</span>
                  <SoneBadge v-if="hasKey" variant="success">
                    <span class="badge-dot"></span>
                    Key set ✓
                  </SoneBadge>
                  <SoneBadge v-else variant="outline">
                    <span class="badge-dot"></span>
                    Not set
                  </SoneBadge>
                </div>
                <SoneInputGroup>
                  <SoneInputGroupInput
                    id="set-sync-key"
                    v-model="keyDraft"
                    type="password"
                    placeholder="Paste a key"
                    aria-label="Calendar sync key"
                    autocomplete="off"
                    spellcheck="false"
                  />
                  <SoneInputGroupAddon align="inline-end">
                    <SoneButton
                      variant="ghost"
                      size="xs"
                      type="button"
                      :disabled="!keyDraft.trim()"
                      @click="saveKey"
                    >
                      Save key
                    </SoneButton>
                    <SoneButton
                      v-if="hasKey"
                      variant="ghost"
                      size="xs"
                      type="button"
                      @click="hasKey = false"
                    >
                      Clear
                    </SoneButton>
                  </SoneInputGroupAddon>
                </SoneInputGroup>
                <SoneFieldDescription>
                  Stored encrypted on this device. Used to import meeting
                  titles.
                </SoneFieldDescription>
              </SoneField>
            </div>
          </div>
        </SoneFieldGroup>
      </div>
    </div>

    <div class="actions">
      <p class="status" role="status">{{ statusText }}</p>
      <SoneButton
        variant="outline"
        type="button"
        :disabled="!dirty"
        @click="cancel"
      >
        Cancel
      </SoneButton>
      <SoneButton type="button" :disabled="!dirty" @click="save">
        Save changes
      </SoneButton>
    </div>
  </div>
</template>

<style scoped>
.settings {
  display: block;
  padding: var(--space-6);
}
.sections {
  display: grid;
}
.section {
  display: grid;
  grid-template-columns: minmax(0, 14rem) minmax(0, 1fr);
  gap: var(--space-6);
  padding: var(--space-6) 0;
  border-top: 1px solid var(--border-subtle);
}
.section-intro h3 {
  margin: 0 0 var(--space-1);
  color: var(--text-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}
.section-intro p {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--leading-sm);
}
.section-body {
  max-width: 34rem;
}
.secret {
  display: grid;
  gap: var(--space-2);
}
.secret-status {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.choices {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2);
}
.choices-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  padding-top: var(--space-5);
  border-top: 1px solid var(--border-subtle);
}
.status {
  flex: 1 1 auto;
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}
@media (max-width: 720px) {
  .settings {
    padding: var(--space-4);
  }
  .section {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-4);
  }
  .choices,
  .choices-3 {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
