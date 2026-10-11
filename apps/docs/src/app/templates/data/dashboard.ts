// The mock data of the dashboard template, shared by its Angular (dashboard.template.ts), Vue
// (vue/dashboard.vue) and React (react/dashboard.tsx) screens. Framework-free on purpose:
// scripts/build-template-sources.mjs inlines it into the source each "Code" tab shows.

export type ProjectStatus =
  "on-track" | "at-risk" | "planning" | "blocked" | "done";

export interface Project {
  readonly id: string;
  readonly name: string;
  readonly team: string;
  readonly owner: string;
  readonly status: ProjectStatus;
  readonly due: string;
  readonly progress: number;
}

export const PROJECTS: readonly Project[] = [
  {
    id: "p1",
    name: "Harbor launch",
    team: "Product",
    owner: "Ada Park",
    status: "on-track",
    due: "Oct 18",
    progress: 72,
  },
  {
    id: "p2",
    name: "Billing migration",
    team: "Platform",
    owner: "Leo Ruiz",
    status: "at-risk",
    due: "Oct 24",
    progress: 41,
  },
  {
    id: "p3",
    name: "Onboarding checklist v2",
    team: "Growth",
    owner: "Mina Sato",
    status: "planning",
    due: "Nov 02",
    progress: 12,
  },
  {
    id: "p4",
    name: "Search relevance study",
    team: "Research",
    owner: "Theo Grant",
    status: "blocked",
    due: "Oct 30",
    progress: 35,
  },
  {
    id: "p5",
    name: "Partner portal refresh",
    team: "Design",
    owner: "Iris Novak",
    status: "on-track",
    due: "Nov 08",
    progress: 58,
  },
  {
    id: "p6",
    name: "Quarterly security review",
    team: "Platform",
    owner: "Sam Okafor",
    status: "done",
    due: "Sep 29",
    progress: 100,
  },
];
