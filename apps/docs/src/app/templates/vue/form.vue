<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
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
} from "@surface-one/vue";

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

const form = ref(initial());
const touched = ref<Partial<Record<Path, boolean>>>({});
const dirty = ref(false);
const submitted = ref(false);
const sent = ref(false);
const firstName = ref("");
const root = ref<HTMLElement | null>(null);
const summary = ref<InstanceType<typeof SoneAlert> | null>(null);

/** The message for every invalid field (null when it is valid). */
const messages = computed<Record<Path, string | null>>(() => {
  const { contact: c, project: p, consent } = form.value;
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
});

const errors = computed(() =>
  FIELDS.filter((f) => messages.value[f.path]).map((f) => ({
    id: f.id,
    message: messages.value[f.path]!,
  })),
);

/** Show a field's error once it was touched (blurred) or the form was submitted. */
const show = (path: Path): boolean =>
  !!messages.value[path] && (!!touched.value[path] || submitted.value);

function touch(...paths: Path[]): void {
  for (const path of paths) touched.value[path] = true;
}

function pickSize(id: string): void {
  form.value.project.size = id;
  dirty.value = true;
}

function focusField(id: string): void {
  root.value?.querySelector<HTMLElement>(`#${id}`)?.focus();
}

async function submit(): Promise<void> {
  submitted.value = true;
  if (errors.value.length) {
    // The summary renders on the next tick; focus it right after.
    await nextTick();
    (summary.value?.$el as HTMLElement | undefined)?.focus();
    return;
  }
  firstName.value = form.value.contact.name.split(" ")[0] ?? "";
  sent.value = true;
}

function reset(): void {
  form.value = initial();
  touched.value = {};
  dirty.value = false;
  submitted.value = false;
  sent.value = false;
}
</script>

<template>
  <div ref="root" class="request">
    <SonePageHeader as="div">
      <SonePageHeaderContent>
        <SonePageHeaderEyebrow>Northwind Studio</SonePageHeaderEyebrow>
        <SonePageHeaderTitle as="h2">Start a project</SonePageHeaderTitle>
        <SonePageHeaderDescription>
          Tell us about the work. Fields marked
          <span aria-hidden="true">*</span><span class="sr-only">required</span>
          are required; we reply within two working days.
        </SonePageHeaderDescription>
      </SonePageHeaderContent>
    </SonePageHeader>

    <SoneAlert v-if="sent" variant="success" role="status" class="summary">
      <SoneAlertTitle
        >Request sent — thank you, {{ firstName }}!</SoneAlertTitle
      >
      <SoneAlertDescription>
        We emailed a copy to {{ form.contact.email }}.
      </SoneAlertDescription>
      <SoneAlertAction>
        <SoneButton variant="outline" size="sm" type="button" @click="reset">
          Start another
        </SoneButton>
      </SoneAlertAction>
    </SoneAlert>

    <SoneAlert
      v-if="submitted && errors.length"
      ref="summary"
      variant="destructive"
      role="alert"
      tabindex="-1"
      class="summary"
      aria-labelledby="form-summary-title"
    >
      <SoneAlertTitle id="form-summary-title">
        There
        {{
          errors.length === 1
            ? "is a problem"
            : "are " + errors.length + " problems"
        }}
        with the request
      </SoneAlertTitle>
      <SoneAlertDescription as="div">
        <ul class="summary-list">
          <li v-for="e in errors" :key="e.id">
            <a :href="'#' + e.id" @click.prevent="focusField(e.id)">{{
              e.message
            }}</a>
          </li>
        </ul>
      </SoneAlertDescription>
    </SoneAlert>

    <form
      novalidate
      @submit.prevent="submit"
      @input="dirty = true"
      @change="dirty = true"
    >
      <!-- Contact -->
      <div class="section" role="group" aria-labelledby="form-contact">
        <div class="section-intro">
          <h3 id="form-contact">Contact</h3>
          <p>Who we should talk to about this project.</p>
        </div>
        <SoneFieldGroup class="section-body">
          <div class="form-row">
            <SoneField :invalid="show('contact.name')">
              <SoneFieldLabel for="form-name">Full name *</SoneFieldLabel>
              <input
                id="form-name"
                v-model="form.contact.name"
                type="text"
                autocomplete="name"
                @blur="touch('contact.name')"
              />
              <SoneFieldError v-if="show('contact.name')">{{
                messages["contact.name"]
              }}</SoneFieldError>
            </SoneField>
            <SoneField :invalid="show('contact.email')">
              <SoneFieldLabel for="form-email">Work email *</SoneFieldLabel>
              <input
                id="form-email"
                v-model="form.contact.email"
                type="email"
                autocomplete="email"
                @blur="touch('contact.email')"
              />
              <SoneFieldError v-if="show('contact.email')">{{
                messages["contact.email"]
              }}</SoneFieldError>
            </SoneField>
          </div>
          <div class="form-row">
            <SoneField :invalid="show('contact.company')">
              <SoneFieldLabel for="form-company">Company *</SoneFieldLabel>
              <input
                id="form-company"
                v-model="form.contact.company"
                type="text"
                autocomplete="organization"
                @blur="touch('contact.company')"
              />
              <SoneFieldError v-if="show('contact.company')">{{
                messages["contact.company"]
              }}</SoneFieldError>
            </SoneField>
            <SoneField :invalid="show('contact.phone')">
              <SoneFieldLabel for="form-phone">Phone</SoneFieldLabel>
              <input
                id="form-phone"
                v-model="form.contact.phone"
                type="tel"
                autocomplete="tel"
                placeholder="+48 600 000 000"
                @blur="touch('contact.phone')"
              />
              <SoneFieldError v-if="show('contact.phone')">{{
                messages["contact.phone"]
              }}</SoneFieldError>
              <SoneFieldDescription v-else
                >Optional — for a quick call.</SoneFieldDescription
              >
            </SoneField>
          </div>
          <SoneField :invalid="show('contact.role')">
            <SoneFieldLabel for="form-role">Your role *</SoneFieldLabel>
            <SoneSelect
              v-model="form.contact.role"
              select-id="form-role"
              :invalid="show('contact.role')"
              @blur="touch('contact.role')"
            >
              <option value="" disabled>Choose a role</option>
              <option v-for="r in ROLES" :key="r" :value="r">{{ r }}</option>
            </SoneSelect>
            <SoneFieldError v-if="show('contact.role')">{{
              messages["contact.role"]
            }}</SoneFieldError>
          </SoneField>
        </SoneFieldGroup>
      </div>

      <!-- Project -->
      <div class="section" role="group" aria-labelledby="form-project">
        <div class="section-intro">
          <h3 id="form-project">Project</h3>
          <p>The goal, the budget and the dates you have in mind.</p>
        </div>
        <SoneFieldGroup class="section-body">
          <SoneField :invalid="show('project.title')">
            <SoneFieldLabel for="form-title">Project name *</SoneFieldLabel>
            <input
              id="form-title"
              v-model="form.project.title"
              type="text"
              @blur="touch('project.title')"
            />
            <SoneFieldError v-if="show('project.title')">{{
              messages["project.title"]
            }}</SoneFieldError>
          </SoneField>
          <SoneField :invalid="show('project.budget')">
            <SoneFieldLabel for="form-budget">Budget *</SoneFieldLabel>
            <SoneInputGroup :invalid="show('project.budget')">
              <SoneInputGroupAddon as="span"
                ><SoneInputGroupText>€</SoneInputGroupText></SoneInputGroupAddon
              >
              <SoneInputGroupInput
                id="form-budget"
                v-model="form.project.budget"
                type="number"
                inputmode="numeric"
                min="5000"
                step="1000"
                @blur="touch('project.budget')"
              />
              <SoneInputGroupAddon as="span" align="inline-end"
                ><SoneInputGroupText
                  >EUR</SoneInputGroupText
                ></SoneInputGroupAddon
              >
            </SoneInputGroup>
            <SoneFieldError v-if="show('project.budget')">{{
              messages["project.budget"]
            }}</SoneFieldError>
            <SoneFieldDescription v-else
              >Projects start at €5,000.</SoneFieldDescription
            >
          </SoneField>
          <div class="form-row">
            <SoneField :invalid="show('project.dates.start')">
              <SoneFieldLabel for="form-start">Start date *</SoneFieldLabel>
              <input
                id="form-start"
                v-model="form.project.start"
                type="date"
                @blur="touch('project.dates.start', 'project.dates')"
              />
              <SoneFieldError v-if="show('project.dates.start')">{{
                messages["project.dates.start"]
              }}</SoneFieldError>
            </SoneField>
            <SoneField
              :invalid="show('project.dates.deadline') || show('project.dates')"
            >
              <SoneFieldLabel for="form-deadline">Deadline *</SoneFieldLabel>
              <input
                id="form-deadline"
                v-model="form.project.deadline"
                type="date"
                @blur="touch('project.dates.deadline', 'project.dates')"
              />
              <SoneFieldError v-if="show('project.dates.deadline')">{{
                messages["project.dates.deadline"]
              }}</SoneFieldError>
              <SoneFieldError v-else-if="show('project.dates')">{{
                messages["project.dates"]
              }}</SoneFieldError>
            </SoneField>
          </div>
          <SoneField aria-labelledby="form-size-label">
            <SoneFieldLabel as="span" id="form-size-label"
              >People who will use it</SoneFieldLabel
            >
            <SoneChoiceGroup class="choices" aria-labelledby="form-size-label">
              <SoneChoiceCard
                v-for="s in SIZES"
                :key="s.id"
                type="button"
                :selected="form.project.size === s.id"
                @click="pickSize(s.id)"
              >
                <SoneChoiceCardTitle>{{ s.title }}</SoneChoiceCardTitle>
                <SoneChoiceCardDescription>{{
                  s.copy
                }}</SoneChoiceCardDescription>
                <SoneChoiceCardIndicator />
              </SoneChoiceCard>
            </SoneChoiceGroup>
          </SoneField>
          <SoneFieldSet
            :aria-describedby="
              show('project.services') ? 'form-services-error' : undefined
            "
          >
            <SoneFieldLegend variant="label" id="form-services"
              >Services you need *</SoneFieldLegend
            >
            <SoneFieldGroup variant="choices" class="services">
              <SoneField
                v-for="s in SERVICES"
                :key="s.id"
                orientation="horizontal"
              >
                <input
                  :id="'form-service-' + s.id"
                  v-model="form.project.services[s.id]"
                  type="checkbox"
                  @blur="touch('project.services')"
                />
                <SoneFieldLabel :for="'form-service-' + s.id">{{
                  s.label
                }}</SoneFieldLabel>
              </SoneField>
            </SoneFieldGroup>
            <SoneFieldError
              v-if="show('project.services')"
              id="form-services-error"
              >{{ messages["project.services"] }}</SoneFieldError
            >
          </SoneFieldSet>
          <SoneField :invalid="show('project.brief')">
            <div class="label-row">
              <SoneFieldLabel for="form-brief">Brief *</SoneFieldLabel>
              <span
                class="counter"
                :class="{ over: form.project.brief.length > 500 }"
                aria-hidden="true"
                >{{ form.project.brief.length }} / 500</span
              >
            </div>
            <textarea
              id="form-brief"
              v-model="form.project.brief"
              rows="5"
              placeholder="What problem are you solving, and for whom?"
              @blur="touch('project.brief')"
            ></textarea>
            <SoneFieldError v-if="show('project.brief')">{{
              messages["project.brief"]
            }}</SoneFieldError>
            <SoneFieldDescription v-else
              >Between 40 and 500 characters.</SoneFieldDescription
            >
          </SoneField>
          <SoneField :invalid="show('project.website')">
            <SoneFieldLabel for="form-website">Current website</SoneFieldLabel>
            <input
              id="form-website"
              v-model="form.project.website"
              type="url"
              placeholder="https://"
              @blur="touch('project.website')"
            />
            <SoneFieldError v-if="show('project.website')">{{
              messages["project.website"]
            }}</SoneFieldError>
          </SoneField>
        </SoneFieldGroup>
      </div>

      <!-- Consent -->
      <div class="section" role="group" aria-labelledby="form-consent">
        <div class="section-intro">
          <h3 id="form-consent">Consent</h3>
          <p>How we may use the details above.</p>
        </div>
        <SoneFieldGroup class="section-body" variant="choices">
          <SoneField orientation="horizontal" :invalid="show('consent')">
            <input
              id="form-consent-check"
              v-model="form.consent"
              type="checkbox"
              @blur="touch('consent')"
            />
            <SoneFieldContent>
              <SoneFieldLabel for="form-consent-check"
                >Northwind may store these details to answer my request
                *</SoneFieldLabel
              >
              <SoneFieldError v-if="show('consent')">{{
                messages.consent
              }}</SoneFieldError>
            </SoneFieldContent>
          </SoneField>
          <SoneField orientation="horizontal">
            <input id="form-nda" v-model="form.nda" type="checkbox" />
            <SoneFieldContent>
              <SoneFieldLabel for="form-nda"
                >Send me an NDA before the first call</SoneFieldLabel
              >
              <SoneFieldDescription
                >We sign before you share anything
                confidential.</SoneFieldDescription
              >
            </SoneFieldContent>
          </SoneField>
        </SoneFieldGroup>
      </div>

      <div class="actions">
        <SoneBadge v-if="dirty && !sent" variant="secondary">Draft</SoneBadge>
        <span class="spacer"></span>
        <SoneButton variant="ghost" type="button" @click="reset"
          >Clear</SoneButton
        >
        <SoneButton type="submit">Send request</SoneButton>
      </div>
    </form>
  </div>
</template>

<style scoped>
.request {
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
.form-row {
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
  .request {
    padding: var(--space-4);
  }
  .section {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-4);
  }
  .form-row,
  .choices,
  .services {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
