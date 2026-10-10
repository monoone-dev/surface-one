import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from "@angular/core";
import { SONE_ALERT_PARTS } from "@surface-one/angular/alert";
import { SONE_AVATAR_PARTS } from "@surface-one/angular/avatar";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SoneLogoComponent } from "@surface-one/angular/logo";
import { SoneMeterComponent } from "@surface-one/angular/meter";
import { SonePasswordInputComponent } from "@surface-one/angular/password-input";

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

@Component({
  selector: "docs-signup-template",
  imports: [
    ...SONE_ALERT_PARTS,
    ...SONE_AVATAR_PARTS,
    ...SONE_FIELD_PARTS,
    SoneButtonDirective,
    SoneIconComponent,
    SoneLogoComponent,
    SoneMeterComponent,
    SonePasswordInputComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="split">
      <div class="promo">
        <sone-logo size="sm" label="Northwind" />
        <div class="promo-body">
          <h2>Every meeting, searchable.</h2>
          <ul class="perks">
            <li><sone-icon icon="check" size="sm" /> Free for teams up to 5</li>
            <li>
              <sone-icon icon="check" size="sm" /> Transcripts in 30 languages
            </li>
            <li>
              <sone-icon icon="check" size="sm" /> End-to-end encrypted notes
            </li>
          </ul>
        </div>
        <figure class="quote">
          <blockquote>
            “We stopped writing meeting notes by hand in the first week.”
          </blockquote>
          <figcaption>
            <sone-avatar size="sm" aria-hidden="true"
              ><span soneAvatarFallback>MS</span></sone-avatar
            >
            <span>Mina Sato · Head of Product, Harbor</span>
          </figcaption>
        </figure>
      </div>

      <div class="panel">
        @if (created()) {
          <div class="done" role="status">
            <span class="done-mark" aria-hidden="true"
              ><sone-icon icon="check"
            /></span>
            <h2>Check your inbox</h2>
            <p>
              We sent a confirmation link to <strong>{{ email() }}</strong
              >. It expires in 24 hours.
            </p>
            <button soneBtn variant="outline" type="button" (click)="reset()">
              Use a different email
            </button>
          </div>
        } @else {
          <div class="panel-head">
            <h2>Create your account</h2>
            <p>
              Already have one?
              <a href="#login" class="link" (click)="$event.preventDefault()"
                >Sign in</a
              >
            </p>
          </div>

          <div class="sso" role="group" aria-label="Sign up with">
            <button soneBtn variant="outline" type="button">
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
            </button>
            <button soneBtn variant="outline" type="button">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M16.37 12.6c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.77-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.75 2.28-1.6 2.78-.41 6.9 1.15 9.15.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.78.74 2.99.72 1.24-.02 2.02-1.12 2.77-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.39-.92-2.41-3.68ZM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.02.61-2.67 1.37-.59.68-1.1 1.77-.96 2.81 1.01.08 2.05-.52 2.69-1.29Z"
                />
              </svg>
              <span>Apple</span>
            </button>
            <button soneBtn variant="outline" type="button">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 1a11 11 0 0 0-3.48 21.44c.55.1.75-.24.75-.53v-1.86c-3.06.66-3.71-1.48-3.71-1.48-.5-1.27-1.22-1.61-1.22-1.61-1-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.69 2.58 1.2 3.2.92.1-.71.39-1.2.7-1.47-2.44-.28-5.01-1.22-5.01-5.44 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.91 0 0 .92-.3 3.02 1.13a10.5 10.5 0 0 1 5.5 0c2.1-1.42 3.02-1.13 3.02-1.13.6 1.51.22 2.63.11 2.91.7.77 1.13 1.75 1.13 2.95 0 4.23-2.58 5.16-5.03 5.43.4.34.75 1.01.75 2.04v3.03c0 .29.2.64.76.53A11 11 0 0 0 12 1Z"
                />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          <div soneFieldSeparator class="divider">
            <span soneFieldSeparatorContent>or sign up with email</span>
          </div>

          @if (submitted() && errorCount()) {
            <div soneAlert variant="destructive" role="alert" class="notice">
              <p soneAlertTitle>
                {{ errorCount() }}
                {{ errorCount() === 1 ? "field needs" : "fields need" }}
                attention
              </p>
              <p soneAlertDescription>Fix the highlighted fields below.</p>
            </div>
          }

          <form soneFieldGroup novalidate (submit)="submit($event)">
            <div class="form-row">
              <div soneField [invalid]="submitted() && !first().trim()">
                <label soneFieldLabel for="signup-first">First name</label>
                <input
                  id="signup-first"
                  type="text"
                  autocomplete="given-name"
                  [value]="first()"
                  (input)="first.set($any($event.target).value)"
                />
                @if (submitted() && !first().trim()) {
                  <p soneFieldError>Enter your first name.</p>
                }
              </div>
              <div soneField>
                <label soneFieldLabel for="signup-last">Last name</label>
                <input
                  id="signup-last"
                  type="text"
                  autocomplete="family-name"
                  [value]="last()"
                  (input)="last.set($any($event.target).value)"
                />
              </div>
            </div>
            <div soneField [invalid]="submitted() && !!emailError()">
              <label soneFieldLabel for="signup-email">Work email</label>
              <input
                id="signup-email"
                type="email"
                autocomplete="email"
                [value]="email()"
                (input)="email.set($any($event.target).value)"
              />
              @if (submitted() && emailError(); as e) {
                <p soneFieldError>{{ e }}</p>
              } @else {
                <p soneFieldDescription>We'll send a confirmation link here.</p>
              }
            </div>
            <div soneField [invalid]="submitted() && score() < 4">
              <label soneFieldLabel for="signup-password">Password</label>
              <sone-password-input
                inputId="signup-password"
                autocomplete="new-password"
                ariaDescribedby="signup-rules"
                [invalid]="submitted() && score() < 4"
                [(value)]="password"
              />
              <sone-meter
                label="Password strength"
                [value]="score()"
                [max]="4"
                [detail]="strength()"
              />
              <ul id="signup-rules" class="rules">
                @for (r of rules(); track r.id) {
                  <li [class.met]="r.met">
                    <sone-icon [icon]="r.met ? 'check' : 'close'" size="xs" />
                    {{ r.label }}
                    <span class="sr-only">{{
                      r.met ? "(done)" : "(missing)"
                    }}</span>
                  </li>
                }
              </ul>
            </div>
            <div soneField [invalid]="submitted() && confirm() !== password()">
              <label soneFieldLabel for="signup-confirm"
                >Confirm password</label
              >
              <sone-password-input
                inputId="signup-confirm"
                autocomplete="new-password"
                [invalid]="submitted() && confirm() !== password()"
                [(value)]="confirm"
              />
              @if (submitted() && confirm() !== password()) {
                <p soneFieldError>The passwords don't match.</p>
              }
            </div>
            <div
              soneField
              orientation="horizontal"
              [invalid]="submitted() && !terms()"
            >
              <input
                id="signup-terms"
                type="checkbox"
                [checked]="terms()"
                (change)="terms.set($any($event.target).checked)"
              />
              <div soneFieldContent>
                <label soneFieldLabel for="signup-terms"
                  >I agree to the Terms and the Privacy policy</label
                >
                @if (submitted() && !terms()) {
                  <p soneFieldError>You need to accept the terms.</p>
                }
              </div>
            </div>
            <div soneField orientation="horizontal">
              <input
                id="signup-news"
                type="checkbox"
                [checked]="news()"
                (change)="news.set($any($event.target).checked)"
              />
              <label soneFieldLabel for="signup-news"
                >Send me product updates (about once a month)</label
              >
            </div>
            <button soneBtn type="submit" class="submit">Create account</button>
          </form>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .split {
      display: grid;
      grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
      min-height: 720px;
    }
    .promo {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: var(--space-6);
      padding: var(--space-8);
      border-right: var(--border-width-thin) solid var(--border-subtle);
      background: var(--accent-soft);
    }
    .promo-body h2 {
      margin: 0 0 var(--space-4);
      color: var(--text-primary);
      font-size: var(--font-size-2xl);
      line-height: 1.2;
    }
    .perks {
      display: grid;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      list-style: none;
      color: var(--text-secondary);
    }
    .perks li {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .perks sone-icon {
      color: var(--accent-text);
    }
    .quote {
      margin: 0;
    }
    .quote blockquote {
      margin: 0 0 var(--space-3);
      color: var(--text-primary);
      font-size: var(--font-size-md);
    }
    .quote figcaption {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }
    .panel {
      display: grid;
      align-content: center;
      width: 100%;
      max-width: 28rem;
      margin: 0 auto;
      padding: var(--space-8) var(--space-6);
    }
    .panel-head h2 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--font-size-xl);
    }
    .panel-head p {
      margin: var(--space-1) 0 var(--space-5);
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }
    .sso {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--space-2);
    }
    .sso svg {
      width: 1rem;
      height: 1rem;
      flex: none;
    }
    .divider {
      margin: var(--space-5) 0;
    }
    .notice {
      margin-bottom: var(--space-4);
    }
    .form-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-3);
    }
    .rules {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-1) var(--space-3);
      margin: 0;
      padding: 0;
      list-style: none;
      color: var(--text-muted);
      font-size: var(--font-size-xs);
    }
    .rules li {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }
    .rules li.met {
      color: var(--text-primary);
    }
    .rules li.met sone-icon {
      color: var(--accent-text);
    }
    .link {
      color: var(--accent-text);
      text-underline-offset: 2px;
    }
    .submit {
      width: 100%;
    }
    .done {
      display: grid;
      justify-items: center;
      gap: var(--space-3);
      text-align: center;
    }
    .done h2 {
      margin: 0;
      font-size: var(--font-size-xl);
    }
    .done p {
      margin: 0;
      color: var(--text-secondary);
    }
    .done-mark {
      display: inline-grid;
      place-items: center;
      width: var(--space-8);
      height: var(--space-8);
      border-radius: var(--radius-pill);
      background: var(--accent-soft);
      color: var(--accent-text);
    }
    @media (max-width: 760px) {
      .split {
        grid-template-columns: minmax(0, 1fr);
      }
      .promo {
        display: none;
      }
      .panel {
        padding: var(--space-6) var(--space-4);
      }
    }
    @media (max-width: 420px) {
      .form-row,
      .rules,
      .sso {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `,
})
export default class Template {
  protected readonly first = signal("");
  protected readonly last = signal("");
  protected readonly email = signal("");
  protected readonly password = signal("");
  protected readonly confirm = signal("");
  protected readonly terms = signal(false);
  protected readonly news = signal(false);
  protected readonly submitted = signal(false);
  protected readonly created = signal(false);

  protected readonly rules = computed(() =>
    RULES.map((r) => ({ ...r, met: r.test(this.password()) })),
  );
  protected readonly score = computed(
    () => this.rules().filter((r) => r.met).length,
  );
  protected readonly strength = computed(() =>
    this.password() ? STRENGTH[this.score()] : "",
  );
  protected readonly emailError = computed(() => {
    const v = this.email().trim();
    if (!v) return "Enter your work email.";
    return EMAIL.test(v)
      ? null
      : "Enter an email address like ada@example.com.";
  });
  protected readonly errorCount = computed(
    () =>
      [
        !this.first().trim(),
        !!this.emailError(),
        this.score() < 4,
        this.confirm() !== this.password(),
        !this.terms(),
      ].filter(Boolean).length,
  );

  protected submit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    if (this.errorCount() === 0) this.created.set(true);
  }

  protected reset(): void {
    this.created.set(false);
    this.submitted.set(false);
    this.email.set("");
  }
}
