"use client";

import { useState } from "react";
import {
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
  SoneFieldGroup,
  SoneFieldLabel,
  SoneInputGroup,
  SoneInputGroupAddon,
  SoneInputGroupInput,
  SonePageHeader,
  SonePageHeaderActions,
  SonePageHeaderContent,
  SonePageHeaderDescription,
  SonePageHeaderEyebrow,
  SonePageHeaderTitle,
  SoneSegmented,
  SoneSelect,
  SoneSwitch,
  type SegmentOption,
} from "@surface-one/react";

import { type Preferences, type Choice, DEFAULTS } from "../data/settings";

// The shared stylesheet (../styles/settings.css + settings.twins.css), prefixed with .tpl-settings.
import { css } from "../styles/scoped/settings.generated";

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "de", label: "Deutsch" },
  { value: "pl", label: "Polski" },
] as const;
const timezones = [
  { value: "utc-5", label: "UTC−05:00 · Eastern Time" },
  { value: "utc", label: "UTC±00:00 · Coordinated Universal Time" },
  { value: "utc+1", label: "UTC+01:00 · Central European Time" },
  { value: "utc+9", label: "UTC+09:00 · Japan Standard Time" },
] as const;
const themes: readonly SegmentOption[] = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "system", label: "System", icon: "display" },
];
const densities: readonly Choice[] = [
  {
    id: "comfortable",
    title: "Comfortable",
    copy: "Roomy rows, easier to scan.",
  },
  { id: "compact", title: "Compact", copy: "Fits more on screen." },
];
const qualities: readonly Choice[] = [
  { id: "fast", title: "Fast", copy: "Ready in seconds." },
  {
    id: "balanced",
    title: "Balanced",
    copy: "Recommended for most meetings.",
  },
  { id: "accurate", title: "Accurate", copy: "Best for names and jargon." },
];

export default function SettingsTemplate() {
  const [saved, setSaved] = useState<Preferences>(DEFAULTS);
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);
  const [hasKey, setHasKey] = useState<boolean | null>(false);
  const [savedOnce, setSavedOnce] = useState(false);
  // The calendar sync key field (see the markup).
  const [keyDraft, setKeyDraft] = useState("");

  const dirty = (Object.keys(prefs) as (keyof Preferences)[]).some(
    (k) => prefs[k] !== saved[k],
  );
  const statusText = dirty
    ? "You have unsaved changes."
    : savedOnce
      ? "All changes saved."
      : "";

  function update<K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
  ): void {
    setPrefs((p) => ({ ...p, [key]: value }));
  }

  function save(): void {
    setSaved({ ...prefs });
    setSavedOnce(true);
  }

  function cancel(): void {
    setPrefs({ ...saved });
  }

  function saveKey(): void {
    if (!keyDraft.trim()) return;
    // A real app hands the key to secure storage here, never logs it.
    setHasKey(true);
    setKeyDraft("");
  }

  return (
    <div className="settings tpl-settings">
      <style>{css}</style>
      <SonePageHeader as="div">
        <SonePageHeaderContent>
          <SonePageHeaderEyebrow>Account</SonePageHeaderEyebrow>
          <SonePageHeaderTitle as="h2">Settings</SonePageHeaderTitle>
          <SonePageHeaderDescription>
            Manage your profile, notifications and how the workspace looks.
          </SonePageHeaderDescription>
        </SonePageHeaderContent>
        <SonePageHeaderActions>
          {dirty && <SoneBadge variant="warning">Unsaved changes</SoneBadge>}
        </SonePageHeaderActions>
      </SonePageHeader>

      <div className="sections">
        {/* Profile */}
        <div className="section" role="group" aria-labelledby="set-profile">
          <div className="section-intro">
            <h3 id="set-profile">Profile</h3>
            <p>How teammates see you across notes and meetings.</p>
          </div>
          <SoneFieldGroup className="section-body">
            <SoneField>
              <SoneFieldLabel htmlFor="set-name">Display name</SoneFieldLabel>
              <input
                id="set-name"
                type="text"
                autoComplete="off"
                value={prefs.displayName}
                onChange={(e) => update("displayName", e.target.value)}
              />
              <SoneFieldDescription>
                Shown on shared notes and meeting invites.
              </SoneFieldDescription>
            </SoneField>
            <SoneField>
              <SoneFieldLabel htmlFor="set-language">Language</SoneFieldLabel>
              <SoneSelect
                value={prefs.language}
                onValueChange={(v) => update("language", v)}
                selectId="set-language"
              >
                {languages.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </SoneSelect>
              <SoneFieldDescription>
                Used for the interface and for new transcripts.
              </SoneFieldDescription>
            </SoneField>
            <SoneField>
              <SoneFieldLabel htmlFor="set-tz">Time zone</SoneFieldLabel>
              <SoneSelect
                value={prefs.timezone}
                onValueChange={(v) => update("timezone", v)}
                selectId="set-tz"
              >
                {timezones.map((z) => (
                  <option key={z.value} value={z.value}>
                    {z.label}
                  </option>
                ))}
              </SoneSelect>
            </SoneField>
          </SoneFieldGroup>
        </div>

        {/* Notifications */}
        <div className="section" role="group" aria-labelledby="set-notify">
          <div className="section-intro">
            <h3 id="set-notify">Notifications</h3>
            <p>Choose what reaches you outside the app.</p>
          </div>
          <SoneFieldGroup className="section-body" variant="choices">
            <SoneField orientation="horizontal">
              <SoneFieldContent>
                <SoneFieldLabel htmlFor="set-digest">
                  Weekly digest
                </SoneFieldLabel>
                <SoneFieldDescription>
                  A Monday summary of decisions and open tasks.
                </SoneFieldDescription>
              </SoneFieldContent>
              <SoneSwitch
                checked={prefs.digest}
                onCheckedChange={(v) => update("digest", v)}
                inputId="set-digest"
              />
            </SoneField>
            <SoneField orientation="horizontal">
              <SoneFieldContent>
                <SoneFieldLabel htmlFor="set-mentions">Mentions</SoneFieldLabel>
                <SoneFieldDescription>
                  When someone mentions you in a note or comment.
                </SoneFieldDescription>
              </SoneFieldContent>
              <SoneSwitch
                checked={prefs.mentions}
                onCheckedChange={(v) => update("mentions", v)}
                inputId="set-mentions"
              />
            </SoneField>
            <SoneField orientation="horizontal">
              <SoneFieldContent>
                <SoneFieldLabel htmlFor="set-reminders">
                  Reminder alerts
                </SoneFieldLabel>
                <SoneFieldDescription>
                  Ping me 15 minutes before a follow-up is due.
                </SoneFieldDescription>
              </SoneFieldContent>
              <SoneSwitch
                checked={prefs.reminders}
                onCheckedChange={(v) => update("reminders", v)}
                inputId="set-reminders"
              />
            </SoneField>
          </SoneFieldGroup>
        </div>

        {/* Appearance */}
        <div className="section" role="group" aria-labelledby="set-appearance">
          <div className="section-intro">
            <h3 id="set-appearance">Appearance</h3>
            <p>Applies to this device only.</p>
          </div>
          <SoneFieldGroup className="section-body">
            <SoneField aria-labelledby="set-theme-label">
              <SoneFieldLabel as="span" id="set-theme-label">
                Theme
              </SoneFieldLabel>
              <SoneSegmented
                value={prefs.theme}
                onValueChange={(v) => update("theme", v)}
                ariaLabel="Theme"
                options={themes}
              />
            </SoneField>
            <SoneField aria-labelledby="set-density-label">
              <SoneFieldLabel as="span" id="set-density-label">
                Density
              </SoneFieldLabel>
              <SoneChoiceGroup
                className="choices"
                aria-labelledby="set-density-label"
              >
                {densities.map((d) => (
                  <SoneChoiceCard
                    key={d.id}
                    type="button"
                    selected={prefs.density === d.id}
                    onClick={() => update("density", d.id)}
                  >
                    <SoneChoiceCardTitle>{d.title}</SoneChoiceCardTitle>
                    <SoneChoiceCardDescription>
                      {d.copy}
                    </SoneChoiceCardDescription>
                    <SoneChoiceCardIndicator />
                  </SoneChoiceCard>
                ))}
              </SoneChoiceGroup>
            </SoneField>
          </SoneFieldGroup>
        </div>

        {/* Transcription */}
        <div
          className="section"
          role="group"
          aria-labelledby="set-transcription"
        >
          <div className="section-intro">
            <h3 id="set-transcription">Transcription</h3>
            <p>Trade speed for accuracy on new recordings.</p>
          </div>
          <SoneFieldGroup className="section-body">
            <SoneField aria-labelledby="set-quality-label">
              <SoneFieldLabel as="span" id="set-quality-label">
                Quality
              </SoneFieldLabel>
              <SoneChoiceGroup
                className="choices choices-3"
                aria-labelledby="set-quality-label"
              >
                {qualities.map((q) => (
                  <SoneChoiceCard
                    key={q.id}
                    type="button"
                    selected={prefs.quality === q.id}
                    onClick={() => update("quality", q.id)}
                  >
                    <SoneChoiceCardTitle>{q.title}</SoneChoiceCardTitle>
                    <SoneChoiceCardDescription>
                      {q.copy}
                    </SoneChoiceCardDescription>
                    <SoneChoiceCardIndicator />
                  </SoneChoiceCard>
                ))}
              </SoneChoiceGroup>
            </SoneField>
            <div className="secret">
              <SoneFieldLabel htmlFor="set-sync-key">
                Calendar sync key
              </SoneFieldLabel>
              {/* No React secret field yet: the same markup and classes as <sone-secret-field>. */}
              <div
                data-slot="secret-field"
                data-state={
                  hasKey === null ? "unknown" : hasKey ? "set" : "unset"
                }
              >
                <SoneField>
                  {hasKey !== null && (
                    <div
                      className="secret-status"
                      data-slot="secret-field-status"
                    >
                      <span className="text-secondary">Status</span>
                      {hasKey ? (
                        <SoneBadge variant="success">
                          <span className="badge-dot"></span>
                          Key set ✓
                        </SoneBadge>
                      ) : (
                        <SoneBadge variant="outline">
                          <span className="badge-dot"></span>
                          Not set
                        </SoneBadge>
                      )}
                    </div>
                  )}
                  <SoneInputGroup>
                    <SoneInputGroupInput
                      id="set-sync-key"
                      value={keyDraft}
                      onValueChange={setKeyDraft}
                      type="password"
                      placeholder="Paste a key"
                      aria-label="Calendar sync key"
                      autoComplete="off"
                      spellCheck="false"
                    />
                    <SoneInputGroupAddon align="inline-end">
                      <SoneButton
                        variant="ghost"
                        size="xs"
                        type="button"
                        disabled={!keyDraft.trim()}
                        onClick={saveKey}
                      >
                        Save key
                      </SoneButton>
                      {hasKey && (
                        <SoneButton
                          variant="ghost"
                          size="xs"
                          type="button"
                          onClick={() => setHasKey(false)}
                        >
                          Clear
                        </SoneButton>
                      )}
                    </SoneInputGroupAddon>
                  </SoneInputGroup>
                  <SoneFieldDescription>
                    Stored encrypted on this device. Used to import meeting
                    titles.
                  </SoneFieldDescription>
                </SoneField>
              </div>
            </div>
          </SoneFieldGroup>
        </div>
      </div>

      <div className="actions">
        <p className="status" role="status">
          {statusText}
        </p>
        <SoneButton
          variant="outline"
          type="button"
          disabled={!dirty}
          onClick={cancel}
        >
          Cancel
        </SoneButton>
        <SoneButton type="button" disabled={!dirty} onClick={save}>
          Save changes
        </SoneButton>
      </div>
    </div>
  );
}
