// The mock data of the changelog template, shared by its Angular (changelog.template.ts), Vue
// (vue/changelog.vue) and React (react/changelog.tsx) screens. Framework-free on purpose:
// scripts/build-template-sources.mjs inlines it into the source each "Code" tab shows.

export type Kind = "added" | "improved" | "fixed";
export type Filter = "all" | Kind;

/** Releases shown before "Show older releases". */
export const PAGE = 5;
