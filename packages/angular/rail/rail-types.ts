// The rail's shared types, with no framework in it: the Angular `sone-rail-button`, the
// Vue and React `SoneRailButton` (through @surface-one/core) read it.

/** A small dot in a rail button's corner: work going on, something to look at, all good. */
export type RailBadge = "busy" | "attention" | "ok";
