import { SoneSeparator } from "@surface-one/react";

export default function SeparatorDemo() {
  return (
    <div className="demo-stack" style={{ maxWidth: "24rem" }}>
      <div>
        <strong>SurfaceOne</strong>
        <p style={{ margin: "var(--space-1) 0 0", color: "var(--text-secondary)" }}>An Angular component library.</p>
      </div>
      <SoneSeparator />
      <div className="demo-row" style={{ height: "20px", color: "var(--text-secondary)" }}>
        <span>Docs</span>
        <SoneSeparator as="span" orientation="vertical" />
        <span>Components</span>
        <SoneSeparator as="span" orientation="vertical" />
        <span>Changelog</span>
      </div>
      <SoneSeparator as="hr" decorative={false} />
      <span style={{ color: "var(--text-secondary)" }}>A non-decorative separator is announced to screen readers.</span>
    </div>
  );
}
