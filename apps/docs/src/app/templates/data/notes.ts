// The mock data of the notes template, shared by its Angular (notes.template.ts), Vue
// (vue/notes.vue) and React (react/notes.tsx) screens. Framework-free on purpose:
// scripts/build-template-sources.mjs inlines it into the source each "Code" tab shows.

/** A silent, zero-length WAV inlined as a data URI: no network request, nothing to play. */
export const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";

export const NOTES = `Harbor launch moves to **October 18**. The extra week gives the billing migration a full dry run before the release freeze.

#### Decisions

- Launch date set to **October 18**.
- Release branch freezes on **October 14**.
- The announcement stays in draft until QA signs off.

#### Action items

- [ ] Leo Ruiz — propose a launch-week support rota by Wednesday
- [ ] Mina Sato — share the launch checklist draft on Friday
- [x] Ada Park — confirm the new date with marketing

#### Open questions

1. Who updates the pricing page screenshots?
2. Do we need a status page entry for the migration window?`;
