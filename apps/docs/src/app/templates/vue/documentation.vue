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

import {
  type Lang,
  CURRENT,
  NAV,
  SECTIONS,
  CODE,
  RETRIES,
  EVENTS,
} from "../data/documentation";

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

<style scoped src="../styles/documentation.css"></style>
