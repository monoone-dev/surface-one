// The time / length formatters alone (clockTime, isoDuration, durationLabel …), for a
// bundle that must not pull the whole `./angular` re-export — React Native's Metro does
// not tree-shake. Angular stays the one source of this logic.
export * from "../../angular/format/format";
