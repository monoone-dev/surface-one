import { useState } from "react";
import { SoneButton, SoneDownloadProgress } from "@surface-one/react";

export default function DownloadProgressDemo() {
  const [cancelled, setCancelled] = useState(false);
  return (
    <div className="demo-stack" style={{ maxWidth: "26rem" }}>
      {cancelled ? (
        <div className="demo-row">
          <span style={{ color: "var(--text-secondary)" }}>Download cancelled.</span>
          <SoneButton type="button" size="sm" variant="outline" onClick={() => setCancelled(false)}>
            Retry
          </SoneButton>
        </div>
      ) : (
        <SoneDownloadProgress
          frac={0.42}
          cancellable
          ariaLabel="Example model download"
          onCancelRequested={() => setCancelled(true)}
        />
      )}
      <SoneDownloadProgress frac={null} label="Preparing…" ariaLabel="Preparing files" />
      <SoneDownloadProgress label="Example-3B" separator=" · " frac={0.63} ariaLabel="Example-3B download" />
      <SoneDownloadProgress size="md" frac={0.7} ariaLabel="Setup progress" />
    </div>
  );
}
