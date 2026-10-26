import { MARK_TONES, SoneMark } from "@surface-one/react";

export default function MarkDemo() {
  return (
    <div className="demo-stack">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
        {MARK_TONES.map((tone) => (
          <SoneMark key={tone} tone={tone} icon="sparkles" label={tone} />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <SoneMark size="sm" icon="code" tone="iris" />
        <SoneMark icon="code" tone="iris" />
        <SoneMark size="lg" icon="code" tone="iris" />
        <SoneMark size={56} icon="code" tone="iris" label="Code" />
      </div>
    </div>
  );
}
