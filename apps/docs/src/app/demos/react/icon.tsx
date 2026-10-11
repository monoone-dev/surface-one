import { SoneButton, SoneIcon } from "@surface-one/react";

export default function IconDemo() {
  return (
    <div className="demo-stack">
      <div className="demo-row" style={{ alignItems: "flex-end" }}>
        <SoneIcon icon="sparkles" size="xs" />
        <SoneIcon icon="sparkles" size="sm" />
        <SoneIcon icon="sparkles" size="base" />
        <SoneIcon icon="sparkles" size="lg" />
        <SoneIcon icon="sparkles" size="xl" />
      </div>
      <div className="demo-row" style={{ alignItems: "center" }}>
        {/* Icons draw in currentColor; give a label only when the icon carries the meaning alone */}
        <span style={{ color: "var(--text-secondary)" }}><SoneIcon icon="lock" label="Locked" /></span>
        <span style={{ color: "var(--danger)" }}><SoneIcon icon="alert-circle" label="Error" /></span>
      </div>
      <div className="demo-row" style={{ alignItems: "center" }}>
        <SoneButton variant="outline" type="button"><SoneIcon icon="plus" inline="start" /> New note</SoneButton>
        <SoneButton variant="outline" type="button">Next <SoneIcon icon="chevron-right" inline="end" /></SoneButton>
        <SoneButton variant="ghost" size="icon" type="button" aria-label="Search"><SoneIcon icon="search" /></SoneButton>
      </div>
    </div>
  );
}
