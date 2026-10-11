// The mock data of the signup template, shared by its Angular (signup.template.ts), Vue
// (vue/signup.vue) and React (react/signup.tsx) screens. Framework-free on purpose:
// scripts/build-template-sources.mjs inlines it into the source each "Code" tab shows.

export interface Rule {
  readonly id: string;
  readonly label: string;
  readonly test: (value: string) => boolean;
}

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RULES: readonly Rule[] = [
  {
    id: "length",
    label: "At least 10 characters",
    test: (v) => v.length >= 10,
  },
  {
    id: "case",
    label: "Upper- and lowercase letters",
    test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v),
  },
  { id: "number", label: "At least one number", test: (v) => /\d/.test(v) },
  {
    id: "symbol",
    label: "At least one symbol",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
];

export const STRENGTH = ["Too weak", "Weak", "Fair", "Good", "Strong"] as const;
