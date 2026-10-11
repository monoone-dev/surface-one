"use client";

import { useState, type FormEvent } from "react";
import {
  SoneAlert,
  SoneAlertDescription,
  SoneAlertTitle,
  SoneButton,
  SoneCard,
  SoneCardContent,
  SoneCardDescription,
  SoneCardFooter,
  SoneCardHeader,
  SoneCardTitle,
  SoneField,
  SoneFieldError,
  SoneFieldGroup,
  SoneFieldLabel,
  SoneFieldSeparator,
  SoneFieldSeparatorContent,
  SoneLogo,
  SonePasswordInput,
  SoneSpinner,
} from "@surface-one/react";

type Provider = "google" | "apple" | "github";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginTemplate() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState<Provider | "email" | null>(null);
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");

  const emailValue = email.trim();
  const emailError = !emailValue
    ? "Enter your email address."
    : EMAIL.test(emailValue)
      ? null
      : "Enter an email address like ada@example.com.";
  const passwordError = password ? null : "Enter your password.";

  function sso(provider: Provider): void {
    setBusy(provider);
    // A real app redirects to the provider here (OAuth / OIDC).
    setTimeout(() => setBusy(null), 1200);
  }

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setSubmitted(true);
    setStatus("idle");
    if (emailError || passwordError) {
      // Move focus to the first field that needs attention.
      const first = emailError ? "#login-email" : "#login-password";
      event.currentTarget.querySelector<HTMLElement>(first)?.focus();
      return;
    }
    setBusy("email");
    setTimeout(() => {
      setBusy(null);
      // Demo rule: any password shorter than 8 characters is "wrong".
      setStatus(password.length >= 8 ? "success" : "error");
    }, 900);
  }

  return (
    <div className="screen tpl-login">
      <style>{css}</style>
      <SoneCard className="auth">
        <SoneCardHeader className="auth-head">
          <SoneLogo size="sm" label="Northwind" />
          <SoneCardTitle as="h2" className="auth-title">
            Welcome back
          </SoneCardTitle>
          <SoneCardDescription>
            Sign in to your Northwind workspace.
          </SoneCardDescription>
        </SoneCardHeader>

        <SoneCardContent>
          <div className="sso" role="group" aria-label="Sign in with">
            <SoneButton
              variant="outline"
              type="button"
              disabled={busy !== null}
              onClick={() => sso("google")}
            >
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
              {busy === "google" && (
                <SoneSpinner size={14} label="Connecting to Google" />
              )}
              <span>Continue with Google</span>
            </SoneButton>
            <SoneButton
              variant="outline"
              type="button"
              disabled={busy !== null}
              onClick={() => sso("apple")}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M16.37 12.6c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.77-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.75 2.28-1.6 2.78-.41 6.9 1.15 9.15.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.78.74 2.99.72 1.24-.02 2.02-1.12 2.77-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.39-.92-2.41-3.68ZM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.02.61-2.67 1.37-.59.68-1.1 1.77-.96 2.81 1.01.08 2.05-.52 2.69-1.29Z"
                />
              </svg>
              {busy === "apple" && (
                <SoneSpinner size={14} label="Connecting to Apple" />
              )}
              <span>Continue with Apple</span>
            </SoneButton>
            <SoneButton
              variant="outline"
              type="button"
              disabled={busy !== null}
              onClick={() => sso("github")}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 1a11 11 0 0 0-3.48 21.44c.55.1.75-.24.75-.53v-1.86c-3.06.66-3.71-1.48-3.71-1.48-.5-1.27-1.22-1.61-1.22-1.61-1-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.69 2.58 1.2 3.2.92.1-.71.39-1.2.7-1.47-2.44-.28-5.01-1.22-5.01-5.44 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.91 0 0 .92-.3 3.02 1.13a10.5 10.5 0 0 1 5.5 0c2.1-1.42 3.02-1.13 3.02-1.13.6 1.51.22 2.63.11 2.91.7.77 1.13 1.75 1.13 2.95 0 4.23-2.58 5.16-5.03 5.43.4.34.75 1.01.75 2.04v3.03c0 .29.2.64.76.53A11 11 0 0 0 12 1Z"
                />
              </svg>
              {busy === "github" && (
                <SoneSpinner size={14} label="Connecting to GitHub" />
              )}
              <span>Continue with GitHub</span>
            </SoneButton>
          </div>

          <SoneFieldSeparator className="divider">
            <SoneFieldSeparatorContent>
              or continue with email
            </SoneFieldSeparatorContent>
          </SoneFieldSeparator>

          {status === "error" ? (
            <SoneAlert variant="destructive" role="alert" className="notice">
              <SoneAlertTitle>Those details don't match</SoneAlertTitle>
              <SoneAlertDescription>
                Check your email and password, or reset your password.
              </SoneAlertDescription>
            </SoneAlert>
          ) : status === "success" ? (
            <SoneAlert variant="success" role="status" className="notice">
              <SoneAlertTitle>Signed in</SoneAlertTitle>
              <SoneAlertDescription>
                Redirecting you to your workspace…
              </SoneAlertDescription>
            </SoneAlert>
          ) : null}

          <SoneFieldGroup as="form" noValidate onSubmit={submit}>
            <SoneField invalid={submitted && !!emailError}>
              <SoneFieldLabel htmlFor="login-email">Email</SoneFieldLabel>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="ada@northwind.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {submitted && emailError && (
                <SoneFieldError>{emailError}</SoneFieldError>
              )}
            </SoneField>
            <SoneField invalid={submitted && !!passwordError}>
              <div className="label-row">
                <SoneFieldLabel htmlFor="login-password">
                  Password
                </SoneFieldLabel>
                <a
                  href="#reset"
                  className="link"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot password?
                </a>
              </div>
              <SonePasswordInput
                value={password}
                onValueChange={setPassword}
                inputId="login-password"
                autoComplete="current-password"
                invalid={submitted && !!passwordError}
              />
              {submitted && passwordError && (
                <SoneFieldError>{passwordError}</SoneFieldError>
              )}
            </SoneField>
            <SoneField orientation="horizontal">
              <input
                id="login-remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <SoneFieldLabel htmlFor="login-remember">
                Keep me signed in on this device
              </SoneFieldLabel>
            </SoneField>
            <SoneButton
              type="submit"
              className="submit"
              disabled={busy !== null}
            >
              {busy === "email" && <SoneSpinner size={14} label="Signing in" />}
              Sign in
            </SoneButton>
          </SoneFieldGroup>
        </SoneCardContent>

        <SoneCardFooter className="auth-foot">
          <p>
            New to Northwind?{" "}
            <a
              href="#signup"
              className="link"
              onClick={(e) => e.preventDefault()}
            >
              Create an account
            </a>
          </p>
        </SoneCardFooter>
      </SoneCard>
      <p className="legal">
        By continuing you agree to the{" "}
        <a href="#terms" className="link">
          Terms
        </a>{" "}
        and the{" "}
        <a href="#privacy" className="link">
          Privacy policy
        </a>
        .
      </p>
    </div>
  );
}

const css = `
.tpl-login.screen {
  display: grid;
  justify-items: center;
  align-content: center;
  gap: var(--space-4);
  min-height: 640px;
  padding: var(--space-8) var(--space-4);
  background: var(--surface-base);
}
.tpl-login .auth {
  width: 100%;
  max-width: 24rem;
}
.tpl-login .auth-head {
  justify-items: center;
  text-align: center;
}
.tpl-login .auth-title {
  margin-top: var(--space-2);
  font-size: var(--font-size-xl);
}
.tpl-login .sso {
  display: grid;
  gap: var(--space-2);
}
.tpl-login .sso button {
  width: 100%;
}
.tpl-login .sso svg {
  width: 1rem;
  height: 1rem;
  flex: none;
}
.tpl-login .divider {
  /* The label sits on the card, not on the page. */
  --field-separator-bg: var(--surface-raised);
  margin: var(--space-5) 0;
}
.tpl-login .notice {
  margin-bottom: var(--space-4);
}
.tpl-login .label-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
}
.tpl-login .link {
  color: var(--accent-text);
  font-size: var(--font-size-sm);
  text-underline-offset: 2px;
}
.tpl-login .submit {
  width: 100%;
}
.tpl-login .auth-foot {
  justify-content: center;
}
.tpl-login .auth-foot p {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
.tpl-login .legal {
  max-width: 24rem;
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  text-align: center;
}
`;
