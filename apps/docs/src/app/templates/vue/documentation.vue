<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import {
  SoneAlert,
  SoneAlertDescription,
  SoneAlertTitle,
  SoneBadge,
  SoneButton,
  SoneCopyButton,
  SoneIcon,
  SoneInputGroup,
  SoneInputGroupAddon,
  SoneInputGroupInput,
  SoneSegmented,
  type SegmentOption,
} from "@surface-one/vue";

interface NavPage {
  readonly id: string;
  readonly label: string;
  readonly badge?: string;
}

interface NavGroup {
  readonly id: string;
  readonly label: string;
  readonly pages: readonly NavPage[];
}

interface Section {
  readonly id: string;
  readonly label: string;
}

type Lang = "node" | "python" | "curl";

const CURRENT = "webhooks";

const NAV: readonly NavGroup[] = [
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

const SECTIONS: readonly Section[] = [
  { id: "doc-how", label: "How webhooks work" },
  { id: "doc-create", label: "Create an endpoint" },
  { id: "doc-verify", label: "Verify the signature" },
  { id: "doc-retries", label: "Retries and timeouts" },
  { id: "doc-events", label: "Event types" },
];

const CODE: Record<Lang, { file: string; source: string }> = {
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

const RETRIES: readonly { attempt: string; delay: string }[] = [
  { attempt: "1st retry", delay: "1 minute" },
  { attempt: "2nd retry", delay: "10 minutes" },
  { attempt: "3rd retry", delay: "1 hour" },
  { attempt: "4th retry", delay: "6 hours" },
  { attempt: "5th retry", delay: "24 hours" },
];

const EVENTS: readonly { name: string; description: string }[] = [
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

const langs: readonly SegmentOption[] = [
  { value: "node", label: "Node.js" },
  { value: "python", label: "Python" },
  { value: "curl", label: "cURL" },
];

const root = ref<HTMLElement | null>(null);
const query = ref("");
const navOpen = ref(false);
const outlineOpen = ref(false);
const lang = ref<Lang>("node");
const active = ref(SECTIONS[0].id);
const vote = ref<"yes" | "no" | null>(null);

const code = computed(() => CODE[lang.value]);

/** The navigation filtered by the search field; empty groups drop out. */
const groups = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return NAV;
  return NAV.map((g) => ({
    ...g,
    pages: g.pages.filter((p) => p.label.toLowerCase().includes(q)),
  })).filter((g) => g.pages.length > 0);
});

function setLang(value: string): void {
  lang.value = value as Lang;
}

/** Scrolls to a section and moves focus to its heading. */
function jump(id: string, event: Event): void {
  event.preventDefault();
  const heading = root.value?.querySelector<HTMLElement>(`#${id}`);
  if (!heading) return;
  const reduce = heading.ownerDocument.defaultView?.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  heading.scrollIntoView({
    behavior: reduce ? "auto" : "smooth",
    block: "start",
  });
  heading.focus({ preventScroll: true });
  active.value = id;
  outlineOpen.value = false;
}

// Browser only: highlight the outline entry of the section being read.
let observer: IntersectionObserver | null = null;
onMounted(() => {
  if (typeof IntersectionObserver === "undefined" || !root.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      const hit = entries.find((e) => e.isIntersecting);
      if (hit) active.value = hit.target.id;
    },
    { rootMargin: "0px 0px -70% 0px" },
  );
  for (const s of SECTIONS) {
    const h = root.value.querySelector(`#${s.id}`);
    if (h) observer.observe(h);
  }
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <div ref="root" class="documentation">
    <header class="topbar">
      <span class="brand">
        <span class="brand-mark" aria-hidden="true">D</span>
        Driftbox <span class="brand-docs">Docs</span>
      </span>
      <SoneBadge variant="outline">v3.4</SoneBadge>
      <SoneButton
        variant="outline"
        size="sm"
        type="button"
        class="menu-toggle"
        aria-controls="doc-nav"
        :aria-expanded="navOpen"
        @click="navOpen = !navOpen"
      >
        <SoneIcon icon="sidebar" /> Menu
      </SoneButton>
    </header>

    <div class="layout">
      <nav
        id="doc-nav"
        class="nav"
        aria-label="Documentation"
        :data-open="navOpen ? '' : undefined"
      >
        <SoneInputGroup class="nav-search">
          <SoneInputGroupAddon><SoneIcon icon="search" /></SoneInputGroupAddon>
          <SoneInputGroupInput
            v-model="query"
            type="search"
            autocomplete="off"
            placeholder="Search docs"
            aria-label="Search docs"
          />
        </SoneInputGroup>
        <div v-for="g in groups" :key="g.id" class="nav-group">
          <p :id="'doc-nav-' + g.id" class="nav-label">{{ g.label }}</p>
          <ul :aria-labelledby="'doc-nav-' + g.id">
            <li v-for="p in g.pages" :key="p.id">
              <a
                class="nav-link"
                :href="'#' + p.id"
                :aria-current="p.id === CURRENT ? 'page' : undefined"
                @click.prevent
              >
                {{ p.label }}
                <SoneBadge v-if="p.badge" variant="secondary">{{
                  p.badge
                }}</SoneBadge>
              </a>
            </li>
          </ul>
        </div>
        <p v-if="groups.length === 0" class="nav-empty" role="status">
          No pages match “{{ query }}”.
        </p>
      </nav>

      <nav class="outline" aria-labelledby="doc-outline-title">
        <p id="doc-outline-title" class="outline-title">On this page</p>
        <button
          type="button"
          class="outline-toggle"
          aria-controls="doc-outline-list"
          :aria-expanded="outlineOpen"
          @click="outlineOpen = !outlineOpen"
        >
          On this page
          <SoneIcon icon="chevron-right" size="sm" class="outline-caret" />
        </button>
        <ol
          id="doc-outline-list"
          class="outline-list"
          :data-open="outlineOpen ? '' : undefined"
        >
          <li v-for="s in SECTIONS" :key="s.id">
            <a
              class="outline-link"
              :href="'#' + s.id"
              :aria-current="active === s.id ? 'location' : undefined"
              @click="jump(s.id, $event)"
              >{{ s.label }}</a
            >
          </li>
        </ol>
      </nav>

      <article class="article" aria-labelledby="doc-title">
        <p class="crumbs">
          <span>Guides</span>
          <SoneIcon icon="chevron-right" size="xs" />
          <span>Webhooks</span>
        </p>
        <h2 id="doc-title" class="title">Webhooks</h2>
        <p class="lead">
          Get a request on your server the moment something changes in a
          Driftbox workspace — a file syncs, a folder is shared or storage runs
          low — instead of polling the API.
        </p>
        <p class="meta">
          <SoneIcon icon="clock" size="xs" /> 6 min read
          <span aria-hidden="true">·</span> Updated Oct 2, 2026
        </p>

        <section aria-labelledby="doc-how">
          <h3 id="doc-how" tabindex="-1">How webhooks work</h3>
          <p>
            A webhook is an HTTPS endpoint on your server. When an event
            happens, Driftbox sends it a <code>POST</code> request with a JSON
            body describing the event. Your endpoint answers with any
            <code>2xx</code> status within 10 seconds to confirm delivery.
          </p>
          <p>
            Every request carries a <code>Driftbox-Signature</code> header, so
            you can check that it really came from Driftbox before you act on
            it.
          </p>
        </section>

        <section aria-labelledby="doc-create">
          <h3 id="doc-create" tabindex="-1">Create an endpoint</h3>
          <ol class="steps">
            <li>
              <strong>Add a route.</strong> Accept <code>POST</code> requests
              and keep the raw body — the signature is computed over the exact
              bytes.
            </li>
            <li>
              <strong>Register the URL.</strong> In
              <em>Settings → Developers → Webhooks</em>, add the URL and pick
              the events you need.
            </li>
            <li>
              <strong>Store the secret.</strong> Copy the signing secret into an
              environment variable such as <code>DRIFTBOX_SECRET</code>.
            </li>
          </ol>

          <figure class="code">
            <figcaption class="code-head">
              <SoneSegmented
                size="sm"
                aria-label="Language"
                :options="langs"
                :model-value="lang"
                @update:model-value="setLang"
              />
              <span class="code-file">{{ code.file }}</span>
              <SoneCopyButton
                icon-only
                variant="ghost"
                label="Copy code"
                :value="code.source"
              />
            </figcaption>
            <pre
              class="code-body"
              tabindex="0"
              :aria-label="'Code sample, ' + code.file"
            ><code>{{ code.source }}</code></pre>
          </figure>
        </section>

        <section aria-labelledby="doc-verify">
          <h3 id="doc-verify" tabindex="-1">Verify the signature</h3>
          <p>
            The signature is an HMAC-SHA256 of the timestamp and the raw body,
            keyed with your signing secret. The SDKs do the check for you and
            throw when it fails or when the timestamp is older than five
            minutes.
          </p>
          <SoneAlert variant="info" role="note">
            <SoneIcon icon="alert-circle" />
            <SoneAlertTitle>Never skip verification</SoneAlertTitle>
            <SoneAlertDescription>
              Anyone can send a request to a public URL. Reject a request whose
              signature does not match with a <code>400</code> and do nothing
              else.
            </SoneAlertDescription>
          </SoneAlert>
        </section>

        <section aria-labelledby="doc-retries">
          <h3 id="doc-retries" tabindex="-1">Retries and timeouts</h3>
          <p>
            When your endpoint times out or answers with an error, Driftbox
            retries with a growing delay. After the fifth failed retry the event
            is marked as failed and you can replay it from the dashboard.
          </p>
          <div class="table-wrap">
            <table class="table">
              <caption class="sr-only">
                Retry schedule
              </caption>
              <thead>
                <tr>
                  <th scope="col">Attempt</th>
                  <th scope="col">Delay after the previous one</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in RETRIES" :key="r.attempt">
                  <td>{{ r.attempt }}</td>
                  <td>{{ r.delay }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="doc-events">
          <h3 id="doc-events" tabindex="-1">Event types</h3>
          <p>Subscribe only to the events you handle. The most common ones:</p>
          <dl class="events">
            <div v-for="e in EVENTS" :key="e.name">
              <dt>
                <code>{{ e.name }}</code>
              </dt>
              <dd>{{ e.description }}</dd>
            </div>
          </dl>
        </section>

        <div class="feedback">
          <p id="doc-feedback">Was this page helpful?</p>
          <div
            class="feedback-actions"
            role="group"
            aria-labelledby="doc-feedback"
          >
            <SoneButton
              variant="outline"
              size="sm"
              type="button"
              :aria-pressed="vote === 'yes'"
              @click="vote = 'yes'"
            >
              <SoneIcon icon="check" /> Yes
            </SoneButton>
            <SoneButton
              variant="outline"
              size="sm"
              type="button"
              :aria-pressed="vote === 'no'"
              @click="vote = 'no'"
            >
              <SoneIcon icon="close" /> No
            </SoneButton>
          </div>
          <p class="feedback-thanks" role="status">
            <template v-if="vote"
              >Thanks — your feedback helps us improve the docs.</template
            >
          </p>
        </div>

        <nav class="pager" aria-label="Previous and next page">
          <a class="pager-link" href="#uploads" @click.prevent>
            <span class="pager-hint">
              <SoneIcon icon="arrow-right" size="xs" class="flip" /> Previous
            </span>
            <span class="pager-title">Uploading files</span>
          </a>
          <a class="pager-link pager-next" href="#rate-limits" @click.prevent>
            <span class="pager-hint">
              Next <SoneIcon icon="arrow-right" size="xs" />
            </span>
            <span class="pager-title">Rate limits</span>
          </a>
        </nav>
      </article>
    </div>
  </div>
</template>

<style scoped>
.documentation {
  display: block;
  container-type: inline-size;
  padding: var(--space-6);
  color: var(--text-primary);
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
code {
  padding: var(--prose-code-padding);
  border: var(--border-width-thin) solid var(--prose-code-border);
  border-radius: var(--radius-sm);
  background: var(--prose-code-bg);
  font-family: var(--font-mono);
  font-size: 0.875em;
}

/* Top bar */
.topbar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-bottom: var(--space-4);
  margin-bottom: var(--space-6);
  border-bottom: var(--border-width-thin) solid var(--border-subtle);
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: var(--font-weight-semibold);
}
.brand-mark {
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: var(--text-on-accent);
  font-size: var(--font-size-sm);
}
.brand-docs {
  color: var(--text-secondary);
  font-weight: var(--font-weight-normal);
}
.menu-toggle {
  display: none;
  margin-left: auto;
}

/* Three zones */
.layout {
  display: grid;
  grid-template-columns: 14rem minmax(0, 1fr) 12rem;
  grid-template-areas: "nav main outline";
  align-items: start;
  gap: var(--space-8);
}
.nav {
  grid-area: nav;
  position: sticky;
  top: var(--space-4);
  display: grid;
  gap: var(--space-5);
}
.outline {
  grid-area: outline;
  position: sticky;
  top: var(--space-4);
}
.article {
  grid-area: main;
  min-width: 0;
  max-width: 44rem;
}

/* Left navigation */
.nav-search {
  width: 100%;
}
.nav-group {
  display: grid;
  gap: var(--space-1);
}
.nav-label {
  margin: 0;
  padding-inline: var(--space-3);
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
}
.nav ul,
.outline-list {
  display: grid;
  gap: var(--space-px);
  margin: 0;
  padding: 0;
  list-style: none;
}
.nav-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  min-height: var(--control-h-sm);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  text-decoration: none;
  transition:
    background var(--transition),
    color var(--transition);
}
.nav-link:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}
.nav-link[aria-current="page"] {
  background: var(--accent-soft);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
  box-shadow: inset var(--border-width-thick) 0 0 var(--accent);
}
.nav-link:focus-visible,
.outline-link:focus-visible,
.pager-link:focus-visible,
.outline-toggle:focus-visible,
.code-body:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
.nav-empty {
  margin: 0;
  padding-inline: var(--space-3);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

/* "On this page" */
.outline-title,
.outline-toggle {
  margin: 0 0 var(--space-2);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}
.outline-toggle {
  display: none;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 0;
  padding: var(--space-2) var(--space-3);
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  font: inherit;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}
.outline-caret {
  transition: transform var(--transition);
}
.outline-toggle[aria-expanded="true"] .outline-caret {
  transform: rotate(90deg);
}
.outline-list {
  border-left: var(--border-width-thin) solid var(--border-subtle);
}
.outline-link {
  display: block;
  margin-left: calc(var(--space-px) * -1);
  padding: var(--space-1) var(--space-3);
  border-left: 2px solid transparent;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--leading-snug);
  text-decoration: none;
}
.outline-link:hover {
  color: var(--text-primary);
}
.outline-link[aria-current="location"] {
  border-left-color: var(--accent);
  color: var(--accent-text);
  font-weight: var(--font-weight-medium);
}

/* Article */
.crumbs {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin: 0 0 var(--space-2);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
.title {
  margin: 0;
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-heading);
  line-height: var(--leading-tight);
}
.lead {
  margin: var(--space-3) 0 0;
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  line-height: var(--leading-relaxed);
}
.meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: var(--space-3) 0 0;
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}
.article section {
  margin-top: var(--space-8);
}
.article h3 {
  margin: 0 0 var(--space-3);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-heading);
  scroll-margin-top: var(--space-6);
}
.article h3:focus {
  outline: none;
}
.article section p {
  margin: 0 0 var(--space-3);
  line-height: var(--leading-relaxed);
}
.steps {
  display: grid;
  gap: var(--space-3);
  margin: 0 0 var(--space-5);
  padding: 0;
  list-style: none;
  counter-reset: step;
}
.steps li {
  position: relative;
  padding-left: var(--space-8);
  line-height: var(--leading-relaxed);
  counter-increment: step;
}
.steps li::before {
  content: counter(step);
  position: absolute;
  top: 0;
  left: 0;
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  border: var(--border-width-thin) solid var(--border);
  border-radius: var(--radius-pill);
  background: var(--surface-raised);
  color: var(--text-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

/* Code sample */
.code {
  margin: 0;
  overflow: hidden;
  border: var(--border-width-thin) solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface-raised);
}
.code-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-3);
  padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3);
  border-bottom: var(--border-width-thin) solid var(--border-subtle);
}
.code-file {
  margin-left: auto;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
}
.code-body {
  margin: 0;
  padding: var(--space-4);
  overflow-x: auto;
  background: var(--prose-code-bg);
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  line-height: var(--leading-relaxed);
}
.code-body code {
  padding: 0;
  border: 0;
  background: none;
  font-size: inherit;
}

/* Table and events */
.table-wrap {
  overflow-x: auto;
  border: var(--border-width-thin) solid var(--border-subtle);
  border-radius: var(--radius-md);
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}
.table th,
.table td {
  padding: var(--space-2) var(--space-3);
  border-bottom: var(--border-width-thin) solid var(--border-subtle);
  text-align: left;
}
.table th {
  background: var(--prose-table-head-bg);
  color: var(--text-secondary);
  font-weight: var(--font-weight-semibold);
}
.table tbody tr:last-child td {
  border-bottom: 0;
}
.events {
  display: grid;
  gap: var(--space-3);
  margin: 0;
}
.events div {
  display: grid;
  grid-template-columns: 10rem minmax(0, 1fr);
  gap: var(--space-3);
  align-items: baseline;
}
.events dd {
  margin: 0;
  color: var(--text-secondary);
}

/* Feedback and pager */
.feedback {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-8);
  padding-top: var(--space-5);
  border-top: var(--border-width-thin) solid var(--border-subtle);
}
.feedback p {
  margin: 0;
  font-weight: var(--font-weight-medium);
}
.feedback-actions {
  display: flex;
  gap: var(--space-2);
}
.feedback .feedback-thanks {
  flex-basis: 100%;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
}
.feedback-thanks:empty {
  display: none;
}
.pager {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-top: var(--space-6);
}
.pager-link {
  display: grid;
  gap: var(--space-1);
  padding: var(--space-4);
  border: var(--border-width-thin) solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  text-decoration: none;
  transition:
    border-color var(--transition),
    background var(--transition);
}
.pager-link:hover {
  border-color: var(--border-strong);
  background: var(--surface-hover);
}
.pager-next {
  text-align: right;
}
.pager-hint {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
.pager-next .pager-hint {
  justify-content: flex-end;
}
.pager-title {
  font-weight: var(--font-weight-semibold);
}
.flip {
  transform: scaleX(-1);
}

/* Narrower: the outline folds into a disclosure above the article. */
@container (max-width: 1040px) {
  .layout {
    grid-template-columns: 13rem minmax(0, 1fr);
    grid-template-areas:
      "nav outline"
      "nav main";
    row-gap: var(--space-5);
  }
  .outline {
    position: static;
    max-width: 44rem;
    border: var(--border-width-thin) solid var(--border-subtle);
    border-radius: var(--radius-md);
  }
  .outline-title {
    display: none;
  }
  .outline-toggle {
    display: flex;
  }
  .outline-list {
    margin: 0 var(--space-3) var(--space-3);
  }
  .outline-list:not([data-open]) {
    display: none;
  }
}
/* Phone: the navigation hides behind the Menu button. */
@container (max-width: 720px) {
  .menu-toggle {
    display: inline-flex;
  }
  .layout {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: "nav" "outline" "main";
  }
  .nav {
    position: static;
  }
  .nav:not([data-open]) {
    display: none;
  }
  .title {
    font-size: var(--font-size-2xl);
  }
  .events div {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-1);
  }
  .pager {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 720px) {
  .documentation {
    padding: var(--space-4);
  }
}
@media (prefers-reduced-motion: reduce) {
  .nav-link,
  .pager-link,
  .outline-caret {
    transition: none;
  }
}
</style>
