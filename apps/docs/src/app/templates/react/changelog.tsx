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

import { type Kind, type Filter, PAGE } from "../data/changelog";

// The shared stylesheet (../styles/changelog.css + changelog.twins.css), prefixed with .tpl-changelog.
import { css } from "../styles/scoped/changelog.generated";

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

const latest = RELEASES[0]!;
const filters: readonly SegmentOption[] = [
  { value: "all", label: "All" },
  { value: "added", label: "Features" },
  { value: "improved", label: "Improvements" },
  { value: "fixed", label: "Fixes" },
];

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
