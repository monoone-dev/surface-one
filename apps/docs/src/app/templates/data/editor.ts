// The mock data of the editor template, shared by its Angular (editor.template.ts), Vue
// (vue/editor.vue) and React (react/editor.tsx) screens. Framework-free on purpose:
// scripts/build-template-sources.mjs inlines it into the source each "Code" tab shows.

export interface Doc {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly edited: string;
}

export const DOCS: readonly Doc[] = [
  {
    id: "release",
    title: "Harbor release notes",
    edited: "2 min ago",
    body: `## What's new in Harbor 2.4

Harbor now imports meetings from **every calendar** you connect, and the search finds words inside transcripts.

### Highlights

- Calendar sync for Google and Outlook
- Search inside transcripts, with \`speaker:\` filters
- Faster exports — up to *3× quicker* for long meetings

### Before you upgrade

1. Back up your workspace from **Settings → Data**
2. Ask admins to re-approve the calendar scopes
3. Read the [migration guide](https://example.com/guide)

- [x] Draft the notes
- [ ] Legal review
- [ ] Publish on Oct 18

> Questions? Reply in the #harbor-launch channel.`,
  },
  {
    id: "rfc",
    title: "RFC: transcript search",
    edited: "Yesterday",
    body: `## Problem

Search only matches meeting titles, so people cannot find what was *said*.

## Proposal

Index transcript segments and rank them by recency and speaker.`,
  },
  {
    id: "retro",
    title: "Sprint 41 retro",
    edited: "Mon",
    body: `## Went well

- Billing dry run caught two bugs early

## To improve

- Freeze dates need a calendar reminder`,
  },
];
