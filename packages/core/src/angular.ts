// The Angular-free files of packages/angular, re-exported as they are: Angular stays the
// one source of this logic, and the Vue and React packages bundle the very same code.
// None of these files may import an Angular module (test/angular-free.test.ts checks);
// the flow types name their icons by `@surface-one/angular/icon`, which every package's
// tsconfig maps to ./angular-icon.ts (a type-only import, erased from the bundles); the
// graph model imports the Angular-free `@surface-one/angular/graph-layout` (and format)
// by name, which every build aliases to its sources.
export * from "../../angular/chart-utils/chart";
export * from "../../angular/chart-utils/scale";
export * from "../../angular/chart-utils/bar-chart";
export * from "../../angular/chart-utils/line-chart";
export * from "../../angular/chart-utils/donut-chart";
export * from "../../angular/format/format";
export * from "../../angular/format/speaker";
export * from "../../angular/format/agent";
export * from "../../angular/format/processing-stage";
export * from "../../angular/flow/flow.types";
export * from "../../angular/flow/flow.geometry";
export * from "../../angular/graph-layout/index";
export * from "../../angular/graph/graph.types";
export * from "../../angular/graph/graph-model";
export * from "../../angular/core/floating-position";
export * from "../../angular/core/list-navigation";
export * from "../../angular/markdown/markdown-render";
export * from "../../angular/markdown/markdown-commands";
export * from "../../angular/markdown/markdown-indent";
export * from "../../angular/markdown/markdown-image";
export * from "../../angular/markdown/markdown-surface";
export * from "../../angular/markdown/markdown-editor-core";
export * from "../../angular/markdown/floating-dock";
export * from "../../angular/core/html-to-markdown";
export * from "../../angular/icon/icons";
export * from "../../angular/input/field-control";
export * from "../../angular/progress/progress-label";
export * from "../../angular/tag-input/tags";
export * from "../../angular/core/command-filter";
export * from "../../angular/core/tree-navigation";
export * from "../../angular/core/row-menu-panel";
export * from "../../angular/timeline/timeline.types";
export * from "../../angular/timeline/timeline-layout";
export * from "../../angular/accordion/accordion-state";
export * from "../../angular/pagination/pagination-range";
export * from "../../angular/data-table/data-table-state";
export * from "../../angular/calendar/calendar-grid";
export * from "../../angular/date-picker/date-picker-label";
export * from "../../angular/combobox/combobox-options";
export * from "../../angular/filter-chips/filter-chips-tone";
export * from "../../angular/section-heading/section-heading-level";
export * from "../../angular/rating/rating-star";
export * from "../../angular/button/button-disabled";
export * from "../../angular/transcript/transcript.types";
export * from "../../angular/transcript/transcript-window";
export * from "../../angular/textarea/textarea-autosize";
export * from "../../angular/file-upload/file-upload-rules";
export * from "../../angular/hover-card/hover-intent";
export * from "../../angular/context-menu/context-menu-gesture";
export * from "../../angular/menubar/menubar-controller";
export * from "../../angular/navigation-menu/navigation-menu-controller";
export * from "../../angular/carousel/carousel-controller";
export * from "../../angular/scroll-area/scroll-area-controller";
