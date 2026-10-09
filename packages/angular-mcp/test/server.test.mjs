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
    assert.match(
      await call("get_theme_variables", { skin: "paper", mode: "dark" }),
      /## paper · dark/,
    );
    assert.match(await call("list_templates", {}), /dashboard/);
    assert.match(
      await call("get_template", { name: "settings" }),
      /export default class/,
    );
  } finally {
    c.close();
  }
});
