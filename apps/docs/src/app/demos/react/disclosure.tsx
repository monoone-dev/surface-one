import { useState } from "react";
import { SoneDisclosure } from "@surface-one/react";

export default function DisclosureDemo() {
  const [advancedOpen, setAdvancedOpen] = useState(true);

  return (
    <div className="demo-stack" style={{ maxWidth: "30rem" }}>
      <SoneDisclosure open={advancedOpen} onOpenChange={setAdvancedOpen} panelLabel="Advanced settings" summary="Advanced settings">
        <p style={{ margin: 0, color: "var(--text-secondary)" }}>
          Model size, language detection and the silence threshold live here.
        </p>
      </SoneDisclosure>
      <SoneDisclosure panelLabel="Storage" summary="Storage">
        <p style={{ margin: 0, color: "var(--text-secondary)" }}>Retention period and the audio budget.</p>
      </SoneDisclosure>
      <SoneDisclosure disabled panelLabel="Sync" summary="Sync (unavailable offline)">
        <p style={{ margin: 0 }}>Never shown while disabled.</p>
      </SoneDisclosure>
    </div>
  );
}
