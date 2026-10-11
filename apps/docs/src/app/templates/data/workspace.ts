// The mock data of the workspace template, shared by its Angular (workspace.template.ts), Vue
// (vue/workspace.vue) and React (react/workspace.tsx) screens. Framework-free on purpose:
// scripts/build-template-sources.mjs inlines it into the source each "Code" tab shows.

export interface Task {
  readonly id: string;
  readonly label: string;
  readonly done: boolean;
}

export interface Comment {
  readonly id: string;
  readonly author: string;
  readonly initials: string;
  readonly time: string;
  readonly text: string;
}

export const BRIEF = `The legacy EUR plan stores prices as strings, so two invoices fail validation in the dry run.

- Map \`legacy_eur\` prices to integer cents
- Backfill the 214 affected subscriptions
- Re-run the dry run before the **October 14** freeze`;
