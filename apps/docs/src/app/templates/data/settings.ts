// The mock data of the settings template, shared by its Angular (settings.template.ts), Vue
// (vue/settings.vue) and React (react/settings.tsx) screens. Framework-free on purpose:
// scripts/build-template-sources.mjs inlines it into the source each "Code" tab shows.

export interface Preferences {
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

export interface Choice {
  readonly id: string;
  readonly title: string;
  readonly copy: string;
}

export const DEFAULTS: Preferences = {
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
