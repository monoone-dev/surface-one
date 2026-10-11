"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  SoneAlert,
  SoneAlertAction,
  SoneAlertDescription,
  SoneAlertTitle,
  SoneBadge,
  SoneButton,
  SoneChoiceCard,
  SoneChoiceCardDescription,
  SoneChoiceCardIndicator,
  SoneChoiceCardTitle,
  SoneChoiceGroup,
  SoneField,
  SoneFieldContent,
  SoneFieldDescription,
  SoneFieldError,
  SoneFieldGroup,
  SoneFieldLabel,
  SoneFieldLegend,
  SoneFieldSet,
  SoneInputGroup,
  SoneInputGroupAddon,
  SoneInputGroupInput,
  SoneInputGroupText,
  SonePageHeader,
  SonePageHeaderContent,
  SonePageHeaderDescription,
  SonePageHeaderEyebrow,
  SonePageHeaderTitle,
  SoneSelect,
} from "@surface-one/react";

import { SERVICES, SIZES } from "../data/form";

const ROLES = [
  "Founder",
  "Product manager",
  "Designer",
  "Engineer",
  "Other",
] as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[\d\s()-]{7,20}$/;
const WEBSITE = /^https?:\/\/[^\s.]+\.\S+$/;

/** The form's starting values; Clear and "Start another" go back to them. */
function initial() {
  return {
    contact: { name: "", email: "", company: "", phone: "", role: "" },
    project: {
      title: "",
      budget: "",
      start: "",
      deadline: "",
      size: "medium",
      services: Object.fromEntries(
        SERVICES.map((s) => [s.id, s.id === "design"]),
      ) as Record<string, boolean>,
      brief: "",
      website: "",
    },
    consent: false,
    nda: false,
  };
}

type FormValue = ReturnType<typeof initial>;
type Contact = FormValue["contact"];
type Project = FormValue["project"];

/** Field paths in page order, with the id of the element an error link focuses. */
const FIELDS = [
  { path: "contact.name", id: "form-name" },
  { path: "contact.email", id: "form-email" },
  { path: "contact.company", id: "form-company" },
  { path: "contact.phone", id: "form-phone" },
  { path: "contact.role", id: "form-role" },
  { path: "project.title", id: "form-title" },
  { path: "project.budget", id: "form-budget" },
  { path: "project.dates.start", id: "form-start" },
  { path: "project.dates.deadline", id: "form-deadline" },
  { path: "project.dates", id: "form-deadline" },
  { path: "project.services", id: "form-service-research" },
  { path: "project.brief", id: "form-brief" },
  { path: "project.website", id: "form-website" },
  { path: "consent", id: "form-consent-check" },
] as const;

type Path = (typeof FIELDS)[number]["path"];

/** The message for every invalid field (null when it is valid). */
function validate(form: FormValue): Record<Path, string | null> {
  const { contact: c, project: p, consent } = form;
  const brief = p.brief.length;
  return {
    "contact.name": !c.name
      ? "Enter your full name."
      : c.name.length < 2
        ? "Enter at least 2 characters."
        : null,
    "contact.email": !c.email
      ? "Enter your work email."
      : EMAIL.test(c.email)
        ? null
        : "Enter an email address like ada@example.com.",
    "contact.company": c.company ? null : "Enter your company.",
    "contact.phone":
      c.phone && !PHONE.test(c.phone)
        ? "Enter a phone number with digits only, such as +48 600 000 000."
        : null,
    "contact.role": c.role ? null : "Enter your role.",
    "project.title": !p.title
      ? "Enter a project name."
      : p.title.length > 60
        ? "Keep it under 60 characters."
        : null,
    "project.budget":
      p.budget === ""
        ? "Enter a budget."
        : Number(p.budget) < 5000
          ? "The budget must be at least €5,000."
          : null,
    "project.dates.start": p.start ? null : "Enter a start date.",
    "project.dates.deadline": p.deadline ? null : "Enter a deadline.",
    // The deadline must come after the start date.
    "project.dates":
      p.start && p.deadline && p.deadline <= p.start
        ? "The deadline must be after the start date."
        : null,
    // At least one checkbox of the group is ticked.
    "project.services": Object.values(p.services).some(Boolean)
      ? null
      : "Choose at least one service.",
    "project.brief": !brief
      ? "Enter a brief."
      : brief < 40
        ? `Write at least 40 characters (${brief} so far).`
        : brief > 500
          ? "Keep it under 500 characters."
          : null,
    "project.website":
      p.website && !WEBSITE.test(p.website)
        ? "Enter a full address that starts with https://."
        : null,
    consent: consent ? null : "Allow us to store your details so we can reply.",
  };
}

const css = `
.tpl-form.request {
  display: block;
  padding: var(--space-6);
}
.tpl-form .summary {
  margin-bottom: var(--space-5);
}
.tpl-form .summary-list {
  margin: var(--space-1) 0 0;
  padding-left: var(--space-5);
}
.tpl-form .summary-list a {
  color: inherit;
  text-underline-offset: 2px;
}
.tpl-form .section {
  display: grid;
  grid-template-columns: minmax(0, 14rem) minmax(0, 1fr);
  gap: var(--space-6);
  padding: var(--space-6) 0;
  border-top: var(--border-width-thin) solid var(--border-subtle);
}
.tpl-form .section-intro h3 {
  margin: 0 0 var(--space-1);
  color: var(--text-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}
.tpl-form .section-intro p {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--leading-sm);
}
.tpl-form .section-body {
  max-width: 38rem;
}
.tpl-form .form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}
.tpl-form .choices {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
}
.tpl-form .services {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.tpl-form .label-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
}
.tpl-form .counter {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  font-variant-numeric: tabular-nums;
}
.tpl-form .counter.over {
  color: var(--danger-text);
}
.tpl-form .actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  padding-top: var(--space-5);
  border-top: var(--border-width-thin) solid var(--border-subtle);
}
.tpl-form .spacer {
  flex: 1 1 auto;
}
@media (max-width: 720px) {
  .tpl-form.request {
    padding: var(--space-4);
  }
  .tpl-form .section {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-4);
  }
  .tpl-form .form-row,
  .tpl-form .choices,
  .tpl-form .services {
    grid-template-columns: minmax(0, 1fr);
  }
}
`;

export default function FormTemplate() {
  const [form, setForm] = useState(initial);
  const [touched, setTouched] = useState<Partial<Record<Path, boolean>>>({});
  const [dirty, setDirty] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);
  const [firstName, setFirstName] = useState("");
  /** Bumped by a failed submit: the error summary takes focus once it renders. */
  const [attempt, setAttempt] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const summary = useRef<HTMLDivElement>(null);

  const messages = validate(form);
  const errors = FIELDS.filter((f) => messages[f.path]).map((f) => ({
    id: f.id,
    message: messages[f.path]!,
  }));

  useEffect(() => {
    if (attempt) summary.current?.focus();
  }, [attempt]);

  /** Show a field's error once it was touched (blurred) or the form was submitted. */
  const show = (path: Path): boolean =>
    !!messages[path] && (!!touched[path] || submitted);

  function touch(...paths: Path[]): void {
    setTouched((t) => ({
      ...t,
      ...Object.fromEntries(paths.map((p) => [p, true])),
    }));
  }

  function setContact<K extends keyof Contact>(key: K, value: Contact[K]) {
    setForm((f) => ({ ...f, contact: { ...f.contact, [key]: value } }));
  }

  function setProject<K extends keyof Project>(key: K, value: Project[K]) {
    setForm((f) => ({ ...f, project: { ...f.project, [key]: value } }));
  }

  function setService(id: string, on: boolean): void {
    setForm((f) => ({
      ...f,
      project: { ...f.project, services: { ...f.project.services, [id]: on } },
    }));
  }

  function pickSize(id: string): void {
    setProject("size", id);
    setDirty(true);
  }

  function focusField(id: string): void {
    root.current?.querySelector<HTMLElement>(`#${id}`)?.focus();
  }

  function submit(event: FormEvent): void {
    event.preventDefault();
    setSubmitted(true);
    if (errors.length) {
      setAttempt((n) => n + 1);
      return;
    }
    setFirstName(form.contact.name.split(" ")[0] ?? "");
    setSent(true);
  }

  function reset(): void {
    setForm(initial());
    setTouched({});
    setDirty(false);
    setSubmitted(false);
    setSent(false);
  }

  return (
    <div ref={root} className="tpl-form request">
      <style>{css}</style>
      <SonePageHeader as="div">
        <SonePageHeaderContent>
          <SonePageHeaderEyebrow>Northwind Studio</SonePageHeaderEyebrow>
          <SonePageHeaderTitle as="h2">Start a project</SonePageHeaderTitle>
          <SonePageHeaderDescription>
            Tell us about the work. Fields marked{" "}
            <span aria-hidden="true">*</span>
            <span className="sr-only">required</span> are required; we reply
            within two working days.
          </SonePageHeaderDescription>
        </SonePageHeaderContent>
      </SonePageHeader>

      {sent ? (
        <SoneAlert variant="success" role="status" className="summary">
          <SoneAlertTitle>
            Request sent — thank you, {firstName}!
          </SoneAlertTitle>
          <SoneAlertDescription>
            We emailed a copy to {form.contact.email}.
          </SoneAlertDescription>
          <SoneAlertAction>
            <SoneButton
              variant="outline"
              size="sm"
              type="button"
              onClick={reset}
            >
              Start another
            </SoneButton>
          </SoneAlertAction>
        </SoneAlert>
      ) : null}

      {submitted && errors.length ? (
        <SoneAlert
          ref={summary}
          variant="destructive"
          role="alert"
          tabIndex={-1}
          className="summary"
          aria-labelledby="form-summary-title"
        >
          <SoneAlertTitle id="form-summary-title">
            There{" "}
            {errors.length === 1
              ? "is a problem"
              : `are ${errors.length} problems`}{" "}
            with the request
          </SoneAlertTitle>
          <SoneAlertDescription as="div">
            <ul className="summary-list">
              {errors.map((e) => (
                <li key={e.id}>
                  <a
                    href={`#${e.id}`}
                    onClick={(event) => {
                      event.preventDefault();
                      focusField(e.id);
                    }}
                  >
                    {e.message}
                  </a>
                </li>
              ))}
            </ul>
          </SoneAlertDescription>
        </SoneAlert>
      ) : null}

      <form noValidate onSubmit={submit} onChange={() => setDirty(true)}>
        {/* Contact */}
        <div className="section" role="group" aria-labelledby="form-contact">
          <div className="section-intro">
            <h3 id="form-contact">Contact</h3>
            <p>Who we should talk to about this project.</p>
          </div>
          <SoneFieldGroup className="section-body">
            <div className="form-row">
              <SoneField invalid={show("contact.name")}>
                <SoneFieldLabel htmlFor="form-name">Full name *</SoneFieldLabel>
                <input
                  id="form-name"
                  value={form.contact.name}
                  onChange={(e) => setContact("name", e.target.value)}
                  type="text"
                  autoComplete="name"
                  onBlur={() => touch("contact.name")}
                />
                {show("contact.name") ? (
                  <SoneFieldError>{messages["contact.name"]}</SoneFieldError>
                ) : null}
              </SoneField>
              <SoneField invalid={show("contact.email")}>
                <SoneFieldLabel htmlFor="form-email">
                  Work email *
                </SoneFieldLabel>
                <input
                  id="form-email"
                  value={form.contact.email}
                  onChange={(e) => setContact("email", e.target.value)}
                  type="email"
                  autoComplete="email"
                  onBlur={() => touch("contact.email")}
                />
                {show("contact.email") ? (
                  <SoneFieldError>{messages["contact.email"]}</SoneFieldError>
                ) : null}
              </SoneField>
            </div>
            <div className="form-row">
              <SoneField invalid={show("contact.company")}>
                <SoneFieldLabel htmlFor="form-company">
                  Company *
                </SoneFieldLabel>
                <input
                  id="form-company"
                  value={form.contact.company}
                  onChange={(e) => setContact("company", e.target.value)}
                  type="text"
                  autoComplete="organization"
                  onBlur={() => touch("contact.company")}
                />
                {show("contact.company") ? (
                  <SoneFieldError>{messages["contact.company"]}</SoneFieldError>
                ) : null}
              </SoneField>
              <SoneField invalid={show("contact.phone")}>
                <SoneFieldLabel htmlFor="form-phone">Phone</SoneFieldLabel>
                <input
                  id="form-phone"
                  value={form.contact.phone}
                  onChange={(e) => setContact("phone", e.target.value)}
                  type="tel"
                  autoComplete="tel"
                  placeholder="+48 600 000 000"
                  onBlur={() => touch("contact.phone")}
                />
                {show("contact.phone") ? (
                  <SoneFieldError>{messages["contact.phone"]}</SoneFieldError>
                ) : (
                  <SoneFieldDescription>
                    Optional — for a quick call.
                  </SoneFieldDescription>
                )}
              </SoneField>
            </div>
            <SoneField invalid={show("contact.role")}>
              <SoneFieldLabel htmlFor="form-role">Your role *</SoneFieldLabel>
              <SoneSelect
                value={form.contact.role}
                onValueChange={(role) => setContact("role", role)}
                selectId="form-role"
                invalid={show("contact.role")}
                onBlur={() => touch("contact.role")}
              >
                <option value="" disabled>
                  Choose a role
                </option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </SoneSelect>
              {show("contact.role") ? (
                <SoneFieldError>{messages["contact.role"]}</SoneFieldError>
              ) : null}
            </SoneField>
          </SoneFieldGroup>
        </div>

        {/* Project */}
        <div className="section" role="group" aria-labelledby="form-project">
          <div className="section-intro">
            <h3 id="form-project">Project</h3>
            <p>The goal, the budget and the dates you have in mind.</p>
          </div>
          <SoneFieldGroup className="section-body">
            <SoneField invalid={show("project.title")}>
              <SoneFieldLabel htmlFor="form-title">
                Project name *
              </SoneFieldLabel>
              <input
                id="form-title"
                value={form.project.title}
                onChange={(e) => setProject("title", e.target.value)}
                type="text"
                onBlur={() => touch("project.title")}
              />
              {show("project.title") ? (
                <SoneFieldError>{messages["project.title"]}</SoneFieldError>
              ) : null}
            </SoneField>
            <SoneField invalid={show("project.budget")}>
              <SoneFieldLabel htmlFor="form-budget">Budget *</SoneFieldLabel>
              <SoneInputGroup invalid={show("project.budget")}>
                <SoneInputGroupAddon as="span">
                  <SoneInputGroupText>€</SoneInputGroupText>
                </SoneInputGroupAddon>
                <SoneInputGroupInput
                  id="form-budget"
                  value={form.project.budget}
                  onValueChange={(budget) => setProject("budget", budget)}
                  type="number"
                  inputMode="numeric"
                  min="5000"
                  step="1000"
                  onBlur={() => touch("project.budget")}
                />
                <SoneInputGroupAddon as="span" align="inline-end">
                  <SoneInputGroupText>EUR</SoneInputGroupText>
                </SoneInputGroupAddon>
              </SoneInputGroup>
              {show("project.budget") ? (
                <SoneFieldError>{messages["project.budget"]}</SoneFieldError>
              ) : (
                <SoneFieldDescription>
                  Projects start at €5,000.
                </SoneFieldDescription>
              )}
            </SoneField>
            <div className="form-row">
              <SoneField invalid={show("project.dates.start")}>
                <SoneFieldLabel htmlFor="form-start">
                  Start date *
                </SoneFieldLabel>
                <input
                  id="form-start"
                  value={form.project.start}
                  onChange={(e) => setProject("start", e.target.value)}
                  type="date"
                  onBlur={() => touch("project.dates.start", "project.dates")}
                />
                {show("project.dates.start") ? (
                  <SoneFieldError>
                    {messages["project.dates.start"]}
                  </SoneFieldError>
                ) : null}
              </SoneField>
              <SoneField
                invalid={
                  show("project.dates.deadline") || show("project.dates")
                }
              >
                <SoneFieldLabel htmlFor="form-deadline">
                  Deadline *
                </SoneFieldLabel>
                <input
                  id="form-deadline"
                  value={form.project.deadline}
                  onChange={(e) => setProject("deadline", e.target.value)}
                  type="date"
                  onBlur={() =>
                    touch("project.dates.deadline", "project.dates")
                  }
                />
                {show("project.dates.deadline") ? (
                  <SoneFieldError>
                    {messages["project.dates.deadline"]}
                  </SoneFieldError>
                ) : show("project.dates") ? (
                  <SoneFieldError>{messages["project.dates"]}</SoneFieldError>
                ) : null}
              </SoneField>
            </div>
            <SoneField aria-labelledby="form-size-label">
              <SoneFieldLabel as="span" id="form-size-label">
                People who will use it
              </SoneFieldLabel>
              <SoneChoiceGroup
                className="choices"
                aria-labelledby="form-size-label"
              >
                {SIZES.map((s) => (
                  <SoneChoiceCard
                    key={s.id}
                    type="button"
                    selected={form.project.size === s.id}
                    onClick={() => pickSize(s.id)}
                  >
                    <SoneChoiceCardTitle>{s.title}</SoneChoiceCardTitle>
                    <SoneChoiceCardDescription>
                      {s.copy}
                    </SoneChoiceCardDescription>
                    <SoneChoiceCardIndicator />
                  </SoneChoiceCard>
                ))}
              </SoneChoiceGroup>
            </SoneField>
            <SoneFieldSet
              aria-describedby={
                show("project.services") ? "form-services-error" : undefined
              }
            >
              <SoneFieldLegend variant="label" id="form-services">
                Services you need *
              </SoneFieldLegend>
              <SoneFieldGroup variant="choices" className="services">
                {SERVICES.map((s) => (
                  <SoneField key={s.id} orientation="horizontal">
                    <input
                      id={`form-service-${s.id}`}
                      checked={form.project.services[s.id] ?? false}
                      onChange={(e) => setService(s.id, e.target.checked)}
                      type="checkbox"
                      onBlur={() => touch("project.services")}
                    />
                    <SoneFieldLabel htmlFor={`form-service-${s.id}`}>
                      {s.label}
                    </SoneFieldLabel>
                  </SoneField>
                ))}
              </SoneFieldGroup>
              {show("project.services") ? (
                <SoneFieldError id="form-services-error">
                  {messages["project.services"]}
                </SoneFieldError>
              ) : null}
            </SoneFieldSet>
            <SoneField invalid={show("project.brief")}>
              <div className="label-row">
                <SoneFieldLabel htmlFor="form-brief">Brief *</SoneFieldLabel>
                <span
                  className={
                    form.project.brief.length > 500 ? "counter over" : "counter"
                  }
                  aria-hidden="true"
                >
                  {form.project.brief.length} / 500
                </span>
              </div>
              <textarea
                id="form-brief"
                value={form.project.brief}
                onChange={(e) => setProject("brief", e.target.value)}
                rows={5}
                placeholder="What problem are you solving, and for whom?"
                onBlur={() => touch("project.brief")}
              />
              {show("project.brief") ? (
                <SoneFieldError>{messages["project.brief"]}</SoneFieldError>
              ) : (
                <SoneFieldDescription>
                  Between 40 and 500 characters.
                </SoneFieldDescription>
              )}
            </SoneField>
            <SoneField invalid={show("project.website")}>
              <SoneFieldLabel htmlFor="form-website">
                Current website
              </SoneFieldLabel>
              <input
                id="form-website"
                value={form.project.website}
                onChange={(e) => setProject("website", e.target.value)}
                type="url"
                placeholder="https://"
                onBlur={() => touch("project.website")}
              />
              {show("project.website") ? (
                <SoneFieldError>{messages["project.website"]}</SoneFieldError>
              ) : null}
            </SoneField>
          </SoneFieldGroup>
        </div>

        {/* Consent */}
        <div className="section" role="group" aria-labelledby="form-consent">
          <div className="section-intro">
            <h3 id="form-consent">Consent</h3>
            <p>How we may use the details above.</p>
          </div>
          <SoneFieldGroup className="section-body" variant="choices">
            <SoneField orientation="horizontal" invalid={show("consent")}>
              <input
                id="form-consent-check"
                checked={form.consent}
                onChange={(e) =>
                  setForm((f) => ({ ...f, consent: e.target.checked }))
                }
                type="checkbox"
                onBlur={() => touch("consent")}
              />
              <SoneFieldContent>
                <SoneFieldLabel htmlFor="form-consent-check">
                  Northwind may store these details to answer my request *
                </SoneFieldLabel>
                {show("consent") ? (
                  <SoneFieldError>{messages.consent}</SoneFieldError>
                ) : null}
              </SoneFieldContent>
            </SoneField>
            <SoneField orientation="horizontal">
              <input
                id="form-nda"
                checked={form.nda}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nda: e.target.checked }))
                }
                type="checkbox"
              />
              <SoneFieldContent>
                <SoneFieldLabel htmlFor="form-nda">
                  Send me an NDA before the first call
                </SoneFieldLabel>
                <SoneFieldDescription>
                  We sign before you share anything confidential.
                </SoneFieldDescription>
              </SoneFieldContent>
            </SoneField>
          </SoneFieldGroup>
        </div>

        <div className="actions">
          {dirty && !sent ? (
            <SoneBadge variant="secondary">Draft</SoneBadge>
          ) : null}
          <span className="spacer" />
          <SoneButton variant="ghost" type="button" onClick={reset}>
            Clear
          </SoneButton>
          <SoneButton type="submit">Send request</SoneButton>
        </div>
      </form>
    </div>
  );
}
