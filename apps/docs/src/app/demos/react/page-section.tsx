import { SonePageSection, type PageFeatureItem, type PageLink } from "@surface-one/react";

const features: PageFeatureItem[] = [
  { icon: "sparkles", title: "Summaries", description: "Every meeting ends with its decisions and follow-ups." },
  { icon: "search", title: "Search", description: "Find what was said, by whom and when." },
  { icon: "lock", title: "Private", description: "Your notes stay on your own devices." },
];
const links: PageLink[] = [{ label: "Explore all features", href: "#features", variant: "outline" }];

export default function PageSectionDemo() {
  return (
    <SonePageSection
      headline="Features"
      title="Everything a meeting needs"
      description="From the first word to the last follow-up, without leaving the app."
      level={3}
      features={features}
      links={links}
    />
  );
}
