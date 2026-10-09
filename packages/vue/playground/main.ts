import { createApp } from "vue";

import "@surface-one/tokens";
import "@surface-one/vue/styles.css";
import { SurfaceOne } from "@surface-one/vue";

import App from "./App.vue";
import "./playground.css";

createApp(App).use(SurfaceOne, { components: false }).mount("#app");
