import { useRef, useState } from "react";
import { SoneButton, SoneToaster, type SoneToast } from "@surface-one/react";

export default function ToasterDemo() {
  const [toasts, setToasts] = useState<SoneToast[]>([]);
  const nextId = useRef(1);

  // The host owns the queue: push a toast, drop it on dismiss or action.
  const push = (kind: SoneToast["kind"], message: string, actionLabel?: string) => {
    const toast: SoneToast = { id: nextId.current++, kind, message };
    if (actionLabel) toast.action = { label: actionLabel };
    setToasts((list) => [...list, toast]);
  };
  const dismiss = (id: number) => setToasts((list) => list.filter((t) => t.id !== id));

  return (
    <>
      <div className="demo-row">
        <SoneButton variant="outline" type="button" onClick={() => push("success", "Exported to your vault.")}>
          Success
        </SoneButton>
        <SoneButton variant="outline" type="button" onClick={() => push("info", "A new version is ready.", "Restart")}>
          Info with action
        </SoneButton>
        <SoneButton variant="outline" type="button" onClick={() => push("danger", "Couldn’t reach the server.", "Retry")}>
          Error
        </SoneButton>
      </div>

      <SoneToaster toasts={toasts} onDismiss={dismiss} onAction={dismiss} />
    </>
  );
}
