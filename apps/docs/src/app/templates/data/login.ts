// The mock data of the login template, shared by its Angular (login.template.ts), Vue
// (vue/login.vue) and React (react/login.tsx) screens. Framework-free on purpose:
// scripts/build-template-sources.mjs inlines it into the source each "Code" tab shows.

export type Provider = "google" | "apple" | "github";

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
