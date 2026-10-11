"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
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
} from "@surface-one/react";

import {
  type Lang,
  CURRENT,
  NAV,
  SECTIONS,
  CODE,
  RETRIES,
  EVENTS,
} from "../data/documentation";

const LANGS: readonly SegmentOption[] = [
  { value: "node", label: "Node.js" },
  { value: "python", label: "Python" },
  { value: "curl", label: "cURL" },
];

/** A link that stays on the page (the demo has no other pages). */
const stay = (event: MouseEvent): void => event.preventDefault();

export default function DocumentationTemplate() {
  const root = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("node");
  const [active, setActive] = useState(SECTIONS[0]!.id);
  const [vote, setVote] = useState<"yes" | "no" | null>(null);

  const code = CODE[lang];

  // The navigation filtered by the search field; empty groups drop out.
  const q = query.trim().toLowerCase();
  const groups = !q
    ? NAV
    : NAV.map((g) => ({
        ...g,
        pages: g.pages.filter((p) => p.label.toLowerCase().includes(q)),
      })).filter((g) => g.pages.length > 0);

  // Browser only: highlight the outline entry of the section being read.
  useEffect(() => {
    const el = root.current;
    if (typeof IntersectionObserver === "undefined" || !el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "0px 0px -70% 0px" },
    );
    for (const s of SECTIONS) {
      const h = el.querySelector(`#${s.id}`);
      if (h) observer.observe(h);
    }
    return () => observer.disconnect();
  }, []);

  /** Scrolls to a section and moves focus to its heading. */
  function jump(id: string, event: MouseEvent): void {
    event.preventDefault();
    const heading = root.current?.querySelector<HTMLElement>(`#${id}`);
    if (!heading) return;
    const reduce = heading.ownerDocument.defaultView?.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    heading.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
    heading.focus({ preventScroll: true });
    setActive(id);
    setOutlineOpen(false);
  }

  return (
    <div ref={root} className="documentation tpl-documentation">
      <style>{css}</style>
      <header className="topbar">
        <span className="brand">
          <span className="brand-mark" aria-hidden="true">
            D
          </span>
          Driftbox <span className="brand-docs">Docs</span>
        </span>
        <SoneBadge variant="outline">v3.4</SoneBadge>
        <SoneButton
          variant="outline"
          size="sm"
          type="button"
          className="menu-toggle"
          aria-controls="doc-nav"
          aria-expanded={navOpen}
          onClick={() => setNavOpen((o) => !o)}
        >
          <SoneIcon icon="sidebar" /> Menu
        </SoneButton>
      </header>

      <div className="layout">
        <nav
          id="doc-nav"
          className="nav"
          aria-label="Documentation"
          data-open={navOpen ? "" : undefined}
        >
          <SoneInputGroup className="nav-search">
            <SoneInputGroupAddon>
              <SoneIcon icon="search" />
            </SoneInputGroupAddon>
            <SoneInputGroupInput
              type="search"
              autoComplete="off"
              placeholder="Search docs"
              aria-label="Search docs"
              value={query}
              onValueChange={setQuery}
            />
          </SoneInputGroup>
          {groups.map((g) => (
            <div key={g.id} className="nav-group">
              <p id={`doc-nav-${g.id}`} className="nav-label">
                {g.label}
              </p>
              <ul aria-labelledby={`doc-nav-${g.id}`}>
                {g.pages.map((p) => (
                  <li key={p.id}>
                    <a
                      className="nav-link"
                      href={`#${p.id}`}
                      aria-current={p.id === CURRENT ? "page" : undefined}
                      onClick={stay}
                    >
                      {p.label}
                      {p.badge && (
                        <SoneBadge variant="secondary">{p.badge}</SoneBadge>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {groups.length === 0 && (
            <p className="nav-empty" role="status">
              No pages match “{query}”.
            </p>
          )}
        </nav>

        <nav className="outline" aria-labelledby="doc-outline-title">
          <p id="doc-outline-title" className="outline-title">
            On this page
          </p>
          <button
            type="button"
            className="outline-toggle"
            aria-controls="doc-outline-list"
            aria-expanded={outlineOpen}
            onClick={() => setOutlineOpen((o) => !o)}
          >
            On this page
            <SoneIcon
              icon="chevron-right"
              size="sm"
              className="outline-caret"
            />
          </button>
          <ol
            id="doc-outline-list"
            className="outline-list"
            data-open={outlineOpen ? "" : undefined}
          >
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  className="outline-link"
                  href={`#${s.id}`}
                  aria-current={active === s.id ? "location" : undefined}
                  onClick={(e) => jump(s.id, e)}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="article" aria-labelledby="doc-title">
          <p className="crumbs">
            <span>Guides</span>
            <SoneIcon icon="chevron-right" size="xs" />
            <span>Webhooks</span>
          </p>
          <h2 id="doc-title" className="title">
            Webhooks
          </h2>
          <p className="lead">
            Get a request on your server the moment something changes in a
            Driftbox workspace — a file syncs, a folder is shared or storage
            runs low — instead of polling the API.
          </p>
          <p className="meta">
            <SoneIcon icon="clock" size="xs" /> 6 min read
            <span aria-hidden="true">·</span> Updated Oct 2, 2026
          </p>

          <section aria-labelledby="doc-how">
            <h3 id="doc-how" tabIndex={-1}>
              How webhooks work
            </h3>
            <p>
              A webhook is an HTTPS endpoint on your server. When an event
              happens, Driftbox sends it a <code>POST</code> request with a JSON
              body describing the event. Your endpoint answers with any{" "}
              <code>2xx</code> status within 10 seconds to confirm delivery.
            </p>
            <p>
              Every request carries a <code>Driftbox-Signature</code> header, so
              you can check that it really came from Driftbox before you act on
              it.
            </p>
          </section>

          <section aria-labelledby="doc-create">
            <h3 id="doc-create" tabIndex={-1}>
              Create an endpoint
            </h3>
            <ol className="steps">
              <li>
                <strong>Add a route.</strong> Accept <code>POST</code> requests
                and keep the raw body — the signature is computed over the exact
                bytes.
              </li>
              <li>
                <strong>Register the URL.</strong> In{" "}
                <em>Settings → Developers → Webhooks</em>, add the URL and pick
                the events you need.
              </li>
              <li>
                <strong>Store the secret.</strong> Copy the signing secret into
                an environment variable such as <code>DRIFTBOX_SECRET</code>.
              </li>
            </ol>

            <figure className="code">
              <figcaption className="code-head">
                <SoneSegmented
                  size="sm"
                  ariaLabel="Language"
                  options={LANGS}
                  value={lang}
                  onValueChange={(value) => setLang(value as Lang)}
                />
                <span className="code-file">{code.file}</span>
                <SoneCopyButton
                  iconOnly
                  variant="ghost"
                  label="Copy code"
                  value={code.source}
                />
              </figcaption>
              <pre
                className="code-body"
                tabIndex={0}
                aria-label={`Code sample, ${code.file}`}
              >
                <code>{code.source}</code>
              </pre>
            </figure>
          </section>

          <section aria-labelledby="doc-verify">
            <h3 id="doc-verify" tabIndex={-1}>
              Verify the signature
            </h3>
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
                Anyone can send a request to a public URL. Reject a request
                whose signature does not match with a <code>400</code> and do
                nothing else.
              </SoneAlertDescription>
            </SoneAlert>
          </section>

          <section aria-labelledby="doc-retries">
            <h3 id="doc-retries" tabIndex={-1}>
              Retries and timeouts
            </h3>
            <p>
              When your endpoint times out or answers with an error, Driftbox
              retries with a growing delay. After the fifth failed retry the
              event is marked as failed and you can replay it from the
              dashboard.
            </p>
            <div className="table-wrap">
              <table className="table">
                <caption className="sr-only">Retry schedule</caption>
                <thead>
                  <tr>
                    <th scope="col">Attempt</th>
                    <th scope="col">Delay after the previous one</th>
                  </tr>
                </thead>
                <tbody>
                  {RETRIES.map((r) => (
                    <tr key={r.attempt}>
                      <td>{r.attempt}</td>
                      <td>{r.delay}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="doc-events">
            <h3 id="doc-events" tabIndex={-1}>
              Event types
            </h3>
            <p>
              Subscribe only to the events you handle. The most common ones:
            </p>
            <dl className="events">
              {EVENTS.map((e) => (
                <div key={e.name}>
                  <dt>
                    <code>{e.name}</code>
                  </dt>
                  <dd>{e.description}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="feedback">
            <p id="doc-feedback">Was this page helpful?</p>
            <div
              className="feedback-actions"
              role="group"
              aria-labelledby="doc-feedback"
            >
              <SoneButton
                variant="outline"
                size="sm"
                type="button"
                aria-pressed={vote === "yes"}
                onClick={() => setVote("yes")}
              >
                <SoneIcon icon="check" /> Yes
              </SoneButton>
              <SoneButton
                variant="outline"
                size="sm"
                type="button"
                aria-pressed={vote === "no"}
                onClick={() => setVote("no")}
              >
                <SoneIcon icon="close" /> No
              </SoneButton>
            </div>
            <p className="feedback-thanks" role="status">
              {vote && "Thanks — your feedback helps us improve the docs."}
            </p>
          </div>

          <nav className="pager" aria-label="Previous and next page">
            <a className="pager-link" href="#uploads" onClick={stay}>
              <span className="pager-hint">
                <SoneIcon icon="arrow-right" size="xs" className="flip" />{" "}
                Previous
              </span>
              <span className="pager-title">Uploading files</span>
            </a>
            <a
              className="pager-link pager-next"
              href="#rate-limits"
              onClick={stay}
            >
              <span className="pager-hint">
                Next <SoneIcon icon="arrow-right" size="xs" />
              </span>
              <span className="pager-title">Rate limits</span>
            </a>
          </nav>
        </article>
      </div>
    </div>
  );
}

const css = `
.tpl-documentation.documentation {
  display: block;
  container-type: inline-size;
  padding: var(--space-6);
  color: var(--text-primary);
}
.tpl-documentation .sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.tpl-documentation code {
  padding: var(--prose-code-padding);
  border: var(--border-width-thin) solid var(--prose-code-border);
  border-radius: var(--radius-sm);
  background: var(--prose-code-bg);
  font-family: var(--font-mono);
  font-size: 0.875em;
}

/* Top bar */
.tpl-documentation .topbar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-bottom: var(--space-4);
  margin-bottom: var(--space-6);
  border-bottom: var(--border-width-thin) solid var(--border-subtle);
}
.tpl-documentation .brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: var(--font-weight-semibold);
}
.tpl-documentation .brand-mark {
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: var(--text-on-accent);
  font-size: var(--font-size-sm);
}
.tpl-documentation .brand-docs {
  color: var(--text-secondary);
  font-weight: var(--font-weight-normal);
}
.tpl-documentation .menu-toggle {
  display: none;
  margin-left: auto;
}

/* Three zones */
.tpl-documentation .layout {
  display: grid;
  grid-template-columns: 14rem minmax(0, 1fr) 12rem;
  grid-template-areas: "nav main outline";
  align-items: start;
  gap: var(--space-8);
}
.tpl-documentation .nav {
  grid-area: nav;
  position: sticky;
  top: var(--space-4);
  display: grid;
  gap: var(--space-5);
}
.tpl-documentation .outline {
  grid-area: outline;
  position: sticky;
  top: var(--space-4);
}
.tpl-documentation .article {
  grid-area: main;
  min-width: 0;
  max-width: 44rem;
}

/* Left navigation */
.tpl-documentation .nav-search {
  width: 100%;
}
.tpl-documentation .nav-group {
  display: grid;
  gap: var(--space-1);
}
.tpl-documentation .nav-label {
  margin: 0;
  padding-inline: var(--space-3);
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
}
.tpl-documentation .nav ul,
.tpl-documentation .outline-list {
  display: grid;
  gap: var(--space-px);
  margin: 0;
  padding: 0;
  list-style: none;
}
.tpl-documentation .nav-link {
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
.tpl-documentation .nav-link:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}
.tpl-documentation .nav-link[aria-current="page"] {
  background: var(--accent-soft);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
  box-shadow: inset var(--border-width-thick) 0 0 var(--accent);
}
.tpl-documentation .nav-link:focus-visible,
.tpl-documentation .outline-link:focus-visible,
.tpl-documentation .pager-link:focus-visible,
.tpl-documentation .outline-toggle:focus-visible,
.tpl-documentation .code-body:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
.tpl-documentation .nav-empty {
  margin: 0;
  padding-inline: var(--space-3);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

/* "On this page" */
.tpl-documentation .outline-title,
.tpl-documentation .outline-toggle {
  margin: 0 0 var(--space-2);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}
.tpl-documentation .outline-toggle {
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
.tpl-documentation .outline-caret {
  transition: transform var(--transition);
}
.tpl-documentation .outline-toggle[aria-expanded="true"] .outline-caret {
  transform: rotate(90deg);
}
.tpl-documentation .outline-list {
  border-left: var(--border-width-thin) solid var(--border-subtle);
}
.tpl-documentation .outline-link {
  display: block;
  margin-left: calc(var(--space-px) * -1);
  padding: var(--space-1) var(--space-3);
  border-left: 2px solid transparent;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--leading-snug);
  text-decoration: none;
}
.tpl-documentation .outline-link:hover {
  color: var(--text-primary);
}
.tpl-documentation .outline-link[aria-current="location"] {
  border-left-color: var(--accent);
  color: var(--accent-text);
  font-weight: var(--font-weight-medium);
}

/* Article */
.tpl-documentation .crumbs {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin: 0 0 var(--space-2);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
.tpl-documentation .title {
  margin: 0;
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-heading);
  line-height: var(--leading-tight);
}
.tpl-documentation .lead {
  margin: var(--space-3) 0 0;
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  line-height: var(--leading-relaxed);
}
.tpl-documentation .meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: var(--space-3) 0 0;
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}
.tpl-documentation .article section {
  margin-top: var(--space-8);
}
.tpl-documentation .article h3 {
  margin: 0 0 var(--space-3);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-heading);
  scroll-margin-top: var(--space-6);
}
.tpl-documentation .article h3:focus {
  outline: none;
}
.tpl-documentation .article section p {
  margin: 0 0 var(--space-3);
  line-height: var(--leading-relaxed);
}
.tpl-documentation .steps {
  display: grid;
  gap: var(--space-3);
  margin: 0 0 var(--space-5);
  padding: 0;
  list-style: none;
  counter-reset: step;
}
.tpl-documentation .steps li {
  position: relative;
  padding-left: var(--space-8);
  line-height: var(--leading-relaxed);
  counter-increment: step;
}
.tpl-documentation .steps li::before {
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
.tpl-documentation .code {
  margin: 0;
  overflow: hidden;
  border: var(--border-width-thin) solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface-raised);
}
.tpl-documentation .code-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-3);
  padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3);
  border-bottom: var(--border-width-thin) solid var(--border-subtle);
}
.tpl-documentation .code-file {
  margin-left: auto;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
}
.tpl-documentation .code-body {
  margin: 0;
  padding: var(--space-4);
  overflow-x: auto;
  background: var(--prose-code-bg);
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  line-height: var(--leading-relaxed);
}
.tpl-documentation .code-body code {
  padding: 0;
  border: 0;
  background: none;
  font-size: inherit;
}

/* Table and events */
.tpl-documentation .table-wrap {
  overflow-x: auto;
  border: var(--border-width-thin) solid var(--border-subtle);
  border-radius: var(--radius-md);
}
.tpl-documentation .table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}
.tpl-documentation .table th,
.tpl-documentation .table td {
  padding: var(--space-2) var(--space-3);
  border-bottom: var(--border-width-thin) solid var(--border-subtle);
  text-align: left;
}
.tpl-documentation .table th {
  background: var(--prose-table-head-bg);
  color: var(--text-secondary);
  font-weight: var(--font-weight-semibold);
}
.tpl-documentation .table tbody tr:last-child td {
  border-bottom: 0;
}
.tpl-documentation .events {
  display: grid;
  gap: var(--space-3);
  margin: 0;
}
.tpl-documentation .events div {
  display: grid;
  grid-template-columns: 10rem minmax(0, 1fr);
  gap: var(--space-3);
  align-items: baseline;
}
.tpl-documentation .events dd {
  margin: 0;
  color: var(--text-secondary);
}

/* Feedback and pager */
.tpl-documentation .feedback {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-8);
  padding-top: var(--space-5);
  border-top: var(--border-width-thin) solid var(--border-subtle);
}
.tpl-documentation .feedback p {
  margin: 0;
  font-weight: var(--font-weight-medium);
}
.tpl-documentation .feedback-actions {
  display: flex;
  gap: var(--space-2);
}
.tpl-documentation .feedback .feedback-thanks {
  flex-basis: 100%;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
}
.tpl-documentation .feedback-thanks:empty {
  display: none;
}
.tpl-documentation .pager {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-top: var(--space-6);
}
.tpl-documentation .pager-link {
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
.tpl-documentation .pager-link:hover {
  border-color: var(--border-strong);
  background: var(--surface-hover);
}
.tpl-documentation .pager-next {
  text-align: right;
}
.tpl-documentation .pager-hint {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
.tpl-documentation .pager-next .pager-hint {
  justify-content: flex-end;
}
.tpl-documentation .pager-title {
  font-weight: var(--font-weight-semibold);
}
.tpl-documentation .flip {
  transform: scaleX(-1);
}

/* Narrower: the outline folds into a disclosure above the article. */
@container (max-width: 1040px) {
  .tpl-documentation .layout {
    grid-template-columns: 13rem minmax(0, 1fr);
    grid-template-areas:
      "nav outline"
      "nav main";
    row-gap: var(--space-5);
  }
  .tpl-documentation .outline {
    position: static;
    max-width: 44rem;
    border: var(--border-width-thin) solid var(--border-subtle);
    border-radius: var(--radius-md);
  }
  .tpl-documentation .outline-title {
    display: none;
  }
  .tpl-documentation .outline-toggle {
    display: flex;
  }
  .tpl-documentation .outline-list {
    margin: 0 var(--space-3) var(--space-3);
  }
  .tpl-documentation .outline-list:not([data-open]) {
    display: none;
  }
}
/* Phone: the navigation hides behind the Menu button. */
@container (max-width: 720px) {
  .tpl-documentation .menu-toggle {
    display: inline-flex;
  }
  .tpl-documentation .layout {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: "nav" "outline" "main";
  }
  .tpl-documentation .nav {
    position: static;
  }
  .tpl-documentation .nav:not([data-open]) {
    display: none;
  }
  .tpl-documentation .title {
    font-size: var(--font-size-2xl);
  }
  .tpl-documentation .events div {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-1);
  }
  .tpl-documentation .pager {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 720px) {
  .tpl-documentation.documentation {
    padding: var(--space-4);
  }
}
@media (prefers-reduced-motion: reduce) {
  .tpl-documentation .nav-link,
  .tpl-documentation .pager-link,
  .tpl-documentation .outline-caret {
    transition: none;
  }
}

`;
