import { SonePageHero, type PageLink } from "@surface-one/react";

const links: PageLink[] = [
  { label: "Start for free", href: "#start", trailingIcon: "arrow-right" },
  { label: "See pricing", href: "#pricing" },
];

export default function PageHeroDemo() {
  return (
    <SonePageHero
      headline="New: offline notes"
      title="Every meeting, written down"
      description="Record, transcribe and share the notes of every meeting — searchable, private and in your language."
      orientation="horizontal"
      level={3}
      links={links}
    >
      <div
        role="img"
        aria-label="A meeting summary on a laptop"
        style={{
          aspectRatio: "4 / 3",
          border: "var(--border-width-thin) solid var(--border)",
          borderRadius: "var(--radius-xl)",
          background: "var(--surface-hover)",
        }}
      />
    </SonePageHero>
  );
}
