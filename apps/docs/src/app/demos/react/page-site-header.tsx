import { useState } from "react";
import { SoneButton, SonePageSiteHeader } from "@surface-one/react";

export default function PageSiteHeaderDemo() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <SonePageSiteHeader
      title="Acme Notes"
      href="#"
      open={menuOpen}
      onOpenChange={setMenuOpen}
      nav={
        <nav aria-label="Demo site" className="cluster" data-gap="4">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#blog">Blog</a>
        </nav>
      }
      actions={
        <SoneButton as="a" size="sm" href="#start">
          Get started
        </SoneButton>
      }
      menu={
        <nav aria-label="Demo site menu" className="stack">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#blog">Blog</a>
        </nav>
      }
    />
  );
}
