// The mock data of the form template, shared by its Angular (form.template.ts), Vue
// (vue/form.vue) and React (react/form.tsx) screens. Framework-free on purpose:
// scripts/build-template-sources.mjs inlines it into the source each "Code" tab shows.

export const SERVICES = [
  { id: "research", label: "User research" },
  { id: "design", label: "Product design" },
  { id: "frontend", label: "Frontend build" },
  { id: "backend", label: "Backend and APIs" },
  { id: "a11y", label: "Accessibility audit" },
  { id: "content", label: "Content and copy" },
] as const;

export const SIZES = [
  { id: "small", title: "1–10", copy: "A small team or a pilot." },
  { id: "medium", title: "11–50", copy: "One product area." },
  { id: "large", title: "51+", copy: "Several teams or a rollout." },
] as const;
