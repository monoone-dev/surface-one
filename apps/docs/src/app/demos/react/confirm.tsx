import { useEffect, useRef, useState } from "react";
import {
  SoneButton,
  SoneConfirm,
  SoneConfirmDescription,
  SoneConfirmError,
  SoneConfirmTitle,
} from "@surface-one/react";

export default function ConfirmDemo() {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const opener = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);

  // Give focus back to the button that opened it, once it is rendered again.
  useEffect(() => {
    if (confirming || !restoreFocus.current) return;
    restoreFocus.current = false;
    opener.current?.focus();
  }, [confirming]);

  function close(): void {
    restoreFocus.current = true;
    setConfirming(false);
  }

  function remove(): void {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setStatus("Deleted");
      close();
    }, 800);
  }

  return (
    <div className="demo-stack" style={{ maxWidth: "32rem" }}>
      {/* Inline: render it in place of the button that asked */}
      {confirming ? (
        <SoneConfirm
          variant="destructive"
          confirmLabel="Delete"
          busyLabel="Deleting…"
          busy={busy}
          onConfirm={remove}
          onCancel={close}
        >
          <SoneConfirmTitle>Delete “Weekly sync”?</SoneConfirmTitle>
          <SoneConfirmDescription>It moves to the trash for 30 days.</SoneConfirmDescription>
        </SoneConfirm>
      ) : (
        <div className="demo-row">
          <SoneButton ref={opener} variant="outline" type="button" onClick={() => setConfirming(true)}>
            Delete note
          </SoneButton>
          <span role="status" style={{ color: "var(--text-secondary)" }}>{status}</span>
        </div>
      )}

      {/* Card: a bordered panel; extra controls go in SoneConfirmActions (or actions) */}
      <SoneConfirm layout="card" variant="destructive" confirmLabel="Remove lock" autoFocus={false}>
        <SoneConfirmTitle as="h3">Remove the lock from “Board”?</SoneConfirmTitle>
        <SoneConfirmDescription>Its notes are decrypted and stay readable without Touch ID.</SoneConfirmDescription>
        <SoneConfirmError>Touch ID was cancelled. Try again.</SoneConfirmError>
      </SoneConfirm>
    </div>
  );
}
