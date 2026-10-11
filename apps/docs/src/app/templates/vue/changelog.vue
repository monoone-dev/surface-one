<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
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

import { type Kind, type Filter, PAGE } from "../data/changelog";

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

/** The release being read, highlighted in the versions list. */
const active = ref(RELEASES[0].version);
const root = ref<HTMLElement | null>(null);
/** Set while a jump scrolls, so the releases passed on the way are not highlighted. */
let jumping = false;

/** Scrolls to a release, showing older ones first if it is hidden. */
async function jump(version: string, event: Event): Promise<void> {
  event.preventDefault();
  if (!visible.value.some((r) => r.version === version)) {
    showAll.value = true;
    await nextTick();
  }
  const heading = root.value?.querySelector<HTMLElement>(
    `[id="rel-${version}"]`,
  );
  if (!heading) return;
  const reduce = heading.ownerDocument.defaultView?.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  heading.scrollIntoView({
    behavior: reduce ? "auto" : "smooth",
    block: "start",
  });
  heading.focus({ preventScroll: true });
  active.value = version;
  jumping = true;
  const done = () => (jumping = false);
  heading.ownerDocument.addEventListener("scrollend", done, {
    once: true,
    capture: true,
  });
  setTimeout(done, 1000);
}

// Browser only: follow the scroll, again whenever the shown releases change.
let observer: IntersectionObserver | null = null;
watch(
  [root, visible],
  () => {
    observer?.disconnect();
    if (typeof IntersectionObserver === "undefined" || !root.value) return;
    observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        const version = (hit?.target as HTMLElement | undefined)?.dataset
          .version;
        if (version && !jumping) active.value = version;
      },
      { rootMargin: "0px 0px -70% 0px" },
    );
    root.value
      .querySelectorAll(".release")
      .forEach((el) => observer?.observe(el));
  },
  { flush: "post" },
);
onBeforeUnmount(() => observer?.disconnect());

function setFilter(value: string): void {
  filter.value = value as Filter;
}

function shows(kind: Kind): boolean {
  return filter.value === "all" || filter.value === kind;
}
</script>

<template>
  <div ref="root" class="changelog">
    <div class="layout">
      <nav class="versions" aria-labelledby="versions-title">
        <p id="versions-title" class="versions-title">Versions</p>
        <ol class="versions-list">
          <li v-for="r in matching" :key="r.version">
            <a
              class="version-link"
              :href="'#rel-' + r.version"
              :aria-current="active === r.version ? 'location' : undefined"
              @click="jump(r.version, $event)"
            >
              <span class="version-num">v{{ r.version }}</span>
              <time class="version-date" :datetime="r.date">{{
                r.dateLabel
              }}</time>
            </a>
          </li>
        </ol>
      </nav>

      <div class="main">
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
            {{ visible.length }}
            {{ visible.length === 1 ? "release" : "releases" }}
          </p>
        </div>

        <ol class="timeline">
          <li
            v-for="r in visible"
            :key="r.version"
            class="release"
            :data-version="r.version"
            :data-latest="r === latest ? '' : undefined"
          >
            <div class="when">
              <span class="version">v{{ r.version }}</span>
              <time :datetime="r.date">{{ r.dateLabel }}</time>
              <SoneBadge v-if="r === latest" variant="secondary"
                >Latest</SoneBadge
              >
            </div>
            <span class="dot" aria-hidden="true"></span>
            <article class="body" :aria-labelledby="'rel-' + r.version">
              <h3 :id="'rel-' + r.version" class="release-title" tabindex="-1">
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
    </div>
  </div>
</template>

<style scoped src="../styles/changelog.css"></style>
