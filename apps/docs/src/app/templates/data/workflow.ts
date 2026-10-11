// The mock data of the workflow template, shared by its Angular (workflow.template.ts), Vue
// (vue/workflow.vue) and React (react/workflow.tsx) screens. Framework-free on purpose:
// scripts/build-template-sources.mjs inlines it into the source each "Code" tab shows.

export type StepKind =
  | "webhook"
  | "schedule"
  | "http"
  | "database"
  | "email"
  | "slack"
  | "condition"
  | "delay"
  | "done"
  | "note";

export interface StepData {
  readonly kind: StepKind;
  /** The step's settings, by field key. */
  readonly config: Readonly<Record<string, string>>;
}

export interface Field {
  readonly key: string;
  readonly label: string;
  readonly type: "text" | "select" | "number";
  readonly options?: readonly string[];
}

export const STEP_MS = 650;
export const DRAG_TYPE = "application/x-sone-step";
export const HISTORY_LIMIT = 50;
