import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  type AbstractControl,
  type ValidationErrors,
} from "@angular/forms";
import { SONE_ALERT_PARTS } from "@surface-one/angular/alert";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_CHOICE_CARD_PARTS } from "@surface-one/angular/choice-card";
import {
  SONE_FIELD_PARTS,
  SONE_INPUT_GROUP_PARTS,
} from "@surface-one/angular/input";
import { SONE_PAGE_HEADER_PARTS } from "@surface-one/angular/page-header";
import { SoneSelectComponent } from "@surface-one/angular/select";

/** The deadline must come after the start date. */
function datesInOrder(group: AbstractControl): ValidationErrors | null {
  const start = group.get("start")?.value as string;
  const deadline = group.get("deadline")?.value as string;
  return start && deadline && deadline <= start ? { order: true } : null;
}

/** At least one checkbox of the group is ticked. */
function atLeastOne(group: AbstractControl): ValidationErrors | null {
  return Object.values(group.value as Record<string, boolean>).some(Boolean)
    ? null
    : { none: true };
}

const SERVICES = [
  { id: "research", label: "User research" },
  { id: "design", label: "Product design" },
  { id: "frontend", label: "Frontend build" },
  { id: "backend", label: "Backend and APIs" },
  { id: "a11y", label: "Accessibility audit" },
  { id: "content", label: "Content and copy" },
] as const;

const SIZES = [
  { id: "small", title: "1–10", copy: "A small team or a pilot." },
  { id: "medium", title: "11–50", copy: "One product area." },
  { id: "large", title: "51+", copy: "Several teams or a rollout." },
] as const;

@Component({
  selector: "docs-form-template",
  imports: [
    ReactiveFormsModule,
    ...SONE_ALERT_PARTS,
    ...SONE_CHOICE_CARD_PARTS,
    ...SONE_FIELD_PARTS,
    ...SONE_INPUT_GROUP_PARTS,
    ...SONE_PAGE_HEADER_PARTS,
    SoneBadgeDirective,
    SoneButtonDirective,
    SoneSelectComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div sonePageHeader>
      <div sonePageHeaderContent>
        <p sonePageHeaderEyebrow>Northwind Studio</p>
        <h2 sonePageHeaderTitle>Start a project</h2>
        <p sonePageHeaderDescription>
          Tell us about the work. Fields marked
          <span aria-hidden="true">*</span><span class="sr-only">required</span>
          are required; we reply within two working days.
        </p>
      </div>
    </div>

    @if (sent()) {
      <div soneAlert variant="success" role="status" class="summary">
        <p soneAlertTitle>Request sent — thank you, {{ firstName() }}!</p>
        <p soneAlertDescription>
          We emailed a copy to {{ form.value.contact?.email }}.
        </p>
        <div soneAlertAction>
          <button
            soneBtn
            variant="outline"
            size="sm"
            type="button"
            (click)="reset()"
          >
            Start another
          </button>
        </div>
      </div>
    }

    @if (submitted() && errors().length) {
      <div
        #summary
        soneAlert
        variant="destructive"
        role="alert"
        tabindex="-1"
        class="summary"
        aria-labelledby="form-summary-title"
      >
        <p soneAlertTitle id="form-summary-title">
          There
          {{
            errors().length === 1
              ? "is a problem"
              : "are " + errors().length + " problems"
          }}
          with the request
        </p>
        <div soneAlertDescription>
          <ul class="summary-list">
            @for (e of errors(); track e.id) {
              <li>
                <a [href]="'#' + e.id" (click)="focusField(e.id, $event)">{{
                  e.message
                }}</a>
              </li>
            }
          </ul>
        </div>
      </div>
    }

    <form [formGroup]="form" novalidate (ngSubmit)="submit()">
      <!-- Contact -->
      <div class="section" role="group" aria-labelledby="form-contact">
        <div class="section-intro">
          <h3 id="form-contact">Contact</h3>
          <p>Who we should talk to about this project.</p>
        </div>
        <div class="section-body" soneFieldGroup formGroupName="contact">
          <div class="row">
            <div soneField [invalid]="show('contact.name')">
              <label soneFieldLabel for="form-name">Full name *</label>
              <input
                id="form-name"
                type="text"
                autocomplete="name"
                formControlName="name"
              />
              @if (show("contact.name")) {
                <p soneFieldError>{{ message("contact.name") }}</p>
              }
            </div>
            <div soneField [invalid]="show('contact.email')">
              <label soneFieldLabel for="form-email">Work email *</label>
              <input
                id="form-email"
                type="email"
                autocomplete="email"
                formControlName="email"
              />
              @if (show("contact.email")) {
                <p soneFieldError>{{ message("contact.email") }}</p>
              }
            </div>
          </div>
          <div class="row">
            <div soneField [invalid]="show('contact.company')">
              <label soneFieldLabel for="form-company">Company *</label>
              <input
                id="form-company"
                type="text"
                autocomplete="organization"
                formControlName="company"
              />
              @if (show("contact.company")) {
                <p soneFieldError>{{ message("contact.company") }}</p>
              }
            </div>
            <div soneField [invalid]="show('contact.phone')">
              <label soneFieldLabel for="form-phone">Phone</label>
              <input
                id="form-phone"
                type="tel"
                autocomplete="tel"
                formControlName="phone"
                placeholder="+48 600 000 000"
              />
              @if (show("contact.phone")) {
                <p soneFieldError>{{ message("contact.phone") }}</p>
              } @else {
                <p soneFieldDescription>Optional — for a quick call.</p>
              }
            </div>
          </div>
          <div soneField [invalid]="show('contact.role')">
            <label soneFieldLabel for="form-role">Your role *</label>
            <sone-select
              selectId="form-role"
              formControlName="role"
              [invalid]="show('contact.role')"
            >
              <option value="" disabled>Choose a role</option>
              @for (r of roles; track r) {
                <option [value]="r">{{ r }}</option>
              }
            </sone-select>
            @if (show("contact.role")) {
              <p soneFieldError>{{ message("contact.role") }}</p>
            }
          </div>
        </div>
      </div>

      <!-- Project -->
      <div class="section" role="group" aria-labelledby="form-project">
        <div class="section-intro">
          <h3 id="form-project">Project</h3>
          <p>The goal, the budget and the dates you have in mind.</p>
        </div>
        <div class="section-body" soneFieldGroup formGroupName="project">
          <div soneField [invalid]="show('project.title')">
            <label soneFieldLabel for="form-title">Project name *</label>
            <input id="form-title" type="text" formControlName="title" />
            @if (show("project.title")) {
              <p soneFieldError>{{ message("project.title") }}</p>
            }
          </div>
          <div soneField [invalid]="show('project.budget')">
            <label soneFieldLabel for="form-budget">Budget *</label>
            <div soneInputGroup [invalid]="show('project.budget')">
              <span soneInputGroupAddon><span soneInputGroupText>€</span></span>
              <input
                soneInputGroupInput
                id="form-budget"
                type="number"
                inputmode="numeric"
                min="5000"
                step="1000"
                formControlName="budget"
              />
              <span soneInputGroupAddon align="inline-end"
                ><span soneInputGroupText>EUR</span></span
              >
            </div>
            @if (show("project.budget")) {
              <p soneFieldError>{{ message("project.budget") }}</p>
            } @else {
              <p soneFieldDescription>Projects start at €5,000.</p>
            }
          </div>
          <div class="row" formGroupName="dates">
            <div soneField [invalid]="show('project.dates.start')">
              <label soneFieldLabel for="form-start">Start date *</label>
              <input id="form-start" type="date" formControlName="start" />
              @if (show("project.dates.start")) {
                <p soneFieldError>{{ message("project.dates.start") }}</p>
              }
            </div>
            <div
              soneField
              [invalid]="
                show('project.dates.deadline') || show('project.dates')
              "
            >
              <label soneFieldLabel for="form-deadline">Deadline *</label>
              <input
                id="form-deadline"
                type="date"
                formControlName="deadline"
              />
              @if (show("project.dates.deadline")) {
                <p soneFieldError>{{ message("project.dates.deadline") }}</p>
              } @else if (show("project.dates")) {
                <p soneFieldError>{{ message("project.dates") }}</p>
              }
            </div>
          </div>
          <div soneField aria-labelledby="form-size-label">
            <span soneFieldLabel id="form-size-label"
              >People who will use it</span
            >
            <div
              soneChoiceGroup
              class="choices"
              aria-labelledby="form-size-label"
            >
              @for (s of sizes; track s.id) {
                <button
                  soneChoiceCard
                  type="button"
                  [selected]="form.value.project?.size === s.id"
                  (click)="pickSize(s.id)"
                >
                  <span soneChoiceCardTitle>{{ s.title }}</span>
                  <span soneChoiceCardDescription>{{ s.copy }}</span>
                  <span soneChoiceCardIndicator></span>
                </button>
              }
            </div>
          </div>
          <fieldset
            soneFieldSet
            formGroupName="services"
            [attr.aria-describedby]="
              show('project.services') ? 'form-services-error' : null
            "
          >
            <legend soneFieldLegend variant="label" id="form-services">
              Services you need *
            </legend>
            <div soneFieldGroup variant="choices" class="services">
              @for (s of services; track s.id) {
                <div soneField orientation="horizontal">
                  <input
                    [id]="'form-service-' + s.id"
                    type="checkbox"
                    [formControlName]="s.id"
                  />
                  <label soneFieldLabel [for]="'form-service-' + s.id">{{
                    s.label
                  }}</label>
                </div>
              }
            </div>
            @if (show("project.services")) {
              <p soneFieldError id="form-services-error">
                {{ message("project.services") }}
              </p>
            }
          </fieldset>
          <div soneField [invalid]="show('project.brief')">
            <div class="label-row">
              <label soneFieldLabel for="form-brief">Brief *</label>
              <span
                class="counter"
                [class.over]="briefLength() > 500"
                aria-hidden="true"
                >{{ briefLength() }} / 500</span
              >
            </div>
            <textarea
              id="form-brief"
              rows="5"
              formControlName="brief"
              placeholder="What problem are you solving, and for whom?"
            ></textarea>
            @if (show("project.brief")) {
              <p soneFieldError>{{ message("project.brief") }}</p>
            } @else {
              <p soneFieldDescription>Between 40 and 500 characters.</p>
            }
          </div>
          <div soneField [invalid]="show('project.website')">
            <label soneFieldLabel for="form-website">Current website</label>
            <input
              id="form-website"
              type="url"
              formControlName="website"
              placeholder="https://"
            />
            @if (show("project.website")) {
              <p soneFieldError>{{ message("project.website") }}</p>
            }
          </div>
        </div>
      </div>

      <!-- Consent -->
      <div class="section" role="group" aria-labelledby="form-consent">
        <div class="section-intro">
          <h3 id="form-consent">Consent</h3>
          <p>How we may use the details above.</p>
        </div>
        <div class="section-body" soneFieldGroup variant="choices">
          <div soneField orientation="horizontal" [invalid]="show('consent')">
            <input
              id="form-consent-check"
              type="checkbox"
              formControlName="consent"
            />
            <div soneFieldContent>
              <label soneFieldLabel for="form-consent-check"
                >Northwind may store these details to answer my request *</label
              >
              @if (show("consent")) {
                <p soneFieldError>{{ message("consent") }}</p>
              }
            </div>
          </div>
          <div soneField orientation="horizontal">
            <input id="form-nda" type="checkbox" formControlName="nda" />
            <div soneFieldContent>
              <label soneFieldLabel for="form-nda"
                >Send me an NDA before the first call</label
              >
              <p soneFieldDescription>
                We sign before you share anything confidential.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        @if (form.dirty && !sent()) {
          <span soneBadge variant="secondary">Draft</span>
        }
        <span class="spacer"></span>
        <button soneBtn variant="ghost" type="button" (click)="reset()">
          Clear
        </button>
        <button soneBtn type="submit">Send request</button>
      </div>
    </form>
  `,
  styles: `
    :host {
      display: block;
      padding: var(--space-6);
    }
    .summary {
      margin-bottom: var(--space-5);
    }
    .summary-list {
      margin: var(--space-1) 0 0;
      padding-left: var(--space-5);
    }
    .summary-list a {
      color: inherit;
      text-underline-offset: 2px;
    }
    .section {
      display: grid;
      grid-template-columns: minmax(0, 14rem) minmax(0, 1fr);
      gap: var(--space-6);
      padding: var(--space-6) 0;
      border-top: 1px solid var(--border-subtle);
    }
    .section-intro h3 {
      margin: 0 0 var(--space-1);
      color: var(--text-primary);
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
    }
    .section-intro p {
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      line-height: var(--leading-sm);
    }
    .section-body {
      max-width: 38rem;
    }
    .row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-4);
    }
    .choices {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--space-2);
    }
    .services {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .label-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--space-2);
    }
    .counter {
      color: var(--text-muted);
      font-size: var(--font-size-xs);
      font-variant-numeric: tabular-nums;
    }
    .counter.over {
      color: var(--danger-text);
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-2);
      padding-top: var(--space-5);
      border-top: 1px solid var(--border-subtle);
    }
    .spacer {
      flex: 1 1 auto;
    }
    @media (max-width: 720px) {
      :host {
        padding: var(--space-4);
      }
      .section {
        grid-template-columns: minmax(0, 1fr);
        gap: var(--space-4);
      }
      .row,
      .choices,
      .services {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `,
})
export default class Template {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly summary = viewChild("summary", {
    read: ElementRef<HTMLElement>,
  });

  protected readonly roles = [
    "Founder",
    "Product manager",
    "Designer",
    "Engineer",
    "Other",
  ] as const;
  protected readonly sizes = SIZES;
  protected readonly services = SERVICES;

  protected readonly form = this.fb.group({
    contact: this.fb.group({
      name: ["", [Validators.required, Validators.minLength(2)]],
      email: ["", [Validators.required, Validators.email]],
      company: ["", Validators.required],
      phone: ["", Validators.pattern(/^\+?[\d\s()-]{7,20}$/)],
      role: ["", Validators.required],
    }),
    project: this.fb.group({
      title: ["", [Validators.required, Validators.maxLength(60)]],
      budget: [
        null as number | null,
        [Validators.required, Validators.min(5000)],
      ],
      dates: this.fb.group(
        {
          start: ["", Validators.required],
          deadline: ["", Validators.required],
        },
        { validators: datesInOrder },
      ),
      size: ["medium"],
      services: this.fb.group(
        Object.fromEntries(SERVICES.map((s) => [s.id, s.id === "design"])),
        { validators: atLeastOne },
      ),
      brief: [
        "",
        [
          Validators.required,
          Validators.minLength(40),
          Validators.maxLength(500),
        ],
      ],
      website: ["", Validators.pattern(/^https?:\/\/[^\s.]+\.\S+$/)],
    }),
    consent: [false, Validators.requiredTrue],
    nda: [false],
  });

  /** Field paths in page order, with the id of the element an error link focuses. */
  private readonly fields: readonly { path: string; id: string }[] = [
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
  ];

  protected readonly submitted = signal(false);
  protected readonly sent = signal(false);
  protected readonly firstName = signal("");
  /** Bumped on every value or status change, so the computed values below re-run. */
  private readonly revision = signal(0);

  protected readonly errors = computed(() => {
    this.revision();
    return this.fields
      .filter((f) => this.form.get(f.path)?.errors)
      .map((f) => ({ id: f.id, message: this.message(f.path) }));
  });
  protected readonly briefLength = computed(() => {
    this.revision();
    return this.form.controls.project.controls.brief.value.length;
  });

  constructor() {
    this.form.events.subscribe(() => this.revision.update((n) => n + 1));
  }

  /** Show a field's error once it was touched or the form was submitted. */
  protected show(path: string): boolean {
    const c = this.form.get(path);
    return !!c?.errors && (c.touched || this.submitted());
  }

  protected message(path: string): string {
    const e = this.form.get(path)?.errors ?? {};
    const label: Record<string, string> = {
      "contact.name": "your full name",
      "contact.email": "your work email",
      "contact.company": "your company",
      "project.title": "a project name",
      "project.budget": "a budget",
      "project.dates.start": "a start date",
      "project.dates.deadline": "a deadline",
      "project.brief": "a brief",
    };
    if (e["required"] && path === "contact.role") return "Choose your role.";
    if (e["required"]) {
      return path === "consent"
        ? "Allow us to store your details so we can reply."
        : `Enter ${label[path] ?? "a value"}.`;
    }
    if (e["requiredTrue"])
      return "Allow us to store your details so we can reply.";
    if (e["email"]) return "Enter an email address like ada@example.com.";
    if (e["minlength"]) {
      return path === "project.brief"
        ? `Write at least 40 characters (${e["minlength"].actualLength} so far).`
        : "Enter at least 2 characters.";
    }
    if (e["maxlength"]) {
      return `Keep it under ${e["maxlength"].requiredLength} characters.`;
    }
    if (e["min"]) return "The budget must be at least €5,000.";
    if (e["pattern"]) {
      return path === "contact.phone"
        ? "Enter a phone number with digits only, such as +48 600 000 000."
        : "Enter a full address that starts with https://.";
    }
    if (e["order"]) return "The deadline must be after the start date.";
    if (e["none"]) return "Choose at least one service.";
    return "Check this field.";
  }

  protected pickSize(id: string): void {
    const size = this.form.controls.project.controls.size;
    size.setValue(id);
    size.markAsDirty();
  }

  protected focusField(id: string, event: Event): void {
    event.preventDefault();
    this.host.nativeElement.querySelector<HTMLElement>(`#${id}`)?.focus();
  }

  protected submit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      // The summary renders on this change detection pass; focus it right after.
      setTimeout(() => this.summary()?.nativeElement.focus());
      return;
    }
    this.firstName.set(this.form.value.contact?.name?.split(" ")[0] ?? "");
    this.sent.set(true);
  }

  protected reset(): void {
    this.form.reset();
    this.submitted.set(false);
    this.sent.set(false);
  }
}
