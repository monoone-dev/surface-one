// End-to-end over the real stdio transport: spawn the bin, speak JSON-RPC.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const BIN = fileURLToPath(new URL("../bin/server.mjs", import.meta.url));

function client() {
  const proc = spawn(process.execPath, [BIN], {
    stdio: ["pipe", "pipe", "inherit"],
  });
  let buffer = "";
  const pending = new Map();
  proc.stdout.on("data", (chunk) => {
    buffer += chunk;
    let i;
    while ((i = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, i);
      buffer = buffer.slice(i + 1);
      if (!line.trim()) continue;
      const msg = JSON.parse(line);
      pending.get(msg.id)?.(msg);
    }
  });
  let id = 0;
  const request = (method, params) =>
    new Promise((resolve) => {
      const n = ++id;
      pending.set(n, resolve);
      proc.stdin.write(
        JSON.stringify({ jsonrpc: "2.0", id: n, method, params }) + "\n",
      );
    });
  const notify = (method) =>
    proc.stdin.write(JSON.stringify({ jsonrpc: "2.0", method }) + "\n");
  return { request, notify, close: () => proc.kill() };
}

test("serves the SurfaceOne tools over stdio", async () => {
  const c = client();
  try {
    const init = await c.request("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "test", version: "0" },
    });
    assert.equal(init.result.serverInfo.name, "surface-one-angular");
    assert.match(init.result.instructions, /sone-/);
    c.notify("notifications/initialized");

    const tools = await c.request("tools/list", {});
    assert.deepEqual(tools.result.tools.map((t) => t.name).sort(), [
      "get_component_docs",
      "get_component_source_code",
      "get_component_source_styles",
      "get_docs",
      "get_template",
      "get_theme_variables",
      "list_components",
      "list_templates",
    ]);

    const call = async (name, args) =>
      (await c.request("tools/call", { name, arguments: args })).result
        .content[0].text;

    assert.match(await call("list_components", {}), /\*\*Dialog\*\*/);
    assert.match(await call("list_components", { category: "form" }), /Switch/);

    const docs = await call("get_component_docs", {
      components: ["Button", "sone-dialog", "soneTooltip", "nope"],
    });
    assert.match(docs, /# Button/);
    assert.match(docs, /@surface-one\/angular\/button/);
    assert.match(docs, /\| `variant` \| `ButtonVariant`/);
    assert.match(docs, /# Dialog/);
    assert.match(docs, /# Tooltip/);
    assert.match(docs, /Not found: nope/);

    assert.match(
      await call("get_component_source_code", { components: ["switch"] }),
      /switch\.component\.ts/,
    );
    assert.match(
      await call("get_component_source_styles", { components: ["button"] }),
      /button\.css/,
    );
    assert.match(
      await call("get_docs", { path: "/docs/angular/guide/installation" }),
      /npm install @surface-one/,
    );
    assert.match(await call("get_docs", { path: "theming" }), /data-skin/);
    assert.match(await call("get_docs", { path: "/nope" }), /Available/);
    const paperDark = await call("get_theme_variables", {
      skin: "paper",
      mode: "dark",
    });
    assert.match(paperDark, /## paper · dark/);
    // Resolved values: no var() chain is left for the assistant to follow.
    assert.match(paperDark, /--surface-base: (oklch|#)/);
    assert.doesNotMatch(
      paperDark.replace(/^.*no var\(\) left.*$/m, ""),
      /var\(/,
    );
    assert.match(
      await call("get_theme_variables", {}),
      /## data-accent="blue" · light/,
    );
    assert.match(await call("list_templates", {}), /dashboard/);
    assert.match(
      await call("get_template", { name: "settings" }),
      /export default class/,
    );

    // The Vue and React twins: the same catalogue, framework-specific docs and templates.
    const angularDocs = await call("get_component_docs", {
      components: ["Button"],
      framework: "angular",
    });
    assert.match(angularDocs, /const TEMPLATE = `<div class="demo-stack">/);
    assert.doesNotMatch(angularDocs, /vueCode|reactCode|\/\*@template\*\//);

    const vueDocs = await call("get_component_docs", {
      components: ["Button", "SoneSwitch"],
      framework: "vue",
    });
    assert.match(vueDocs, /# Button/);
    assert.match(
      vueDocs,
      /import \{ SoneButton, SoneButtonGroup \} from "@surface-one\/vue";/,
    );
    assert.match(vueDocs, /```vue\n<script setup lang="ts">/);
    assert.match(vueDocs, /v-model/);
    assert.match(vueDocs, /\| `variant` \| `ButtonVariant`/);
    assert.match(vueDocs, /# Switch/);

    const reactDocs = await call("get_component_docs", {
      components: ["dialog"],
      framework: "react",
    });
    assert.match(reactDocs, /from "@surface-one\/react";/);
    assert.match(reactDocs, /```tsx\n/);
    assert.match(reactDocs, /onXChange/);

    // The last Angular-only families now have their twins, with their docs demo.
    const graphVue = await call("get_component_docs", {
      components: ["graph"],
      framework: "vue",
    });
    assert.match(
      graphVue,
      /import \{ SoneGraph, SoneGraphLegend, SoneGraphData, [^}]*\} from "@surface-one\/vue";/,
    );
    assert.doesNotMatch(graphVue, /twin yet|No Vue docs demo/);
    // A family with no React Native twin says so.
    assert.match(
      await call("get_component_docs", {
        components: ["side-panel"],
        framework: "react-native",
      }),
      /no @surface-one\/react-native twin yet/,
    );
    // A family whose parts come from several Angular classes: every twin name is listed.
    const recordingVue = await call("get_component_docs", {
      components: ["recording"],
      framework: "vue",
    });
    assert.match(
      recordingVue,
      /import \{ SoneLevelMeter, SoneMicToggle, SoneProcessingStatus, SoneRecordButton, SoneRecordingIndicator, SoneStatusOrb \} from "@surface-one\/vue";/,
    );
    assert.doesNotMatch(recordingVue, /No Vue docs demo/);

    // React Native: names from the package, the React mapping, no templates.
    const nativeDocs = await call("get_component_docs", {
      components: ["empty-state", "button"],
      framework: "react-native",
    });
    assert.match(nativeDocs, /SoneEmpty/);
    assert.match(nativeDocs, /from "@surface-one\/react-native";/);
    assert.match(nativeDocs, /onPress/);
    const nativeList = await call("list_components", {
      framework: "react-native",
    });
    assert.match(nativeList, /\*\*Button\*\*/);
    assert.doesNotMatch(nativeList, /\*\*Sidebar\*\*/);

    // Every family of the catalogue has its Vue and React twin.
    const families = (list) =>
      [...list.matchAll(/\*\*([^*]+)\*\*/g)].map(([, name]) => name).sort();
    const angularFamilies = families(await call("list_components", {}));
    assert.ok(angularFamilies.includes("Side Panel"));
    const vueList = await call("list_components", { framework: "vue" });
    assert.deepEqual(families(vueList), angularFamilies);
    assert.deepEqual(
      families(await call("list_components", { framework: "react" })),
      angularFamilies,
    );
    assert.match(vueList, /npm install @surface-one\/vue/);

    assert.match(
      await call("get_template", { name: "settings", framework: "vue" }),
      /```vue\n[\s\S]*@surface-one\/vue/,
    );
    assert.match(
      await call("get_template", { name: "settings", framework: "react" }),
      /```tsx\n[\s\S]*@surface-one\/react/,
    );
    assert.match(
      await call("get_docs", { path: "/docs/vue/package" }),
      /@surface-one\/vue\/nuxt/,
    );
    assert.match(
      await call("get_docs", { path: "/docs/react/package" }),
      /SurfaceOneProvider/,
    );
    assert.match(init.result.instructions, /@surface-one\/vue/);
    assert.match(init.result.instructions, /@surface-one\/react/);

    const bad = await c.request("tools/call", {
      name: "get_template",
      arguments: { name: "settings", framework: "svelte" },
    });
    assert.ok(
      bad.error || bad.result.isError,
      "an unknown framework is rejected",
    );
  } finally {
    c.close();
  }
});

test("loadData keeps example / exampleSource for existing callers", async () => {
  const { loadData, componentDocs } = await import("../src/server.mjs");
  const data = loadData();
  const button = data.components.find((c) => c.slug === "button");
  assert.match(button.example, /^<div class="demo-stack">/);
  assert.match(
    button.exampleSource,
    /const TEMPLATE = `<div class="demo-stack">/,
  );
  assert.match(button.exampleSource, /export default class ButtonDemo/);
  assert.equal(componentDocs(button), componentDocs(button, "angular"));
  assert.ok(data.components.some((c) => c.slug === "collapsible-section"));
});
