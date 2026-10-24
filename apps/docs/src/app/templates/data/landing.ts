// The mock data of the landing template, shared by its Angular (landing.template.ts), Vue
// (vue/landing.vue) and React (react/landing.tsx) screens. Framework-free on purpose:
// scripts/build-template-sources.mjs inlines it into the source each "Code" tab shows.

export const NAV = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Customers", href: "#customers" },
  { label: "Changelog", href: "#changelog" },
] as const;

export const HERO_LINKS = [
  { label: "Start for free", href: "#signup", trailingIcon: "arrow-right" },
  { label: "Book a demo", href: "#demo" },
] as const;

export const PEOPLE = [
  { name: "Ada Lovelace" },
  { name: "Grace Hopper" },
  { name: "Alan Turing" },
  { name: "Katherine Johnson" },
  { name: "Margaret Hamilton" },
] as const;

export const SUMMARY = [
  "Ship the new onboarding on May 12",
  "Ada drafts the pricing page copy",
  "Review the churn numbers next week",
] as const;

export const FEATURES = [
  {
    icon: "record",
    title: "One-tap recording",
    description:
      "Start from the menu bar or your phone; nothing to install for guests.",
  },
  {
    icon: "sparkles",
    title: "Summaries that act",
    description:
      "Decisions, owners and dates, pulled out the moment the call ends.",
  },
  {
    icon: "search",
    title: "Search everything",
    description: "Find what was said, by whom and when, across every meeting.",
  },
  {
    icon: "spaces",
    title: "Shared spaces",
    description: "Keep each team's meetings, notes and follow-ups together.",
  },
  {
    icon: "reminders",
    title: "Follow-up reminders",
    description:
      "Every action item becomes a reminder for the person who owns it.",
  },
  {
    icon: "lock",
    title: "Private by design",
    description:
      "Recordings stay in your workspace and are never used for training.",
  },
] as const;

export const PLANS = [
  {
    title: "Free",
    description: "For trying it out.",
    price: "$0",
    billingCycle: "/month",
    features: ["5 meetings a month", "AI summaries", "7-day history"],
    button: { label: "Start for free", href: "#signup" },
  },
  {
    title: "Pro",
    description: "For people who meet a lot.",
    badge: "Most popular",
    price: "$24",
    discount: "$19",
    billingCycle: "/month",
    billingPeriod: "billed annually",
    features: [
      "Unlimited meetings",
      "Search across everything",
      "Follow-up reminders",
      { title: "Priority support", icon: "zap" },
    ],
    button: { label: "Get Pro", href: "#signup" },
    terms: "Cancel any time.",
    highlight: true,
  },
  {
    title: "Team",
    description: "For the whole company.",
    price: "Custom",
    tagline: "Everything in Pro, plus:",
    features: ["Shared spaces", "Admin and audit log", "Single sign-on"],
    button: { label: "Contact sales", href: "#sales" },
  },
] as const;

export const FOOTER_COLUMNS = [
  {
    label: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", href: "#changelog" },
    ],
  },
  {
    label: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Customers", href: "#customers" },
      { label: "Careers", href: "#careers" },
    ],
  },
  {
    label: "Legal",
    links: [
      { label: "Privacy", href: "#privacy" },
      { label: "Terms", href: "#terms" },
    ],
  },
] as const;
