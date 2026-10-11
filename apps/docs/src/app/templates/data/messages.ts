// The mock data of the messages template, shared by its Angular (messages.template.ts), Vue
// (vue/messages.vue) and React (react/messages.tsx) screens. Framework-free on purpose:
// scripts/build-template-sources.mjs inlines it into the source each "Code" tab shows.

export interface Message {
  readonly id: string;
  readonly mine: boolean;
  readonly text: string;
  readonly time: string;
}

export interface Conversation {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly role: string;
  readonly online: boolean;
  readonly unread: number;
  readonly messages: readonly Message[];
}

export const CONVERSATIONS: readonly Conversation[] = [
  {
    id: "leo",
    name: "Leo Ruiz",
    initials: "LR",
    role: "Platform engineer",
    online: true,
    unread: 2,
    messages: [
      {
        id: "l1",
        mine: false,
        time: "09:12",
        text: "Morning! The migration dry run finished overnight.",
      },
      {
        id: "l2",
        mine: false,
        time: "09:12",
        text: "Two invoices failed validation — both from the legacy EUR plan.",
      },
      {
        id: "l3",
        mine: true,
        time: "09:20",
        text: "Nice catch. Can we patch the mapping before the freeze on the 14th?",
      },
      {
        id: "l4",
        mine: false,
        time: "09:24",
        text: "Yes, I'll open a PR today and tag you for review.",
      },
      {
        id: "l5",
        mine: false,
        time: "09:25",
        text: "Also: are we still on for the support rota sync tomorrow?",
      },
    ],
  },
  {
    id: "mina",
    name: "Mina Sato",
    initials: "MS",
    role: "Product designer",
    online: true,
    unread: 0,
    messages: [
      {
        id: "m1",
        mine: false,
        time: "Yesterday",
        text: "Shared the launch checklist draft in the Harbor space.",
      },
      {
        id: "m2",
        mine: true,
        time: "Yesterday",
        text: "Thanks — I'll go through it before Friday's sync.",
      },
    ],
  },
  {
    id: "theo",
    name: "Theo Grant",
    initials: "TG",
    role: "Support lead",
    online: false,
    unread: 1,
    messages: [
      {
        id: "t1",
        mine: false,
        time: "Mon",
        text: "Could you send me the hand-off notes for launch week?",
      },
    ],
  },
  {
    id: "iris",
    name: "Iris Novak",
    initials: "IN",
    role: "Marketing",
    online: false,
    unread: 0,
    messages: [
      {
        id: "i1",
        mine: true,
        time: "Sep 28",
        text: "The announcement stays in draft until QA signs off.",
      },
      {
        id: "i2",
        mine: false,
        time: "Sep 28",
        text: "Understood, I'll hold the newsletter too.",
      },
    ],
  },
];

export const REPLIES = [
  "Sounds good, thanks!",
  "Got it — I'll follow up after lunch.",
  "Perfect, let's do that.",
];

export function now(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
