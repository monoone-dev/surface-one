"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { flushSync } from "react-dom";
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
} from "@surface-one/react";

type Kind = "added" | "improved" | "fixed";
type Filter = "all" | Kind;

interface Release {
  readonly version: string;
  /** ISO date for `<time dateTime>`. */
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

const latest = RELEASES[0]!;
const filters: readonly SegmentOption[] = [
  { value: "all", label: "All" },
  { value: "added", label: "Features" },
  { value: "improved", label: "Improvements" },
  { value: "fixed", label: "Fixes" },
];

const css = `
.tpl-changelog.changelog {
  --changelog-rail: 10rem; /* the timeline's date column */
  display: block;
  container-type: inline-size;
  padding: var(--space-8) var(--space-6);
  color: var(--text-primary);
}
.tpl-changelog .sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
/* Layout: versions | releases */
.tpl-changelog .layout {
  display: grid;
  grid-template-columns: 10rem minmax(0, 1fr);
  align-items: start;
  gap: var(--space-8);
  max-width: 64rem;
  margin-inline: auto;
}
.tpl-changelog .main {
  min-width: 0;
}

/* Versions: jump to a release without scrolling */
.tpl-changelog .versions {
  position: sticky;
  top: var(--space-4);
  display: grid;
  gap: var(--space-2);
  max-height: calc(100vh - var(--space-8));
  overflow-y: auto;
}
.tpl-changelog .versions-title {
  margin: 0;
  padding-left: var(--space-3);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}
.tpl-changelog .versions-list {
  display: grid;
  margin: 0;
  padding: 0;
  border-left: var(--border-width-thin) solid var(--border-subtle);
  list-style: none;
}
.tpl-changelog .version-link {
  display: grid;
  margin-left: calc(var(--space-px) * -1);
  padding: var(--space-1) var(--space-3);
  border-left: 2px solid transparent;
  color: var(--text-secondary);
  text-decoration: none;
}
.tpl-changelog .version-link:hover {
  color: var(--text-primary);
}
.tpl-changelog .version-link[aria-current="location"] {
  border-left-color: var(--accent);
  color: var(--accent-text);
}
.tpl-changelog .version-num {
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}
.tpl-changelog .version-date {
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
}

/* Header */
.tpl-changelog .head {
  display: grid;
  justify-items: start;
  gap: var(--space-2);
  padding-left: calc(var(--changelog-rail) + var(--space-8));
}
.tpl-changelog .eyebrow {
  margin: 0;
  color: var(--accent-text);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}
.tpl-changelog .title {
  margin: 0;
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-heading);
  line-height: var(--leading-tight);
}
.tpl-changelog .lead {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  line-height: var(--leading-relaxed);
}
.tpl-changelog .head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

/* Filter */
.tpl-changelog .toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: var(--space-6);
  margin-bottom: var(--space-6);
  padding: var(--space-3) 0 var(--space-3) calc(var(--changelog-rail) + var(--space-8));
  border-top: var(--border-width-thin) solid var(--border-subtle);
  border-bottom: var(--border-width-thin) solid var(--border-subtle);
}
.tpl-changelog .count {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-variant-numeric: tabular-nums;
}

/* Timeline: date | rail | notes */
.tpl-changelog .timeline {
  margin-top: 0;
  margin-bottom: 0;
  padding: 0;
  list-style: none;
}
.tpl-changelog .release {
  position: relative;
  display: grid;
  grid-template-columns: var(--changelog-rail) var(--space-8) minmax(0, 1fr);
  padding-bottom: var(--space-8);
}
/* The rail: a line through every dot, stopping at the last one. */
.tpl-changelog .release::before {
  content: "";
  position: absolute;
  top: var(--space-2);
  bottom: 0;
  left: calc(var(--changelog-rail) + var(--space-4) - 0.5px);
  width: 1px;
  background: var(--border);
}
.tpl-changelog .release:last-child::before {
  display: none;
}
.tpl-changelog .when {
  display: grid;
  justify-items: end;
  align-content: start;
  gap: var(--space-1);
  padding-top: var(--space-px);
  text-align: right;
}
.tpl-changelog .version {
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}
.tpl-changelog time {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
.tpl-changelog .dot {
  position: relative;
  justify-self: center;
  width: 0.75rem;
  height: 0.75rem;
  margin-top: var(--space-1);
  border: 2px solid var(--border-strong);
  border-radius: var(--radius-pill);
  background: var(--surface-base);
}
.tpl-changelog .release[data-latest] .dot {
  border-color: var(--accent);
  background: var(--accent);
  /* stylelint-disable-next-line declaration-property-unit-disallowed-list -- a soft 4px glow marks the latest release, wider than a focus ring */
  box-shadow: 0 0 0 4px var(--accent-soft);
}
.tpl-changelog .body {
  display: grid;
  gap: var(--space-4);
  min-width: 0;
}
.tpl-changelog .release-title {
  margin: 0;
  scroll-margin-top: var(--space-6);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-heading);
  line-height: var(--leading-snug);
}
.tpl-changelog .release-title:focus {
  outline: none;
}
.tpl-changelog .summary {
  margin: calc(var(--space-2) * -1) 0 0;
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}
.tpl-changelog .group {
  display: grid;
  gap: var(--space-2);
}
.tpl-changelog .group-title {
  margin: 0;
  font-size: inherit;
  font-weight: inherit;
}
.tpl-changelog .changes {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding-left: var(--space-5);
  line-height: var(--leading-relaxed);
}
.tpl-changelog .changes li::marker {
  color: var(--text-tertiary);
}
.tpl-changelog .empty {
  padding: var(--space-6) 0 var(--space-6) calc(var(--changelog-rail) + var(--space-8));
  color: var(--text-secondary);
}
.tpl-changelog .more {
  display: flex;
  padding-left: calc(var(--changelog-rail) + var(--space-8));
}

/* Medium: the versions become a scrollable row above the releases. */
@container (max-width: 960px) {
  .tpl-changelog .layout {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-6);
  }
  .tpl-changelog .versions {
    position: static;
    max-height: none;
    order: 1;
  }
  .tpl-changelog .main {
    display: contents;
  }
  .tpl-changelog .head {
    order: 0;
  }
  .tpl-changelog .toolbar,
  .tpl-changelog .timeline,
  .tpl-changelog .more {
    order: 2;
  }
  .tpl-changelog .versions-title {
    padding-left: 0;
  }
  .tpl-changelog .versions-list {
    display: flex;
    gap: var(--space-1);
    overflow-x: auto;
    border-left: 0;
    border-bottom: var(--border-width-thin) solid var(--border-subtle);
  }
  .tpl-changelog .version-link {
    margin: 0 0 calc(var(--space-px) * -1);
    border-bottom: 2px solid transparent;
    border-left: 0;
    white-space: nowrap;
  }
  .tpl-changelog .version-link[aria-current="location"] {
    border-bottom-color: var(--accent);
  }
}

/* Narrow: version and date move above each release, the rail to the edge. */
@container (max-width: 640px) {
  .tpl-changelog .head,
  .tpl-changelog .toolbar,
  .tpl-changelog .empty,
  .tpl-changelog .more {
    padding-left: 0;
  }
  .tpl-changelog .title {
    font-size: var(--font-size-2xl);
  }
  .tpl-changelog .release {
    grid-template-columns: var(--space-6) minmax(0, 1fr);
    grid-template-areas:
      "dot when"
      ". body";
    row-gap: var(--space-2);
  }
  .tpl-changelog .release::before {
    left: calc(var(--space-3) - 0.5px);
  }
  .tpl-changelog .when {
    grid-area: when;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    text-align: left;
  }
  .tpl-changelog .dot {
    grid-area: dot;
    justify-self: start;
    margin-top: var(--space-1);
    margin-left: calc(var(--space-3) / 2);
  }
  .tpl-changelog .body {
    grid-area: body;
  }
}
@media (max-width: 640px) {
  .tpl-changelog.changelog {
    padding: var(--space-6) var(--space-4);
  }
}
`;

export default function ChangelogTemplate() {
  const [filter, setFilter] = useState<Filter>("all");
  const [subscribed, setSubscribed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  /** Releases with at least one change of the chosen kind. */
  const matching = useMemo(
    () =>
      filter === "all"
        ? RELEASES
        : RELEASES.filter((r) => (r.changes[filter]?.length ?? 0) > 0),
    [filter],
  );
  const visible = useMemo(
    () => (showAll ? matching : matching.slice(0, PAGE)),
    [showAll, matching],
  );
  const hasMore = !showAll && matching.length > PAGE;

  /** The release being read, highlighted in the versions list. */
  const [active, setActive] = useState(latest.version);
  const root = useRef<HTMLDivElement>(null);
  /** Set while a jump scrolls, so the releases passed on the way are not highlighted. */
  const jumping = useRef(false);

  /** Scrolls to a release, showing older ones first if it is hidden. */
  function jump(version: string, event: MouseEvent): void {
    event.preventDefault();
    if (!visible.some((r) => r.version === version)) {
      flushSync(() => setShowAll(true));
    }
    const heading = root.current?.querySelector<HTMLElement>(
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
    setActive(version);
    jumping.current = true;
    const done = () => (jumping.current = false);
    heading.ownerDocument.addEventListener("scrollend", done, {
      once: true,
      capture: true,
    });
    setTimeout(done, 1000);
  }

  // Browser only: follow the scroll, again whenever the shown releases change.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || !root.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        const version = (hit?.target as HTMLElement | undefined)?.dataset[
          "version"
        ];
        if (version && !jumping.current) setActive(version);
      },
      { rootMargin: "0px 0px -70% 0px" },
    );
    root.current
      .querySelectorAll(".release")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [visible]);

  const shows = (kind: Kind): boolean => filter === "all" || filter === kind;

  return (
    <div ref={root} className="tpl-changelog changelog">
      <style>{css}</style>
      <div className="layout">
        <nav className="versions" aria-labelledby="versions-title">
          <p id="versions-title" className="versions-title">
            Versions
          </p>
          <ol className="versions-list">
            {matching.map((r) => (
              <li key={r.version}>
                <a
                  className="version-link"
                  href={`#rel-${r.version}`}
                  aria-current={active === r.version ? "location" : undefined}
                  onClick={(event) => jump(r.version, event)}
                >
                  <span className="version-num">v{r.version}</span>
                  <time className="version-date" dateTime={r.date}>
                    {r.dateLabel}
                  </time>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="main">
          <header className="head">
            <p className="eyebrow">Driftbox</p>
            <h2 className="title">Changelog</h2>
            <p className="lead">
              New features, improvements and fixes. We ship every two weeks.
            </p>
            <div className="head-actions">
              <SoneButton
                variant={subscribed ? "outline" : "default"}
                size="sm"
                type="button"
                aria-pressed={subscribed}
                onClick={() => setSubscribed((on) => !on)}
              >
                <SoneIcon icon={subscribed ? "check" : "bell-plus"} />
                {subscribed ? "Subscribed" : "Subscribe to updates"}
              </SoneButton>
              <SoneCopyButton
                variant="ghost"
                label="Copy RSS link"
                copiedLabel="RSS link copied"
                value="https://driftbox.dev/changelog.rss"
              />
            </div>
          </header>

          <div className="toolbar">
            <SoneSegmented
              size="sm"
              ariaLabel="Show changes"
              options={filters}
              value={filter}
              onValueChange={(value) => setFilter(value as Filter)}
            />
            <p className="count" role="status">
              {visible.length} {visible.length === 1 ? "release" : "releases"}
            </p>
          </div>

          <ol className="timeline">
            {visible.map((r) => (
              <li
                key={r.version}
                className="release"
                data-version={r.version}
                data-latest={r === latest ? "" : undefined}
              >
                <div className="when">
                  <span className="version">v{r.version}</span>
                  <time dateTime={r.date}>{r.dateLabel}</time>
                  {r === latest ? (
                    <SoneBadge variant="secondary">Latest</SoneBadge>
                  ) : null}
                </div>
                <span className="dot" aria-hidden="true" />
                <article className="body" aria-labelledby={`rel-${r.version}`}>
                  <h3
                    id={`rel-${r.version}`}
                    className="release-title"
                    tabIndex={-1}
                  >
                    <span className="sr-only">v{r.version}: </span>
                    {r.title}
                  </h3>
                  <p className="summary">{r.summary}</p>
                  {r.breaking && filter === "all" ? (
                    <SoneAlert variant="warning" role="note">
                      <SoneIcon icon="alert-circle" />
                      <SoneAlertTitle>Breaking change</SoneAlertTitle>
                      <SoneAlertDescription>{r.breaking}</SoneAlertDescription>
                    </SoneAlert>
                  ) : null}
                  {KINDS.map((k) => {
                    const changes = r.changes[k.id];
                    if (!shows(k.id) || !changes) return null;
                    return (
                      <div key={k.id} className="group">
                        <h4 className="group-title">
                          <SoneBadge variant={k.variant}>{k.label}</SoneBadge>
                        </h4>
                        <ul className="changes">
                          {changes.map((c) => (
                            <li key={c}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </article>
              </li>
            ))}
            {visible.length === 0 ? (
              <li className="empty">No releases with this kind of change.</li>
            ) : null}
          </ol>

          {hasMore ? (
            <div className="more">
              <SoneButton
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setShowAll(true)}
              >
                <SoneIcon icon="chevrons-down" /> Show older releases
              </SoneButton>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
