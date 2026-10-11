import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@surface-one/tokens";
import "@surface-one/react/styles.css";
import { SurfaceOneProvider } from "@surface-one/react";

import { App } from "./App";
import "./playground.css";

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <SurfaceOneProvider>
      <App />
    </SurfaceOneProvider>
  </StrictMode>,
);
