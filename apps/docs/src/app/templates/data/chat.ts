// The mock data of the chat template, shared by its Angular (chat.template.ts), Vue
// (vue/chat.vue) and React (react/chat.tsx) screens. Framework-free on purpose:
// scripts/build-template-sources.mjs inlines it into the source each "Code" tab shows.

export type Turn =
  | { readonly id: string; readonly kind: "user"; readonly text: string }
  | { readonly id: string; readonly kind: "assistant"; readonly text: string }
  | { readonly id: string; readonly kind: "marker"; readonly text: string };

export interface Source {
  readonly id: string;
  readonly title: string;
  readonly meta: string;
}

export const THREAD: readonly Turn[] = [
  {
    id: "t1",
    kind: "user",
    text: "What did we agree on for the Harbor launch date?",
  },
  { id: "t2", kind: "marker", text: "Searched 4 notes" },
  {
    id: "t3",
    kind: "assistant",
    text:
      "The team agreed to launch **Harbor on October 18**, one week later than first planned.\n\n" +
      "- Ada Park moved the date to leave room for the billing migration.\n" +
      "- Leo Ruiz will freeze the release branch on **October 14**.\n" +
      "- Marketing keeps the announcement draft but holds it until QA signs off.",
  },
  { id: "t4", kind: "user", text: "Who is writing the launch checklist?" },
  { id: "t5", kind: "marker", text: "Searched 2 meetings" },
  {
    id: "t6",
    kind: "assistant",
    text:
      "Mina Sato owns the checklist. She plans to share a first draft in Friday's sync, " +
      "and Theo Grant will review the support hand-off section.",
  },
];

export const REPLY =
  "Here is what I found in your notes: the open questions are the **pricing page screenshots** " +
  "and the **support rota for launch week**. Both are tracked as reminders for Leo Ruiz.";
