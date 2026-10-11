// The mock data of the documentation template, shared by its Angular (documentation.template.ts), Vue
// (vue/documentation.vue) and React (react/documentation.tsx) screens. Framework-free on purpose:
// scripts/build-template-sources.mjs inlines it into the source each "Code" tab shows.

export interface NavPage {
  readonly id: string;
  readonly label: string;
  readonly badge?: string;
}

export interface NavGroup {
  readonly id: string;
  readonly label: string;
  readonly pages: readonly NavPage[];
}

export interface Section {
  readonly id: string;
  readonly label: string;
}

export type Lang = "node" | "python" | "curl";

export const CURRENT = "webhooks";

export const NAV: readonly NavGroup[] = [
  {
    id: "start",
    label: "Getting started",
    pages: [
      { id: "introduction", label: "Introduction" },
      { id: "installation", label: "Installation" },
      { id: "quickstart", label: "Quickstart" },
    ],
  },
  {
    id: "guides",
    label: "Guides",
    pages: [
      { id: "authentication", label: "Authentication" },
      { id: "uploads", label: "Uploading files" },
      { id: "webhooks", label: "Webhooks" },
      { id: "rate-limits", label: "Rate limits" },
      { id: "offline", label: "Offline sync", badge: "Beta" },
    ],
  },
  {
    id: "reference",
    label: "Reference",
    pages: [
      { id: "rest", label: "REST API" },
      { id: "events", label: "Event types" },
      { id: "errors", label: "Errors" },
      { id: "sdks", label: "SDKs" },
    ],
  },
];

export const SECTIONS: readonly Section[] = [
  { id: "doc-how", label: "How webhooks work" },
  { id: "doc-create", label: "Create an endpoint" },
  { id: "doc-verify", label: "Verify the signature" },
  { id: "doc-retries", label: "Retries and timeouts" },
  { id: "doc-events", label: "Event types" },
];

export const CODE: Record<Lang, { file: string; source: string }> = {
  node: {
    file: "server.js",
    source: [
      'import express from "express";',
      'import { verifyWebhook } from "@driftbox/sdk";',
      "",
      "const app = express();",
      "",
      "app.post(",
      '  "/webhooks/driftbox",',
      '  express.raw({ type: "application/json" }),',
      "  (req, res) => {",
      "    const event = verifyWebhook(",
      "      req.body,",
      '      req.header("Driftbox-Signature"),',
      "      process.env.DRIFTBOX_SECRET,",
      "    );",
      '    if (event.type === "file.synced") {',
      '      console.log("Synced", event.data.path);',
      "    }",
      "    res.sendStatus(200);",
      "  },",
      ");",
    ].join("\n"),
  },
  python: {
    file: "app.py",
    source: [
      "import os",
      "from flask import Flask, request",
      "from driftbox import verify_webhook",
      "",
      "app = Flask(__name__)",
      "",
      '@app.post("/webhooks/driftbox")',
      "def driftbox_webhook():",
      "    event = verify_webhook(",
      "        request.data,",
      '        request.headers["Driftbox-Signature"],',
      '        os.environ["DRIFTBOX_SECRET"],',
      "    )",
      '    if event.type == "file.synced":',
      '        print("Synced", event.data.path)',
      '    return "", 200',
    ].join("\n"),
  },
  curl: {
    file: "Terminal",
    source: [
      "curl https://api.driftbox.dev/v3/webhooks \\",
      '  -H "Authorization: Bearer $DRIFTBOX_KEY" \\',
      '  -d url="https://example.com/webhooks/driftbox" \\',
      '  -d "events[]=file.synced" \\',
      '  -d "events[]=file.deleted"',
    ].join("\n"),
  },
};

export const RETRIES: readonly { attempt: string; delay: string }[] = [
  { attempt: "1st retry", delay: "1 minute" },
  { attempt: "2nd retry", delay: "10 minutes" },
  { attempt: "3rd retry", delay: "1 hour" },
  { attempt: "4th retry", delay: "6 hours" },
  { attempt: "5th retry", delay: "24 hours" },
];

export const EVENTS: readonly { name: string; description: string }[] = [
  {
    name: "file.synced",
    description: "A file finished syncing to every device.",
  },
  { name: "file.deleted", description: "A file was moved to the trash." },
  {
    name: "folder.shared",
    description: "Someone shared a folder with a teammate.",
  },
  {
    name: "quota.warning",
    description: "The workspace passed 90% of its storage.",
  },
];
