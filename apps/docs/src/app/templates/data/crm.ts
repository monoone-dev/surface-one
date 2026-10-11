// The mock data of the crm template, shared by its Angular (crm.template.ts), Vue
// (vue/crm.vue) and React (react/crm.tsx) screens. Framework-free on purpose:
// scripts/build-template-sources.mjs inlines it into the source each "Code" tab shows.

export type StageId = "lead" | "qualified" | "proposal" | "negotiation" | "won";
export type ActivityType = "call" | "email" | "meeting" | "note" | "stage";

export interface Stage {
  readonly id: StageId;
  readonly label: string;
  readonly probability: number;
}

export interface Owner {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
}

export interface Activity {
  readonly id: string;
  readonly type: ActivityType;
  readonly text: string;
  readonly author: string;
  readonly when: string;
}

export interface Deal {
  readonly id: string;
  readonly company: string;
  readonly contact: {
    readonly name: string;
    readonly title: string;
    readonly email: string;
    readonly phone: string;
  };
  readonly value: number;
  readonly stage: StageId;
  readonly owner: string;
  /** ISO date (YYYY-MM-DD). */
  readonly close: string;
  readonly nextStep: string;
  readonly notes: string;
  readonly activities: readonly Activity[];
}

export const STAGES: readonly Stage[] = [
  { id: "lead", label: "Lead", probability: 10 },
  { id: "qualified", label: "Qualified", probability: 25 },
  { id: "proposal", label: "Proposal", probability: 50 },
  { id: "negotiation", label: "Negotiation", probability: 75 },
  { id: "won", label: "Won", probability: 100 },
];

export const OWNERS: readonly Owner[] = [
  { id: "ap", name: "Ada Park", initials: "AP" },
  { id: "lr", name: "Leo Ruiz", initials: "LR" },
  { id: "ms", name: "Mina Sato", initials: "MS" },
  { id: "tg", name: "Theo Grant", initials: "TG" },
];

/** The current month, fixed so the screen renders the same on the server and the client. */
export const THIS_MONTH = "2026-10";
/** Deals lost this quarter: the other half of the win rate. */
export const LOST_THIS_QUARTER = 2;

export const DEALS: readonly Deal[] = [
  {
    id: "d1",
    company: "Acme Logistics",
    contact: {
      name: "Priya Shah",
      title: "VP Operations",
      email: "priya@acme.example",
      phone: "+1 415 555 0142",
    },
    value: 18000,
    stage: "lead",
    owner: "ap",
    close: "2026-11-20",
    nextStep: "Book a discovery call for next week.",
    notes: "Inbound from the webinar. Runs 40 depots, wants route reports.",
    activities: [
      {
        id: "a1",
        type: "email",
        text: "Sent the intro deck",
        author: "Ada Park",
        when: "Oct 6",
      },
    ],
  },
  {
    id: "d2",
    company: "Brightline Health",
    contact: {
      name: "Marcus Lee",
      title: "Head of IT",
      email: "marcus@brightline.example",
      phone: "+1 212 555 0187",
    },
    value: 42500,
    stage: "qualified",
    owner: "lr",
    close: "2026-10-28",
    nextStep: "Security questionnaire due Friday.",
    notes: "Needs SSO and an EU data region before legal signs off.",
    activities: [
      {
        id: "a1",
        type: "meeting",
        text: "Discovery call with the IT team",
        author: "Leo Ruiz",
        when: "Oct 2",
      },
      {
        id: "a2",
        type: "email",
        text: "Shared the security overview",
        author: "Leo Ruiz",
        when: "Oct 5",
      },
    ],
  },
  {
    id: "d3",
    company: "Cobalt Foods",
    contact: {
      name: "Elena Rossi",
      title: "CFO",
      email: "elena@cobalt.example",
      phone: "+39 02 5550 1234",
    },
    value: 27000,
    stage: "proposal",
    owner: "ms",
    close: "2026-10-17",
    nextStep: "Walk Elena through the annual pricing.",
    notes: "Comparing us with two vendors. Price is the deciding factor.",
    activities: [
      {
        id: "a1",
        type: "call",
        text: "Pricing questions answered",
        author: "Mina Sato",
        when: "Oct 7",
      },
    ],
  },
  {
    id: "d4",
    company: "Driftwood Hotels",
    contact: {
      name: "Sam Carter",
      title: "Director of Guest Experience",
      email: "sam@driftwood.example",
      phone: "+1 305 555 0119",
    },
    value: 64000,
    stage: "negotiation",
    owner: "ap",
    close: "2026-10-24",
    nextStep: "Send the redlined contract back to procurement.",
    notes: "Rolling out to 12 hotels in two waves. Wants a 3-year term.",
    activities: [
      {
        id: "a1",
        type: "meeting",
        text: "Demo for the regional managers",
        author: "Ada Park",
        when: "Sep 30",
      },
      {
        id: "a2",
        type: "email",
        text: "Received the contract redlines",
        author: "Ada Park",
        when: "Oct 8",
      },
    ],
  },
  {
    id: "d5",
    company: "Evergreen Schools",
    contact: {
      name: "Hana Kim",
      title: "Procurement lead",
      email: "hana@evergreen.example",
      phone: "+1 503 555 0163",
    },
    value: 12800,
    stage: "lead",
    owner: "tg",
    close: "2026-12-05",
    nextStep: "Confirm the budget cycle.",
    notes: "Pilot for three campuses, budget opens in December.",
    activities: [
      {
        id: "a1",
        type: "note",
        text: "Referred by Juniper Retail",
        author: "Theo Grant",
        when: "Oct 1",
      },
    ],
  },
  {
    id: "d6",
    company: "Fjord Outdoor",
    contact: {
      name: "Jonas Berg",
      title: "COO",
      email: "jonas@fjord.example",
      phone: "+47 555 01 234",
    },
    value: 35200,
    stage: "proposal",
    owner: "lr",
    close: "2026-11-07",
    nextStep: "Follow up on the proposal.",
    notes: "Seasonal business: go-live must land before the spring catalogue.",
    activities: [
      {
        id: "a1",
        type: "email",
        text: "Proposal sent",
        author: "Leo Ruiz",
        when: "Oct 3",
      },
    ],
  },
  {
    id: "d7",
    company: "Granite Insurance",
    contact: {
      name: "Olivia Grant",
      title: "Head of Claims",
      email: "olivia@granite.example",
      phone: "+44 20 5550 1988",
    },
    value: 88000,
    stage: "negotiation",
    owner: "tg",
    close: "2026-10-31",
    nextStep: "Final pricing call with Olivia and finance.",
    notes: "Largest deal this quarter. Asked for a 10% multi-year discount.",
    activities: [
      {
        id: "a1",
        type: "call",
        text: "Discount request discussed",
        author: "Theo Grant",
        when: "Oct 8",
      },
    ],
  },
  {
    id: "d8",
    company: "Harbor Analytics",
    contact: {
      name: "Noah Patel",
      title: "CTO",
      email: "noah@harbor.example",
      phone: "+1 617 555 0135",
    },
    value: 23400,
    stage: "won",
    owner: "ms",
    close: "2026-10-03",
    nextStep: "Hand over to onboarding.",
    notes: "Signed a 2-year contract. Kick-off on October 14.",
    activities: [
      {
        id: "a1",
        type: "stage",
        text: "Moved to Won",
        author: "Mina Sato",
        when: "Oct 3",
      },
    ],
  },
  {
    id: "d9",
    company: "Iris Studios",
    contact: {
      name: "Chloe Martin",
      title: "Founder",
      email: "chloe@iris.example",
      phone: "+33 1 55 50 12 34",
    },
    value: 9600,
    stage: "qualified",
    owner: "ap",
    close: "2026-11-14",
    nextStep: "Send two customer stories from agencies.",
    notes: "Small team, fast decision. Cares about the design tools.",
    activities: [
      {
        id: "a1",
        type: "call",
        text: "Qualification call",
        author: "Ada Park",
        when: "Oct 4",
      },
    ],
  },
  {
    id: "d10",
    company: "Juniper Retail",
    contact: {
      name: "Diego Alvarez",
      title: "E-commerce lead",
      email: "diego@juniper.example",
      phone: "+34 91 555 0142",
    },
    value: 51000,
    stage: "won",
    owner: "lr",
    close: "2026-09-26",
    nextStep: "Quarterly business review in January.",
    notes: "Expanding to the marketplace team next year.",
    activities: [
      {
        id: "a1",
        type: "stage",
        text: "Moved to Won",
        author: "Leo Ruiz",
        when: "Sep 26",
      },
    ],
  },
];

export const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
export const DAY = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export const stageIndex = (id: StageId): number =>
  STAGES.findIndex((s) => s.id === id);
