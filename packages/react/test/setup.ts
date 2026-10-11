import { afterEach } from "vitest";

// The SSR tests run in the node environment: there is no DOM to clean up there.
if (typeof document !== "undefined") {
  const { cleanup } = await import("@testing-library/react");
  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });
}
