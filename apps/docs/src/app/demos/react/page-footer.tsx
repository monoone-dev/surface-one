import { SoneButton, SoneIcon, SonePageFooter, type PageFooterColumn } from "@surface-one/react";

const columns: PageFooterColumn[] = [
  {
    label: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    label: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Blog", href: "#blog" },
    ],
  },
  {
    label: "Legal",
    links: [
      { label: "Privacy", href: "#privacy" },
      { label: "Terms", href: "#terms" },
    ],
  },
];

export default function PageFooterDemo() {
  return (
    <SonePageFooter
      ariaLabel="Demo footer"
      copyright="© 2026 Acme Notes"
      columns={columns}
      brand={
        <>
          <strong style={{ color: "var(--text-primary)" }}>Acme Notes</strong>
          <span>Every meeting, written down.</span>
        </>
      }
      right={
        <SoneButton as="a" variant="ghost" size="icon" href="#newsletter" aria-label="Newsletter">
          <SoneIcon icon="mail" />
        </SoneButton>
      }
    />
  );
}
