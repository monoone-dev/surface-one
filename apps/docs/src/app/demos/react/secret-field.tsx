import { useState } from "react";
import { SoneSecretField } from "@surface-one/react";

export default function SecretFieldDemo() {
  const [hasKey, setHasKey] = useState(false);
  const [busy, setBusy] = useState(false);

  // A real app hands the value to secure storage; the demo only simulates the round trip.
  const save = (_value: string) => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setHasKey(true);
    }, 600);
  };

  return (
    <div className="demo-stack" style={{ maxWidth: "28rem" }}>
      <SoneSecretField
        label="API key"
        placeholder="Paste your API key"
        help="Stored in the system keychain and never logged."
        clearable
        hasKey={hasKey}
        busy={busy}
        onSave={save}
        onClear={() => setHasKey(false)}
      />
      <SoneSecretField
        label="Workspace token"
        placeholder="tok_…"
        setLabel="Token set ✓"
        saveLabel="Save"
        hasKey={false}
        error="The keychain refused the write. Try again."
      />
    </div>
  );
}
