// Re-records test/resolved.snapshot.json. Run it (npm run test:update -w @surface-one/tokens)
// only for a change that is MEANT to alter a resolved value, and review the diff.
import { writeFileSync } from "node:fs";
import { currentSnapshot, serialize, SNAPSHOT } from "./resolved.mjs";

const snapshot = currentSnapshot();
writeFileSync(SNAPSHOT, serialize(snapshot));
console.log(
  `snapshot: ${Object.keys(snapshot.tokens).length} properties × ${snapshot.contexts.length} contexts`,
);
