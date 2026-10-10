<script setup lang="ts">
import { computed, ref } from "vue";
import {
  SoneAlert,
  SoneAlertDescription,
  SoneAlertTitle,
  SoneBadge,
  SoneButton,
  SoneCopyButton,
  SoneIcon,
  SoneSegmented,
  type BadgeVariant,
  type SegmentOption,
} from "@surface-one/vue";

type Kind = "added" | "improved" | "fixed";
type Filter = "all" | Kind;

interface Release {
  readonly version: string;
  /** ISO date for `<time datetime>`. */
  readonly date: string;
  readonly dateLabel: string;
  readonly title: string;
  readonly summary: string;
  /** A breaking change, shown as a warning above the lists. */
  readonly breaking?: string;
  readonly changes: Readonly<Partial<Record<Kind, readonly string[]>>>;
}

const KINDS: readonly {
  id: Kind;
  label: string;
  variant: BadgeVariant;
}[] = [
  { id: "added", label: "Added", variant: "success" },
  { id: "improved", label: "Improved", variant: "accent" },
  { id: "fixed", label: "Fixed", variant: "warning" },
];

const RELEASES: readonly Release[] = [
  {
    version: "3.4.0",
    date: "2026-10-07",
    dateLabel: "Oct 7, 2026",
    title: "Webhook replay and a faster sync engine",
    summary:
      "Failed webhook deliveries can now be replayed from the dashboard, and large folders sync up to twice as fast.",
    changes: {
      added: [
        "Replay a failed webhook delivery from Settings → Developers.",
        "A quota.warning event when a workspace passes 90% of its storage.",
      ],
      improved: [
        "Folders with more than 10,000 files sync up to 2× faster.",
        "The activity log loads in pages of 100 instead of all at once.",
      ],
      fixed: ["Renaming a file twice in a row no longer creates a duplicate."],
    },
  },
  {
    version: "3.3.2",
    date: "2026-09-24",
    dateLabel: "Sep 24, 2026",
    title: "Patch release",
    summary: "Small fixes for shared links and the Windows app.",
    changes: {
      fixed: [
        "Shared links with an expiry date showed the wrong time zone.",
        "The Windows app could stall on files with very long paths.",
        "Search ignored accented letters such as “é” and “ł”.",
      ],
    },
  },
  {
    version: "3.3.0",
    date: "2026-09-10",
    dateLabel: "Sep 10, 2026",
    title: "Shared links that expire",
    summary:
      "Give a link an expiry date and a password, and see who opened it.",
    changes: {
      added: [
        "Expiry dates and passwords for shared links.",
        "A “Viewed by” list on every shared link.",
      ],
      improved: ["Link previews now show the file size and type."],
    },
  },
  {
    version: "3.2.0",
    date: "2026-08-20",
    dateLabel: "Aug 20, 2026",
    title: "Folder-level permissions",
    summary:
      "Set who can view, edit or share each folder, instead of the whole workspace.",
    changes: {
      added: [
        "View, edit and share roles per folder.",
        "An audit log entry for every permission change.",
      ],
      improved: ["The member picker searches by name and email."],
      fixed: ["Guests could see the names of folders they had no access to."],
    },
  },
  {
    version: "3.1.1",
    date: "2026-08-06",
    dateLabel: "Aug 6, 2026",
    title: "Patch release",
    summary: "Fixes for uploads on slow connections.",
    changes: {
      fixed: [
        "Uploads over 2 GB restarted after a dropped connection.",
        "The progress bar stopped at 99% on some uploads.",
      ],
    },
  },
  {
    version: "3.1.0",
    date: "2026-07-16",
    dateLabel: "Jul 16, 2026",
    title: "Python SDK 1.0",
    summary: "The Python SDK is stable, with typed models and async support.",
    changes: {
      added: ["driftbox for Python 1.0 with sync and async clients."],
      improved: ["Error messages now include the request ID."],
    },
  },
  {
    version: "3.0.0",
    date: "2026-06-25",
    dateLabel: "Jun 25, 2026",
    title: "Driftbox 3",
    summary:
      "A new sync engine, a redesigned web app and version 3 of the REST API.",
    breaking:
      "API v1 is retired. Move your integration to /v3 before December 1, 2026.",
    changes: {
      added: [
        "A new sync engine with block-level transfers.",
        "Version 3 of the REST API with cursor pagination.",
      ],
      improved: ["A redesigned web app with dark mode."],
    },
  },
];

/** Releases shown before "Show older releases". */
const PAGE = 5;

const latest = RELEASES[0];
const filters: readonly SegmentOption[] = [
  { value: "all", label: "All" },
  { value: "added", label: "Features" },
  { value: "improved", label: "Improvements" },
  { value: "fixed", label: "Fixes" },
];

const filter = ref<Filter>("all");
const subscribed = ref(false);
const showAll = ref(false);

/** Releases with at least one change of the chosen kind. */
const matching = computed(() => {
  const f = filter.value;
  return f === "all"
    ? RELEASES
    : RELEASES.filter((r) => (r.changes[f]?.length ?? 0) > 0);
});

const visible = computed(() =>
  showAll.value ? matching.value : matching.value.slice(0, PAGE),
);
const hasMore = computed(() => !showAll.value && matching.value.length > PAGE);

function setFilter(value: string): void {
  filter.value = value as Filter;
}

function shows(kind: Kind): boolean {
  return filter.value === "all" || filter.value === kind;
}
</script>

<template>
  <div class="changelog">
    <header class="head">
      <p class="eyebrow">Driftbox</p>
      <h2 class="title">Changelog</h2>
      <p class="lead">
        New features, improvements and fixes. We ship every two weeks.
      </p>
      <div class="head-actions">
        <SoneButton
          :variant="subscribed ? 'outline' : 'default'"
          size="sm"
          type="button"
          :aria-pressed="subscribed"
          @click="subscribed = !subscribed"
        >
          <SoneIcon :icon="subscribed ? 'check' : 'bell-plus'" />
          {{ subscribed ? "Subscribed" : "Subscribe to updates" }}
        </SoneButton>
        <SoneCopyButton
          variant="ghost"
          label="Copy RSS link"
          copied-label="RSS link copied"
          value="https://driftbox.dev/changelog.rss"
        />
      </div>
    </header>

    <div class="toolbar">
      <SoneSegmented
        size="sm"
        aria-label="Show changes"
        :options="filters"
        :model-value="filter"
        @update:model-value="setFilter"
      />
      <p class="count" role="status">
        {{ visible.length }} {{ visible.length === 1 ? "release" : "releases" }}
      </p>
    </div>

    <ol class="timeline">
      <li
        v-for="r in visible"
        :key="r.version"
        class="release"
        :data-latest="r === latest ? '' : undefined"
      >
        <div class="when">
          <span class="version">v{{ r.version }}</span>
          <time :datetime="r.date">{{ r.dateLabel }}</time>
          <SoneBadge v-if="r === latest" variant="secondary">Latest</SoneBadge>
        </div>
        <span class="dot" aria-hidden="true"></span>
        <article class="body" :aria-labelledby="'rel-' + r.version">
          <h3 :id="'rel-' + r.version" class="release-title">
            <span class="sr-only">v{{ r.version }}: </span>{{ r.title }}
          </h3>
          <p class="summary">{{ r.summary }}</p>
          <SoneAlert
            v-if="r.breaking && filter === 'all'"
            variant="warning"
            role="note"
          >
            <SoneIcon icon="alert-circle" />
            <SoneAlertTitle>Breaking change</SoneAlertTitle>
            <SoneAlertDescription>{{ r.breaking }}</SoneAlertDescription>
          </SoneAlert>
          <template v-for="k in KINDS" :key="k.id">
            <div v-if="shows(k.id) && r.changes[k.id]" class="group">
              <h4 class="group-title">
                <SoneBadge :variant="k.variant">{{ k.label }}</SoneBadge>
              </h4>
              <ul class="changes">
                <li v-for="c in r.changes[k.id]" :key="c">{{ c }}</li>
              </ul>
            </div>
          </template>
        </article>
      </li>
      <li v-if="visible.length === 0" class="empty">
        No releases with this kind of change.
      </li>
    </ol>

    <div v-if="hasMore" class="more">
      <SoneButton
        variant="outline"
        size="sm"
        type="button"
        @click="showAll = true"
      >
        <SoneIcon icon="chevrons-down" /> Show older releases
      </SoneButton>
    </div>
  </div>
</template>

<style scoped>
.changelog {
  display: block;
  container-type: inline-size;
  padding: var(--space-8) var(--space-6);
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
.head,
.toolbar,
.timeline,
.more {
  max-width: 52rem;
  margin-inline: auto;
}

/* Header */
.head {
  display: grid;
  justify-items: start;
  gap: var(--space-2);
  padding-left: calc(10rem + var(--space-8));
}
.eyebrow {
  margin: 0;
  color: var(--accent-text);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}
.title {
  margin: 0;
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-heading);
  line-height: var(--leading-tight);
}
.lead {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  line-height: var(--leading-relaxed);
}
.head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

/* Filter */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: var(--space-6);
  margin-bottom: var(--space-6);
  padding: var(--space-3) 0 var(--space-3) calc(10rem + var(--space-8));
  border-top: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
}
.count {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-variant-numeric: tabular-nums;
}

/* Timeline: date | rail | notes */
.timeline {
  margin-top: 0;
  margin-bottom: 0;
  padding: 0;
  list-style: none;
}
.release {
  position: relative;
  display: grid;
  grid-template-columns: 10rem var(--space-8) minmax(0, 1fr);
  padding-bottom: var(--space-8);
}
/* The rail: a line through every dot, stopping at the last one. */
.release::before {
  content: "";
  position: absolute;
  top: var(--space-2);
  bottom: 0;
  left: calc(10rem + var(--space-4) - 0.5px);
  width: 1px;
  background: var(--border);
}
.release:last-child::before {
  display: none;
}
.when {
  display: grid;
  justify-items: end;
  align-content: start;
  gap: var(--space-1);
  padding-top: var(--space-px);
  text-align: right;
}
.version {
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}
time {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
.dot {
  position: relative;
  justify-self: center;
  width: 0.75rem;
  height: 0.75rem;
  margin-top: var(--space-1);
  border: 2px solid var(--border-strong);
  border-radius: var(--radius-pill);
  background: var(--surface-base);
}
.release[data-latest] .dot {
  border-color: var(--accent);
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}
.body {
  display: grid;
  gap: var(--space-4);
  min-width: 0;
}
.release-title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-heading);
  line-height: var(--leading-snug);
}
.summary {
  margin: calc(var(--space-2) * -1) 0 0;
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}
.group {
  display: grid;
  gap: var(--space-2);
}
.group-title {
  margin: 0;
  font-size: inherit;
  font-weight: inherit;
}
.changes {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding-left: var(--space-5);
  line-height: var(--leading-relaxed);
}
.changes li::marker {
  color: var(--text-tertiary);
}
.empty {
  padding: var(--space-6) 0 var(--space-6) calc(10rem + var(--space-8));
  color: var(--text-secondary);
}
.more {
  display: flex;
  padding-left: calc(10rem + var(--space-8));
}

/* Narrow: version and date move above each release, the rail to the edge. */
@container (max-width: 640px) {
  .head,
  .toolbar,
  .empty,
  .more {
    padding-left: 0;
  }
  .title {
    font-size: var(--font-size-2xl);
  }
  .release {
    grid-template-columns: var(--space-6) minmax(0, 1fr);
    grid-template-areas:
      "dot when"
      ". body";
    row-gap: var(--space-2);
  }
  .release::before {
    left: calc(var(--space-3) - 0.5px);
  }
  .when {
    grid-area: when;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    text-align: left;
  }
  .dot {
    grid-area: dot;
    justify-self: start;
    margin-top: var(--space-1);
    margin-left: calc(var(--space-3) - 0.375rem);
  }
  .body {
    grid-area: body;
  }
}
@media (max-width: 640px) {
  .changelog {
    padding: var(--space-6) var(--space-4);
  }
}
</style>
