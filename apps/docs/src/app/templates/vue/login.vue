<script setup lang="ts">
import { computed, ref } from "vue";
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
} from "@surface-one/vue";

type Provider = "google" | "apple" | "github";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const email = ref("");
const password = ref("");
const remember = ref(true);
const submitted = ref(false);
const busy = ref<Provider | "email" | null>(null);
const status = ref<"idle" | "error" | "success">("idle");

const emailError = computed(() => {
  const v = email.value.trim();
  if (!v) return "Enter your email address.";
  return EMAIL.test(v) ? null : "Enter an email address like ada@example.com.";
});
const passwordError = computed(() =>
  password.value ? null : "Enter your password.",
);

function sso(provider: Provider): void {
  busy.value = provider;
  // A real app redirects to the provider here (OAuth / OIDC).
  setTimeout(() => (busy.value = null), 1200);
}

function submit(event: Event): void {
  submitted.value = true;
  status.value = "idle";
  if (emailError.value || passwordError.value) {
    // Move focus to the first field that needs attention.
    const form = event.target as HTMLFormElement;
    const first = emailError.value ? "#login-email" : "#login-password";
    form.querySelector<HTMLElement>(first)?.focus();
    return;
  }
  busy.value = "email";
  setTimeout(() => {
    busy.value = null;
    // Demo rule: any password shorter than 8 characters is "wrong".
    status.value = password.value.length >= 8 ? "success" : "error";
  }, 900);
}
</script>

<template>
  <div class="screen">
    <SoneCard class="auth">
      <SoneCardHeader class="auth-head">
        <SoneLogo size="sm" label="Northwind" />
        <SoneCardTitle as="h2" class="auth-title">Welcome back</SoneCardTitle>
        <SoneCardDescription
          >Sign in to your Northwind workspace.</SoneCardDescription
        >
      </SoneCardHeader>

      <SoneCardContent>
        <div class="sso" role="group" aria-label="Sign in with">
          <SoneButton
            variant="outline"
            type="button"
            :disabled="busy !== null"
            @click="sso('google')"
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
            <SoneSpinner
              v-if="busy === 'google'"
              :size="14"
              label="Connecting to Google"
            />
            <span>Continue with Google</span>
          </SoneButton>
          <SoneButton
            variant="outline"
            type="button"
            :disabled="busy !== null"
            @click="sso('apple')"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M16.37 12.6c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.77-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.75 2.28-1.6 2.78-.41 6.9 1.15 9.15.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.78.74 2.99.72 1.24-.02 2.02-1.12 2.77-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.39-.92-2.41-3.68ZM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.02.61-2.67 1.37-.59.68-1.1 1.77-.96 2.81 1.01.08 2.05-.52 2.69-1.29Z"
              />
            </svg>
            <SoneSpinner
              v-if="busy === 'apple'"
              :size="14"
              label="Connecting to Apple"
            />
            <span>Continue with Apple</span>
          </SoneButton>
          <SoneButton
            variant="outline"
            type="button"
            :disabled="busy !== null"
            @click="sso('github')"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 1a11 11 0 0 0-3.48 21.44c.55.1.75-.24.75-.53v-1.86c-3.06.66-3.71-1.48-3.71-1.48-.5-1.27-1.22-1.61-1.22-1.61-1-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.69 2.58 1.2 3.2.92.1-.71.39-1.2.7-1.47-2.44-.28-5.01-1.22-5.01-5.44 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.91 0 0 .92-.3 3.02 1.13a10.5 10.5 0 0 1 5.5 0c2.1-1.42 3.02-1.13 3.02-1.13.6 1.51.22 2.63.11 2.91.7.77 1.13 1.75 1.13 2.95 0 4.23-2.58 5.16-5.03 5.43.4.34.75 1.01.75 2.04v3.03c0 .29.2.64.76.53A11 11 0 0 0 12 1Z"
              />
            </svg>
            <SoneSpinner
              v-if="busy === 'github'"
              :size="14"
              label="Connecting to GitHub"
            />
            <span>Continue with GitHub</span>
          </SoneButton>
        </div>

        <SoneFieldSeparator class="divider">
          <SoneFieldSeparatorContent
            >or continue with email</SoneFieldSeparatorContent
          >
        </SoneFieldSeparator>

        <SoneAlert
          v-if="status === 'error'"
          variant="destructive"
          role="alert"
          class="notice"
        >
          <SoneAlertTitle>Those details don't match</SoneAlertTitle>
          <SoneAlertDescription
            >Check your email and password, or reset your
            password.</SoneAlertDescription
          >
        </SoneAlert>
        <SoneAlert
          v-else-if="status === 'success'"
          variant="success"
          role="status"
          class="notice"
        >
          <SoneAlertTitle>Signed in</SoneAlertTitle>
          <SoneAlertDescription
            >Redirecting you to your workspace…</SoneAlertDescription
          >
        </SoneAlert>

        <SoneFieldGroup as="form" novalidate @submit.prevent="submit">
          <SoneField :invalid="submitted && !!emailError">
            <SoneFieldLabel for="login-email">Email</SoneFieldLabel>
            <input
              id="login-email"
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="ada@northwind.dev"
            />
            <SoneFieldError v-if="submitted && emailError">{{
              emailError
            }}</SoneFieldError>
          </SoneField>
          <SoneField :invalid="submitted && !!passwordError">
            <div class="label-row">
              <SoneFieldLabel for="login-password">Password</SoneFieldLabel>
              <a href="#reset" class="link" @click.prevent>Forgot password?</a>
            </div>
            <SonePasswordInput
              v-model="password"
              input-id="login-password"
              autocomplete="current-password"
              :invalid="submitted && !!passwordError"
            />
            <SoneFieldError v-if="submitted && passwordError">{{
              passwordError
            }}</SoneFieldError>
          </SoneField>
          <SoneField orientation="horizontal">
            <input id="login-remember" v-model="remember" type="checkbox" />
            <SoneFieldLabel for="login-remember"
              >Keep me signed in on this device</SoneFieldLabel
            >
          </SoneField>
          <SoneButton type="submit" class="submit" :disabled="busy !== null">
            <SoneSpinner
              v-if="busy === 'email'"
              :size="14"
              label="Signing in"
            />
            Sign in
          </SoneButton>
        </SoneFieldGroup>
      </SoneCardContent>

      <SoneCardFooter class="auth-foot">
        <p>
          New to Northwind?
          <a href="#signup" class="link" @click.prevent>Create an account</a>
        </p>
      </SoneCardFooter>
    </SoneCard>
    <p class="legal">
      By continuing you agree to the <a href="#terms" class="link">Terms</a> and
      the <a href="#privacy" class="link">Privacy policy</a>.
    </p>
  </div>
</template>

<style scoped>
.screen {
  display: grid;
  justify-items: center;
  align-content: center;
  gap: var(--space-4);
  min-height: 640px;
  padding: var(--space-8) var(--space-4);
  background: var(--surface-base);
}
.auth {
  width: 100%;
  max-width: 24rem;
}
.auth-head {
  justify-items: center;
  text-align: center;
}
.auth-title {
  margin-top: var(--space-2);
  font-size: var(--font-size-xl);
}
.sso {
  display: grid;
  gap: var(--space-2);
}
.sso button {
  width: 100%;
}
.sso svg {
  width: 1rem;
  height: 1rem;
  flex: none;
}
.divider {
  /* The label sits on the card, not on the page. */
  --field-separator-bg: var(--surface-raised);
  margin: var(--space-5) 0;
}
.notice {
  margin-bottom: var(--space-4);
}
.label-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
}
.link {
  color: var(--accent-text);
  font-size: var(--font-size-sm);
  text-underline-offset: 2px;
}
.submit {
  width: 100%;
}
.auth-foot {
  justify-content: center;
}
.auth-foot p {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
.legal {
  max-width: 24rem;
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  text-align: center;
}
</style>
