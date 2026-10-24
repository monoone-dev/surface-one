// The Angular-free files of packages/angular, re-exported as they are: Angular stays the
// one source of this logic, and the Vue and React packages bundle the very same code.
// None of these files may import an Angular module (test/angular-free.test.ts checks);
// the flow types name their icons by `@surface-one/angular/icon`, which every package's
// tsconfig maps to ./angular-icon.ts (a type-only import, erased from the bundles).
export * from "../../angular/chart-utils/chart";
export * from "../../angular/chart-utils/scale";
export * from "../../angular/format/format";
export * from "../../angular/format/speaker";
export * from "../../angular/format/agent";
export * from "../../angular/flow/flow.types";
export * from "../../angular/flow/flow.geometry";
export * from "../../angular/core/floating-position";
export * from "../../angular/core/list-navigation";
export * from "../../angular/markdown/markdown-render";
export * from "../../angular/icon/icons";
export * from "../../angular/input/field-control";
export * from "../../angular/progress/progress-label";
export * from "../../angular/tag-input/tags";
export * from "../../angular/core/command-filter";
export * from "../../angular/core/tree-navigation";
export * from "../../angular/timeline/timeline.types";
export * from "../../angular/timeline/timeline-layout";
export * from "../../angular/accordion/accordion-state";
export * from "../../angular/pagination/pagination-range";
