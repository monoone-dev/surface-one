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

// The shared stylesheet (../styles/documentation.css + documentation.twins.css), prefixed with .tpl-documentation.
import { css } from "../styles/scoped/documentation.generated";

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
