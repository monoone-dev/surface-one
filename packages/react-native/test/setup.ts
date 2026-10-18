import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// The components render through react-native-web (see vitest.config.ts).
afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});
