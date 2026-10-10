import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from "@angular/core";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_CHOICE_CARD_PARTS } from "@surface-one/angular/choice-card";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SONE_PAGE_HEADER_PARTS } from "@surface-one/angular/page-header";
import { SoneSecretFieldComponent } from "@surface-one/angular/secret-field";
import {
  SoneSegmentedComponent,
  type SegmentOption,
} from "@surface-one/angular/segmented";
import { SoneSelectComponent } from "@surface-one/angular/select";
import { SoneSwitchComponent } from "@surface-one/angular/switch";

interface Preferences {
  displayName: string;
  language: string;
  timezone: string;
  digest: boolean;
  mentions: boolean;
  reminders: boolean;
  theme: string;
  density: string;
  quality: string;
}

interface Choice {
  readonly id: string;
  readonly title: string;
  readonly copy: string;
}

const DEFAULTS: Preferences = {
  displayName: "Ada Park",
  language: "en",
  timezone: "utc+1",
  digest: true,
  mentions: true,
  reminders: false,
  theme: "system",
  density: "comfortable",
  quality: "balanced",
};

@Component({
  selector: "docs-settings-template",
  imports: [
    ...SONE_FIELD_PARTS,
    ...SONE_CHOICE_CARD_PARTS,
    ...SONE_PAGE_HEADER_PARTS,
    SoneBadgeDirective,
    SoneButtonDirective,
    SoneSecretFieldComponent,
    SoneSegmentedComponent,
    SoneSelectComponent,
    SoneSwitchComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div sonePageHeader>
      <div sonePageHeaderContent>
        <p sonePageHeaderEyebrow>Account</p>
        <h2 sonePageHeaderTitle>Settings</h2>
        <p sonePageHeaderDescription>
          Manage your profile, notifications and how the workspace looks.
        </p>
      </div>
      <div sonePageHeaderActions>
        @if (dirty()) {
          <span soneBadge variant="warning">Unsaved changes</span>
        }
      </div>
    </div>

    <div class="sections">
      <!-- Profile -->
      <div class="section" role="group" aria-labelledby="set-profile">
        <div class="section-intro">
          <h3 id="set-profile">Profile</h3>
          <p>How teammates see you across notes and meetings.</p>
        </div>
        <div class="section-body" soneFieldGroup>
          <div soneField>
            <label soneFieldLabel for="set-name">Display name</label>
            <input
              id="set-name"
              type="text"
              autocomplete="off"
              [value]="prefs().displayName"
              (input)="patch({ displayName: $any($event.target).value })"
            />
            <p soneFieldDescription>
              Shown on shared notes and meeting invites.
            </p>
          </div>
          <div soneField>
            <label soneFieldLabel for="set-language">Language</label>
            <sone-select
              selectId="set-language"
              [value]="prefs().language"
              (valueChange)="patch({ language: $event })"
            >
              @for (l of languages; track l.value) {
                <option [value]="l.value">{{ l.label }}</option>
              }
            </sone-select>
            <p soneFieldDescription>
              Used for the interface and for new transcripts.
            </p>
          </div>
          <div soneField>
            <label soneFieldLabel for="set-tz">Time zone</label>
            <sone-select
              selectId="set-tz"
              [value]="prefs().timezone"
              (valueChange)="patch({ timezone: $event })"
            >
              @for (z of timezones; track z.value) {
                <option [value]="z.value">{{ z.label }}</option>
              }
            </sone-select>
          </div>
        </div>
      </div>

      <!-- Notifications -->
      <div class="section" role="group" aria-labelledby="set-notify">
        <div class="section-intro">
          <h3 id="set-notify">Notifications</h3>
          <p>Choose what reaches you outside the app.</p>
        </div>
        <div class="section-body" soneFieldGroup variant="choices">
          <div soneField orientation="horizontal">
            <div soneFieldContent>
              <label soneFieldLabel for="set-digest">Weekly digest</label>
              <p soneFieldDescription>
                A Monday summary of decisions and open tasks.
              </p>
            </div>
            <sone-switch
              inputId="set-digest"
              [checked]="prefs().digest"
              (checkedChange)="patch({ digest: $event })"
            />
          </div>
          <div soneField orientation="horizontal">
            <div soneFieldContent>
              <label soneFieldLabel for="set-mentions">Mentions</label>
              <p soneFieldDescription>
                When someone mentions you in a note or comment.
              </p>
            </div>
            <sone-switch
              inputId="set-mentions"
              [checked]="prefs().mentions"
              (checkedChange)="patch({ mentions: $event })"
            />
          </div>
          <div soneField orientation="horizontal">
            <div soneFieldContent>
              <label soneFieldLabel for="set-reminders">Reminder alerts</label>
              <p soneFieldDescription>
                Ping me 15 minutes before a follow-up is due.
              </p>
            </div>
            <sone-switch
              inputId="set-reminders"
              [checked]="prefs().reminders"
              (checkedChange)="patch({ reminders: $event })"
            />
          </div>
        </div>
      </div>

      <!-- Appearance -->
      <div class="section" role="group" aria-labelledby="set-appearance">
        <div class="section-intro">
          <h3 id="set-appearance">Appearance</h3>
          <p>Applies to this device only.</p>
        </div>
        <div class="section-body" soneFieldGroup>
          <div soneField aria-labelledby="set-theme-label">
            <span soneFieldLabel id="set-theme-label">Theme</span>
            <sone-segmented
              ariaLabel="Theme"
              [options]="themes"
              [value]="prefs().theme"
              (valueChange)="patch({ theme: $event })"
            />
          </div>
          <div soneField aria-labelledby="set-density-label">
            <span soneFieldLabel id="set-density-label">Density</span>
            <div
              soneChoiceGroup
              class="choices"
              aria-labelledby="set-density-label"
            >
              @for (d of densities; track d.id) {
                <button
                  soneChoiceCard
                  type="button"
                  [selected]="prefs().density === d.id"
                  (click)="patch({ density: d.id })"
                >
                  <span soneChoiceCardTitle>{{ d.title }}</span>
                  <span soneChoiceCardDescription>{{ d.copy }}</span>
                  <span soneChoiceCardIndicator></span>
                </button>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Transcription -->
      <div class="section" role="group" aria-labelledby="set-transcription">
        <div class="section-intro">
          <h3 id="set-transcription">Transcription</h3>
          <p>Trade speed for accuracy on new recordings.</p>
        </div>
        <div class="section-body" soneFieldGroup>
          <div soneField aria-labelledby="set-quality-label">
            <span soneFieldLabel id="set-quality-label">Quality</span>
            <div
              soneChoiceGroup
              class="choices choices-3"
              aria-labelledby="set-quality-label"
            >
              @for (q of qualities; track q.id) {
                <button
                  soneChoiceCard
                  type="button"
                  [selected]="prefs().quality === q.id"
                  (click)="patch({ quality: q.id })"
                >
                  <span soneChoiceCardTitle>{{ q.title }}</span>
                  <span soneChoiceCardDescription>{{ q.copy }}</span>
                  <span soneChoiceCardIndicator></span>
                </button>
              }
            </div>
          </div>
          <div class="secret">
            <label soneFieldLabel [for]="secret.inputId"
              >Calendar sync key</label
            >
            <sone-secret-field
              #secret
              ariaLabel="Calendar sync key"
              placeholder="Paste a key"
              help="Stored encrypted on this device. Used to import meeting titles."
              [hasKey]="hasKey()"
              [clearable]="true"
              (save)="hasKey.set(true)"
              (clear)="hasKey.set(false)"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="actions">
      <p class="status" role="status">{{ statusText() }}</p>
      <button
        soneBtn
        variant="outline"
        type="button"
        [disabled]="!dirty()"
        (click)="cancel()"
      >
        Cancel
      </button>
      <button soneBtn type="button" [disabled]="!dirty()" (click)="save()">
        Save changes
      </button>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding: var(--space-6);
    }
    .sections {
      display: grid;
    }
    .section {
      display: grid;
      grid-template-columns: minmax(0, 14rem) minmax(0, 1fr);
      gap: var(--space-6);
      padding: var(--space-6) 0;
      border-top: var(--border-width-thin) solid var(--border-subtle);
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
      max-width: 34rem;
    }
    .secret {
      display: grid;
      gap: var(--space-2);
    }
    .choices {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-2);
    }
    .choices-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: var(--space-2);
      padding-top: var(--space-5);
      border-top: var(--border-width-thin) solid var(--border-subtle);
    }
    .status {
      flex: 1 1 auto;
      margin: 0;
      color: var(--text-muted);
      font-size: var(--font-size-sm);
    }
    @media (max-width: 720px) {
      :host {
        padding: var(--space-4);
      }
      .section {
        grid-template-columns: minmax(0, 1fr);
        gap: var(--space-4);
      }
      .choices,
      .choices-3 {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `,
})
export default class Template {
  protected readonly languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "de", label: "Deutsch" },
    { value: "pl", label: "Polski" },
  ] as const;
  protected readonly timezones = [
    { value: "utc-5", label: "UTC−05:00 · Eastern Time" },
    { value: "utc", label: "UTC±00:00 · Coordinated Universal Time" },
    { value: "utc+1", label: "UTC+01:00 · Central European Time" },
    { value: "utc+9", label: "UTC+09:00 · Japan Standard Time" },
  ] as const;
  protected readonly themes: readonly SegmentOption[] = [
    { value: "light", label: "Light", icon: "sun" },
    { value: "dark", label: "Dark", icon: "moon" },
    { value: "system", label: "System", icon: "display" },
  ];
  protected readonly densities: readonly Choice[] = [
    {
      id: "comfortable",
      title: "Comfortable",
      copy: "Roomy rows, easier to scan.",
    },
    { id: "compact", title: "Compact", copy: "Fits more on screen." },
  ];
  protected readonly qualities: readonly Choice[] = [
    { id: "fast", title: "Fast", copy: "Ready in seconds." },
    {
      id: "balanced",
      title: "Balanced",
      copy: "Recommended for most meetings.",
    },
    { id: "accurate", title: "Accurate", copy: "Best for names and jargon." },
  ];

  private readonly saved = signal<Preferences>(DEFAULTS);
  protected readonly prefs = signal<Preferences>(DEFAULTS);
  protected readonly hasKey = signal<boolean | null>(false);
  protected readonly savedOnce = signal(false);

  protected readonly dirty = computed(() => {
    const a = this.prefs();
    const b = this.saved();
    return (Object.keys(a) as (keyof Preferences)[]).some((k) => a[k] !== b[k]);
  });
  protected readonly statusText = computed(() =>
    this.dirty()
      ? "You have unsaved changes."
      : this.savedOnce()
        ? "All changes saved."
        : "",
  );

  protected patch(change: Partial<Preferences>): void {
    this.prefs.update((p) => ({ ...p, ...change }));
  }

  protected save(): void {
    this.saved.set(this.prefs());
    this.savedOnce.set(true);
  }

  protected cancel(): void {
    this.prefs.set(this.saved());
  }
}
