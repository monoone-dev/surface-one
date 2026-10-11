// The private core of the Vue and React packages: framework-agnostic TypeScript both
// bundle (never published, never a run-time dependency). Angular-free logic Angular
// also has comes from packages/angular itself (./angular.ts); what only the Vue and
// React twins need lives here.
export * from "./angular";
export * from "./component-names";
export * from "./focus";
export { SONE_ICONS, type ShellIcon } from "./icons.generated";
export * from "./messages";
export * from "./tooltip";
