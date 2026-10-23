import { useEffect, useState } from "react";

import {
  SoneAlert,
  SoneAlertDescription,
  SoneAlertDialog,
  SoneAlertTitle,
  SoneAvatar,
  SoneAvatarFallback,
  SoneBadge,
  SoneBanner,
  SoneButton,
  SoneButtonGroup,
  SoneCard,
  SoneCardContent,
  SoneCardDescription,
  SoneCardFooter,
  SoneCardHeader,
  SoneCardTitle,
  SoneChoiceCard,
  SoneChoiceCardDescription,
  SoneChoiceCardIndicator,
  SoneChoiceCardTitle,
  SoneChoiceGroup,
  SoneDialog,
  SoneDialogDescription,
  SoneDialogFooter,
  SoneDialogHeader,
  SoneDialogTitle,
  SoneDisclosure,
  SoneEmpty,
  SoneEmptyDescription,
  SoneEmptyHeader,
  SoneEmptyMedia,
  SoneEmptyTitle,
  SoneField,
  SoneFieldDescription,
  SoneFieldError,
  SoneFieldLabel,
  SoneIcon,
  SoneInputGroup,
  SoneInputGroupAddon,
  SoneInputGroupInput,
  SoneItem,
  SoneItemContent,
  SoneItemDescription,
  SoneItemMedia,
  SoneItemTitle,
  SoneKbd,
  SoneKbdGroup,
  SoneLogo,
  SoneMeter,
  SonePageHeader,
  SonePageHeaderActions,
  SonePageHeaderContent,
  SonePageHeaderDescription,
  SonePageHeaderEyebrow,
  SonePageHeaderTitle,
  SoneProgress,
  SoneSegmented,
  SoneSelect,
  SoneSeparator,
  SoneSheet,
  SoneSheetDescription,
  SoneSheetHeader,
  SoneSheetTitle,
  SoneSkeleton,
  SoneSlider,
  SoneSpinner,
  SoneSwitch,
  SoneTable,
  SoneTabsList,
  SoneTabsTrigger,
  SoneTooltip,
  VERSION,
  type SegmentOption,
  type SoneTableColumn,
} from "@surface-one/react";

interface Workspace {
  readonly id: number;
  readonly name: string;
  readonly seats: number;
  readonly status: string;
}

const SKINS: readonly SegmentOption[] = [
  { value: "studio", label: "Studio" },
  { value: "paper", label: "Paper" },
  { value: "minimalist", label: "Minimalist" },
  { value: "neumorphism", label: "Neumorphism" },
  { value: "material", label: "Material" },
  { value: "surface", label: "Surface" },
  { value: "airy", label: "Airy" },
];

const THEMES: readonly SegmentOption[] = [
  { value: "light", label: "Light", icon: "sun", iconOnly: true },
  { value: "dark", label: "Dark", icon: "moon", iconOnly: true },
];

const TABS = ["overview", "usage", "billing"] as const;
const TIERS = ["Starter", "Team", "Enterprise"] as const;
const PLANS = ["starter", "team", "enterprise"] as const;

const ROWS: readonly Workspace[] = [
  { id: 1, name: "Studio", seats: 12, status: "Active" },
  { id: 2, name: "Paper", seats: 4, status: "Trial" },
  { id: 3, name: "Minimalist", seats: 30, status: "Active" },
];

const COLUMNS: readonly SoneTableColumn<Workspace>[] = [
  { key: "name", header: "Workspace" },
  { key: "seats", header: "Seats", alignEnd: true },
  {
    key: "status",
    header: "Status",
    cell: (row) => (
      <SoneBadge variant={row.status === "Active" ? "success" : "secondary"}>
        {row.status}
      </SoneBadge>
    ),
  },
];

export function App() {
  const [skin, setSkin] = useState("studio");
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    document.documentElement.dataset["skin"] = skin;
    document.documentElement.dataset["theme"] = theme;
  }, [skin, theme]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [notify, setNotify] = useState(true);
  const [plan, setPlan] = useState("team");
  const [volume, setVolume] = useState(40);
  const billing = "yearly";
  const [tab, setTab] = useState("overview");
  const [country, setCountry] = useState("pl");

  return (
    <main className="pg">
      <div className="pg-bar">
        <div className="pg-row">
          <SoneLogo label="SurfaceOne" size="sm" />
          <strong>SurfaceOne · React</strong>
          <SoneBadge variant="accent">{VERSION}</SoneBadge>
        </div>
        <div className="pg-row">
          <SoneSegmented
            value={skin}
            onValueChange={setSkin}
            ariaLabel="Skin"
            size="sm"
            options={SKINS}
          />
          <SoneSegmented
            value={theme}
            onValueChange={setTheme}
            ariaLabel="Theme"
            size="sm"
            options={THEMES}
          />
        </div>
      </div>

      <SonePageHeader>
        <SonePageHeaderContent>
          <SonePageHeaderEyebrow>Design system</SonePageHeaderEyebrow>
          <SonePageHeaderTitle>
            Build landing pages with SurfaceOne
          </SonePageHeaderTitle>
          <SonePageHeaderDescription>
            The same tokens, skins and component styles as the Angular package —
            now as React 19 and Next.js components.
          </SonePageHeaderDescription>
        </SonePageHeaderContent>
        <SonePageHeaderActions>
          <SoneButton variant="outline" as="a" href="#pricing">
            Pricing
          </SoneButton>
          <SoneButton onClick={() => setDialogOpen(true)}>
            <SoneIcon icon="sparkles" inline="start" />
            Get started
          </SoneButton>
        </SonePageHeaderActions>
      </SonePageHeader>

      <SoneBanner kind="success">
        Everything below renders from <code>@surface-one/react</code>.
      </SoneBanner>

      <section className="pg-section">
        <h2>Buttons &amp; badges</h2>
        <div className="pg-row">
          <SoneButton>Default</SoneButton>
          <SoneButton variant="secondary">Secondary</SoneButton>
          <SoneButton variant="outline">Outline</SoneButton>
          <SoneButton variant="ghost">Ghost</SoneButton>
          <SoneButton variant="destructive">Destructive</SoneButton>
          <SoneButton variant="link">Link</SoneButton>
          <SoneTooltip text="Settings">
            <SoneButton size="icon" aria-label="Settings">
              <SoneIcon icon="settings" />
            </SoneButton>
          </SoneTooltip>
          <SoneButton as="a" href="#" aria-disabled="true">
            Disabled link
          </SoneButton>
          <SoneButtonGroup>
            <SoneButton variant="outline">Day</SoneButton>
            <SoneButton variant="outline">Week</SoneButton>
            <SoneButton variant="outline">Month</SoneButton>
          </SoneButtonGroup>
        </div>
        <div className="pg-row">
          <SoneBadge>Default</SoneBadge>
          <SoneBadge variant="secondary">Secondary</SoneBadge>
          <SoneBadge variant="outline">Outline</SoneBadge>
          <SoneBadge variant="success">Success</SoneBadge>
          <SoneBadge variant="warning">Warning</SoneBadge>
          <SoneBadge variant="destructive">Destructive</SoneBadge>
          <SoneBadge variant="live">Live</SoneBadge>
          <SoneKbdGroup>
            <SoneKbd>⌘</SoneKbd>
            <SoneKbd>K</SoneKbd>
          </SoneKbdGroup>
          <SoneSpinner />
        </div>
      </section>

      <section id="pricing" className="pg-section">
        <h2>Cards</h2>
        <SoneTabsList role="tablist" aria-label="Billing">
          {TABS.map((t) => (
            <SoneTabsTrigger
              key={t}
              role="tab"
              active={tab === t}
              onClick={() => setTab(t)}
            >
              {t}
            </SoneTabsTrigger>
          ))}
        </SoneTabsList>
        <div className="pg-grid">
          {TIERS.map((tier) => (
            <SoneCard key={tier}>
              <SoneCardHeader>
                <SoneCardTitle>{tier}</SoneCardTitle>
                <SoneCardDescription>
                  For teams that ship every week.
                </SoneCardDescription>
              </SoneCardHeader>
              <SoneCardContent>
                <SoneMeter
                  label="Fit"
                  value={tier === "Team" ? 4 : 2}
                  detail="for 10 seats"
                />
              </SoneCardContent>
              <SoneCardFooter>
                <SoneButton variant={tier === "Team" ? "default" : "outline"}>
                  Choose {tier}
                </SoneButton>
              </SoneCardFooter>
            </SoneCard>
          ))}
        </div>
      </section>

      <section className="pg-section">
        <h2>Form</h2>
        <div className="pg-grid">
          <div className="pg-stack">
            <SoneField invalid={emailInvalid}>
              <SoneFieldLabel htmlFor="email">Work email</SoneFieldLabel>
              <SoneInputGroup invalid={emailInvalid}>
                <SoneInputGroupAddon>
                  <SoneIcon icon="link" />
                </SoneInputGroupAddon>
                <SoneInputGroupInput
                  id="email"
                  value={email}
                  onValueChange={setEmail}
                  type="email"
                  placeholder="you@company.com"
                />
              </SoneInputGroup>
              <SoneFieldDescription>We never share it.</SoneFieldDescription>
              {emailInvalid && (
                <SoneFieldError>Enter a valid email.</SoneFieldError>
              )}
            </SoneField>
            <SoneButton
              variant="outline"
              onClick={() => setEmailInvalid(!email.includes("@"))}
            >
              Validate
            </SoneButton>
            <SoneField orientation="horizontal">
              <SoneSwitch
                checked={notify}
                onCheckedChange={setNotify}
                inputId="notify"
              />
              <SoneFieldLabel htmlFor="notify">
                Product updates ({notify ? "on" : "off"})
              </SoneFieldLabel>
            </SoneField>
            <SoneField>
              <SoneFieldLabel htmlFor="country">Country</SoneFieldLabel>
              <SoneSelect
                value={country}
                onValueChange={setCountry}
                selectId="country"
              >
                <option value="pl">Poland</option>
                <option value="de">Germany</option>
                <option value="es">Spain</option>
              </SoneSelect>
            </SoneField>
            <SoneSlider
              value={volume}
              onValueChange={setVolume}
              ariaLabel="Volume"
            />
            <SoneProgress value={volume} aria-label="Volume level" />
            <SoneProgress aria-label="Loading" />
          </div>
          <SoneChoiceGroup aria-label="Plan" className="pg-stack">
            {PLANS.map((p) => (
              <SoneChoiceCard
                key={p}
                selected={plan === p}
                onClick={() => setPlan(p)}
              >
                <SoneChoiceCardTitle>{p}</SoneChoiceCardTitle>
                <SoneChoiceCardDescription>
                  Billed {billing}.
                </SoneChoiceCardDescription>
                <SoneChoiceCardIndicator />
              </SoneChoiceCard>
            ))}
          </SoneChoiceGroup>
        </div>
      </section>

      <section className="pg-section">
        <h2>Feedback</h2>
        <SoneAlert>
          <SoneIcon icon="alert-circle" />
          <SoneAlertTitle>Heads up</SoneAlertTitle>
          <SoneAlertDescription>
            The alert parts are the same as in Angular.
          </SoneAlertDescription>
        </SoneAlert>
        <SoneBanner kind="warning">Your trial ends in 3 days.</SoneBanner>
        <div className="pg-row">
          <SoneAvatar>
            <SoneAvatarFallback>LU</SoneAvatarFallback>
          </SoneAvatar>
          <SoneAvatar size="lg" />
          <SoneSkeleton style={{ width: "160px", height: "16px" }} />
        </div>
        <SoneItem variant="outline">
          <SoneItemMedia variant="icon">
            <SoneIcon icon="star" size="sm" />
          </SoneItemMedia>
          <SoneItemContent>
            <SoneItemTitle>Starred project</SoneItemTitle>
            <SoneItemDescription>Updated 2 hours ago</SoneItemDescription>
          </SoneItemContent>
        </SoneItem>
        <SoneEmpty>
          <SoneEmptyHeader>
            <SoneEmptyMedia variant="icon">
              <SoneIcon icon="folder" />
            </SoneEmptyMedia>
            <SoneEmptyTitle>No projects yet</SoneEmptyTitle>
            <SoneEmptyDescription>
              Create one to get started.
            </SoneEmptyDescription>
          </SoneEmptyHeader>
        </SoneEmpty>
      </section>

      <section className="pg-section">
        <h2>Table &amp; FAQ</h2>
        <SoneTable
          rows={ROWS}
          rowKey={(r) => r.id}
          columns={COLUMNS}
          caption="Workspaces"
        />
        <SoneSeparator />
        <div>
          <SoneDisclosure summary="Can I use it with Next.js?">
            Yes — the components are client components, server-rendered as any
            other.
          </SoneDisclosure>
          <SoneDisclosure summary="Does it support dark mode?">
            Every skin has light and dark values.
          </SoneDisclosure>
        </div>
      </section>

      <section className="pg-section">
        <h2>Overlays</h2>
        <div className="pg-row">
          <SoneButton variant="outline" onClick={() => setDialogOpen(true)}>
            Open dialog
          </SoneButton>
          <SoneButton variant="outline" onClick={() => setConfirmOpen(true)}>
            Open alert dialog
          </SoneButton>
          <SoneButton variant="outline" onClick={() => setSheetOpen(true)}>
            Open sheet
          </SoneButton>
        </div>
      </section>

      <SoneDialog open={dialogOpen} onOpenChange={setDialogOpen} size="md">
        <SoneDialogHeader>
          <SoneDialogTitle>Start your trial</SoneDialogTitle>
          <SoneDialogDescription>
            14 days, no card needed.
          </SoneDialogDescription>
        </SoneDialogHeader>
        <SoneField>
          <SoneFieldLabel htmlFor="dlg-email">Email</SoneFieldLabel>
          <input id="dlg-email" type="email" autoFocus />
        </SoneField>
        <SoneDialogFooter>
          <SoneButton variant="outline" onClick={() => setDialogOpen(false)}>
            Cancel
          </SoneButton>
          <SoneButton onClick={() => setDialogOpen(false)}>Start</SoneButton>
        </SoneDialogFooter>
      </SoneDialog>

      {confirmOpen && (
        <SoneAlertDialog onDismiss={() => setConfirmOpen(false)}>
          <SoneDialogHeader>
            <SoneDialogTitle>Delete workspace?</SoneDialogTitle>
            <SoneDialogDescription>
              This cannot be undone.
            </SoneDialogDescription>
          </SoneDialogHeader>
          <SoneDialogFooter>
            <SoneButton variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </SoneButton>
            <SoneButton
              variant="destructive"
              onClick={() => setConfirmOpen(false)}
            >
              Delete
            </SoneButton>
          </SoneDialogFooter>
        </SoneAlertDialog>
      )}

      <SoneSheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SoneSheetHeader>
          <SoneSheetTitle>Menu</SoneSheetTitle>
          <SoneSheetDescription>Navigate the site.</SoneSheetDescription>
        </SoneSheetHeader>
      </SoneSheet>
    </main>
  );
}
