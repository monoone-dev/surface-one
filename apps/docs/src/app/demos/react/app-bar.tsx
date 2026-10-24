import { useState } from "react";
import { SoneAppBar, SoneButton, SoneIcon } from "@surface-one/react";

export default function AppBarDemo() {
  const [backs, setBacks] = useState(0);
  return (
    <div className="demo-stack" style={{ maxWidth: "24rem" }}>
      <SoneAppBar
        title="Inbox"
        subtitle="12 unread"
        level={3}
        onBack={() => setBacks((n) => n + 1)}
        trailing={
          <SoneButton type="button" variant="ghost" size="icon" aria-label="Search">
            <SoneIcon icon="search" />
          </SoneButton>
        }
      />
      <p className="text-hint" aria-live="polite">
        Back pressed {backs} times
      </p>
    </div>
  );
}
