/** The pipeline stages a recording passes through, with a built-in label each. */
export type ProcessingStage =
  | "recording"
  | "transcribing"
  | "summarizing"
  | "exporting"
  | "saved"
  | "finalized"
  | "done"
  | "error";

function builtInLabel(stage: string): string | undefined {
  if (typeof $localize !== "function") {
    return (
      {
        recording: "Recording",
        transcribing: "Transcribing",
        summarizing: "Summarizing",
        exporting: "Exporting",
        saved: "Saved",
        finalized: "Finalizing",
        done: "Done",
        error: "Error",
      } as Record<string, string>
    )[stage];
  }
  switch (stage) {
    case "recording":
      return $localize`:noun|Processing stage label:Recording`;
    case "transcribing":
      return $localize`:Processing stage label:Transcribing`;
    case "summarizing":
      return $localize`:Processing stage label:Summarizing`;
    case "exporting":
      return $localize`:Processing stage label:Exporting`;
    case "saved":
      return $localize`:Processing stage label:Saved`;
    case "finalized":
      return $localize`:Processing stage label:Finalizing`;
    case "done":
      return $localize`:Processing stage label:Done`;
    case "error":
      return $localize`:Processing stage label:Error`;
    default:
      return undefined;
  }
}

/**
 * The label of a processing stage: `labels[stage]`, else the built-in (`$localize`d)
 * label, else the stage itself capitalised (`uploading` → `Uploading`).
 */
export function processingStageLabel(
  stage: string,
  labels: Partial<Record<string, string>> = {},
): string {
  return (
    labels[stage] ??
    builtInLabel(stage) ??
    stage.charAt(0).toUpperCase() + stage.slice(1)
  );
}
