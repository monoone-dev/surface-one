"use client";

import { useState, type FormEvent } from "react";
import {
  SoneAlert,
  SoneAlertDescription,
  SoneAlertTitle,
  SoneAvatar,
  SoneAvatarFallback,
  SoneButton,
  SoneField,
  SoneFieldContent,
  SoneFieldDescription,
  SoneFieldError,
  SoneFieldGroup,
  SoneFieldLabel,
  SoneFieldSeparator,
  SoneFieldSeparatorContent,
  SoneIcon,
  SoneLogo,
  SoneMeter,
  SonePasswordInput,
} from "@surface-one/react";

interface Rule {
  readonly id: string;
  readonly label: string;
  readonly test: (value: string) => boolean;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RULES: readonly Rule[] = [
  {
    id: "length",
    label: "At least 10 characters",
    test: (v) => v.length >= 10,
  },
  {
    id: "case",
    label: "Upper- and lowercase letters",
    test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v),
  },
  { id: "number", label: "At least one number", test: (v) => /\d/.test(v) },
  {
    id: "symbol",
    label: "At least one symbol",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
];

const STRENGTH = ["Too weak", "Weak", "Fair", "Good", "Strong"] as const;

export default function SignupTemplate() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [news, setNews] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [created, setCreated] = useState(false);

  const rules = RULES.map((r) => ({ ...r, met: r.test(password) }));
  const score = rules.filter((r) => r.met).length;
  const strength = password ? STRENGTH[score] : "";
  const emailValue = email.trim();
  const emailError = !emailValue
    ? "Enter your work email."
    : EMAIL.test(emailValue)
      ? null
      : "Enter an email address like ada@example.com.";
  const errorCount = [
    !first.trim(),
    !!emailError,
    score < 4,
    confirm !== password,
    !terms,
  ].filter(Boolean).length;

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setSubmitted(true);
    if (errorCount === 0) setCreated(true);
  }

  function reset(): void {
    setCreated(false);
    setSubmitted(false);
    setEmail("");
  }

  return (
    <div className="split tpl-signup">
      <style>{css}</style>
      <div className="promo">
        <SoneLogo size="sm" label="Northwind" />
        <div className="promo-body">
          <h2>Every meeting, searchable.</h2>
          <ul className="perks">
            <li>
              <SoneIcon icon="check" size="sm" /> Free for teams up to 5
            </li>
            <li>
              <SoneIcon icon="check" size="sm" /> Transcripts in 30 languages
            </li>
            <li>
              <SoneIcon icon="check" size="sm" /> End-to-end encrypted notes
            </li>
          </ul>
        </div>
        <figure className="quote">
          <blockquote>
            “We stopped writing meeting notes by hand in the first week.”
          </blockquote>
          <figcaption>
            <SoneAvatar size="sm" aria-hidden="true">
              <SoneAvatarFallback>MS</SoneAvatarFallback>
            </SoneAvatar>
            <span>Mina Sato · Head of Product, Harbor</span>
          </figcaption>
        </figure>
      </div>

      <div className="panel">
        {created ? (
          <div className="done" role="status">
            <span className="done-mark" aria-hidden="true">
              <SoneIcon icon="check" />
            </span>
            <h2>Check your inbox</h2>
            <p>
              We sent a confirmation link to <strong>{email}</strong>. It
              expires in 24 hours.
            </p>
            <SoneButton variant="outline" type="button" onClick={reset}>
              Use a different email
            </SoneButton>
          </div>
        ) : (
          <>
            <div className="panel-head">
              <h2>Create your account</h2>
              <p>
                Already have one?{" "}
                <a
                  href="#login"
                  className="link"
                  onClick={(e) => e.preventDefault()}
                >
                  Sign in
                </a>
              </p>
            </div>

            <div className="sso" role="group" aria-label="Sign up with">
              <SoneButton variant="outline" type="button">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
                  />
                </svg>
                <span>Google</span>
              </SoneButton>
              <SoneButton variant="outline" type="button">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M16.37 12.6c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.77-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.75 2.28-1.6 2.78-.41 6.9 1.15 9.15.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.78.74 2.99.72 1.24-.02 2.02-1.12 2.77-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.39-.92-2.41-3.68ZM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.02.61-2.67 1.37-.59.68-1.1 1.77-.96 2.81 1.01.08 2.05-.52 2.69-1.29Z"
                  />
                </svg>
                <span>Apple</span>
              </SoneButton>
              <SoneButton variant="outline" type="button">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 1a11 11 0 0 0-3.48 21.44c.55.1.75-.24.75-.53v-1.86c-3.06.66-3.71-1.48-3.71-1.48-.5-1.27-1.22-1.61-1.22-1.61-1-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.69 2.58 1.2 3.2.92.1-.71.39-1.2.7-1.47-2.44-.28-5.01-1.22-5.01-5.44 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.91 0 0 .92-.3 3.02 1.13a10.5 10.5 0 0 1 5.5 0c2.1-1.42 3.02-1.13 3.02-1.13.6 1.51.22 2.63.11 2.91.7.77 1.13 1.75 1.13 2.95 0 4.23-2.58 5.16-5.03 5.43.4.34.75 1.01.75 2.04v3.03c0 .29.2.64.76.53A11 11 0 0 0 12 1Z"
                  />
                </svg>
                <span>GitHub</span>
              </SoneButton>
            </div>

            <SoneFieldSeparator className="divider">
              <SoneFieldSeparatorContent>
                or sign up with email
              </SoneFieldSeparatorContent>
            </SoneFieldSeparator>

            {submitted && errorCount > 0 && (
              <SoneAlert variant="destructive" role="alert" className="notice">
                <SoneAlertTitle>
                  {errorCount}{" "}
                  {errorCount === 1 ? "field needs" : "fields need"} attention
                </SoneAlertTitle>
                <SoneAlertDescription>
                  Fix the highlighted fields below.
                </SoneAlertDescription>
              </SoneAlert>
            )}

            <SoneFieldGroup as="form" noValidate onSubmit={submit}>
              <div className="form-row">
                <SoneField invalid={submitted && !first.trim()}>
                  <SoneFieldLabel htmlFor="signup-first">
                    First name
                  </SoneFieldLabel>
                  <input
                    id="signup-first"
                    type="text"
                    autoComplete="given-name"
                    value={first}
                    onChange={(e) => setFirst(e.target.value)}
                  />
                  {submitted && !first.trim() && (
                    <SoneFieldError>Enter your first name.</SoneFieldError>
                  )}
                </SoneField>
                <SoneField>
                  <SoneFieldLabel htmlFor="signup-last">
                    Last name
                  </SoneFieldLabel>
                  <input
                    id="signup-last"
                    type="text"
                    autoComplete="family-name"
                    value={last}
                    onChange={(e) => setLast(e.target.value)}
                  />
                </SoneField>
              </div>
              <SoneField invalid={submitted && !!emailError}>
                <SoneFieldLabel htmlFor="signup-email">
                  Work email
                </SoneFieldLabel>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {submitted && emailError ? (
                  <SoneFieldError>{emailError}</SoneFieldError>
                ) : (
                  <SoneFieldDescription>
                    We'll send a confirmation link here.
                  </SoneFieldDescription>
                )}
              </SoneField>
              <SoneField invalid={submitted && score < 4}>
                <SoneFieldLabel htmlFor="signup-password">
                  Password
                </SoneFieldLabel>
                <SonePasswordInput
                  value={password}
                  onValueChange={setPassword}
                  inputId="signup-password"
                  autoComplete="new-password"
                  ariaDescribedby="signup-rules"
                  invalid={submitted && score < 4}
                />
                <SoneMeter
                  label="Password strength"
                  value={score}
                  max={4}
                  detail={strength}
                />
                <ul id="signup-rules" className="rules">
                  {rules.map((r) => (
                    <li key={r.id} className={r.met ? "met" : undefined}>
                      <SoneIcon icon={r.met ? "check" : "close"} size="xs" />
                      {r.label}
                      <span className="sr-only">
                        {r.met ? "(done)" : "(missing)"}
                      </span>
                    </li>
                  ))}
                </ul>
              </SoneField>
              <SoneField invalid={submitted && confirm !== password}>
                <SoneFieldLabel htmlFor="signup-confirm">
                  Confirm password
                </SoneFieldLabel>
                <SonePasswordInput
                  value={confirm}
                  onValueChange={setConfirm}
                  inputId="signup-confirm"
                  autoComplete="new-password"
                  invalid={submitted && confirm !== password}
                />
                {submitted && confirm !== password && (
                  <SoneFieldError>The passwords don't match.</SoneFieldError>
                )}
              </SoneField>
              <SoneField orientation="horizontal" invalid={submitted && !terms}>
                <input
                  id="signup-terms"
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                />
                <SoneFieldContent>
                  <SoneFieldLabel htmlFor="signup-terms">
                    I agree to the Terms and the Privacy policy
                  </SoneFieldLabel>
                  {submitted && !terms && (
                    <SoneFieldError>
                      You need to accept the terms.
                    </SoneFieldError>
                  )}
                </SoneFieldContent>
              </SoneField>
              <SoneField orientation="horizontal">
                <input
                  id="signup-news"
                  type="checkbox"
                  checked={news}
                  onChange={(e) => setNews(e.target.checked)}
                />
                <SoneFieldLabel htmlFor="signup-news">
                  Send me product updates (about once a month)
                </SoneFieldLabel>
              </SoneField>
              <SoneButton type="submit" className="submit">
                Create account
              </SoneButton>
            </SoneFieldGroup>
          </>
        )}
      </div>
    </div>
  );
}

const css = `
.tpl-signup.split {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  min-height: 720px;
}
.tpl-signup .promo {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-6);
  padding: var(--space-8);
  border-right: var(--border-width-thin) solid var(--border-subtle);
  background: var(--accent-soft);
}
.tpl-signup .promo-body h2 {
  margin: 0 0 var(--space-4);
  color: var(--text-primary);
  font-size: var(--font-size-2xl);
  line-height: 1.2;
}
.tpl-signup .perks {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--text-secondary);
}
.tpl-signup .perks li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.tpl-signup .perks sone-icon {
  color: var(--accent-text);
}
.tpl-signup .quote {
  margin: 0;
}
.tpl-signup .quote blockquote {
  margin: 0 0 var(--space-3);
  color: var(--text-primary);
  font-size: var(--font-size-md);
}
.tpl-signup .quote figcaption {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
.tpl-signup .panel {
  display: grid;
  align-content: center;
  width: 100%;
  max-width: 28rem;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
}
.tpl-signup .panel-head h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-xl);
}
.tpl-signup .panel-head p {
  margin: var(--space-1) 0 var(--space-5);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
.tpl-signup .sso {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
}
.tpl-signup .sso svg {
  width: 1rem;
  height: 1rem;
  flex: none;
}
.tpl-signup .divider {
  margin: var(--space-5) 0;
}
.tpl-signup .notice {
  margin-bottom: var(--space-4);
}
.tpl-signup .form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}
.tpl-signup .rules {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-1) var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
.tpl-signup .rules li {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
.tpl-signup .rules li.met {
  color: var(--text-primary);
}
.tpl-signup .rules li.met sone-icon {
  color: var(--accent-text);
}
.tpl-signup .link {
  color: var(--accent-text);
  text-underline-offset: 2px;
}
.tpl-signup .submit {
  width: 100%;
}
.tpl-signup .done {
  display: grid;
  justify-items: center;
  gap: var(--space-3);
  text-align: center;
}
.tpl-signup .done h2 {
  margin: 0;
  font-size: var(--font-size-xl);
}
.tpl-signup .done p {
  margin: 0;
  color: var(--text-secondary);
}
.tpl-signup .done-mark {
  display: inline-grid;
  place-items: center;
  width: var(--space-8);
  height: var(--space-8);
  border-radius: var(--radius-pill);
  background: var(--accent-soft);
  color: var(--accent-text);
}
@media (max-width: 760px) {
  .tpl-signup.split {
    grid-template-columns: minmax(0, 1fr);
  }
  .tpl-signup .promo {
    display: none;
  }
  .tpl-signup .panel {
    padding: var(--space-6) var(--space-4);
  }
}
@media (max-width: 420px) {
  .tpl-signup .form-row,
  .tpl-signup .rules,
  .tpl-signup .sso {
    grid-template-columns: minmax(0, 1fr);
  }
}
`;
