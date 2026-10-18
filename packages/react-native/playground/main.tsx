import { createRoot } from "react-dom/client";

import { App } from "./App";

// react-native-web renders through react-dom.
createRoot(document.getElementById("app")!).render(<App />);
