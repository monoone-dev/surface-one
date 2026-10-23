import { useState, type ReactNode } from "react";
import { ScrollView, View } from "react-native";

import {
  SONE_ACCENTS,
  SoneAlert,
  SoneAlertDescription,
  SoneAlertTitle,
  SoneAppBar,
  SoneAvatar,
  SoneAvatarGroup,
  SoneAvatarFallback,
  SoneBadge,
  SoneBarList,
  SoneButton,
  SoneButtonGroup,
  SoneCard,
  SoneCardContent,
  SoneCardDescription,
  SoneCardFooter,
  SoneCardHeader,
  SoneCardTitle,
  SoneDialog,
  SoneDialogDescription,
  SoneDialogFooter,
  SoneDialogHeader,
  SoneDialogTitle,
  SoneDateField,
  SoneField,
  SoneFieldLabel,
  SoneFilterChips,
  SoneIcon,
  SoneImagePicker,
  SoneInput,
  SoneInputOtp,
  SoneMeter,
  SonePasswordInput,
  SoneProgress,
  SoneRating,
  SoneSearchField,
  SoneSegmented,
  SoneSelect,
  SoneSeparator,
  SoneSheet,
  SoneSheetDescription,
  SoneSheetHeader,
  SoneSheetTitle,
  SoneSkeleton,
  SoneSlider,
  SoneSparkline,
  SoneSpinner,
  SoneStackedBar,
  SoneStatusDot,
  SoneStepper,
  SoneSwitch,
  SoneTabBar,
  SoneToaster,
  SoneText,
  SurfaceOneProvider,
  toast,
  useSoneStyles,
  type SoneAccent,
  type SoneColorScheme,
} from "@surface-one/react-native";
import * as skins from "@surface-one/react-native/skins";

const SKINS = [
  "minimalist",
  "studio",
  "paper",
  "neumorphism",
  "material",
  "surface",
  "airy",
] as const;

/** Every component on one scrolling screen, under a skin / mode / accent switcher. */
export function App() {
  const [skin, setSkin] = useState<(typeof SKINS)[number]>("studio");
  const [scheme, setScheme] = useState<SoneColorScheme>("light");
  const [accent, setAccent] = useState<SoneAccent | "default">("default");
  return (
    <SurfaceOneProvider
      skin={skins[skin]}
      colorMode={scheme}
      accent={accent === "default" ? null : accent}
    >
      <View style={{ flex: 1 }}>
        <Screen>
          <Section title="Theme">
            <SoneSelect
              aria-label="Skin"
              options={SKINS.map((s) => ({ value: s, label: s }))}
              value={skin}
              onValueChange={(v) => setSkin(v as (typeof SKINS)[number])}
            />
            <SoneSegmented
              ariaLabel="Colour mode"
              options={[
                { value: "light", label: "Light", icon: "sun" },
                { value: "dark", label: "Dark", icon: "moon" },
              ]}
              value={scheme}
              onValueChange={(v) => setScheme(v as SoneColorScheme)}
            />
            <SoneFilterChips
              ariaLabel="Accent"
              options={[
                { value: "default", label: "Default" },
                ...SONE_ACCENTS.map((a) => ({ value: a, label: a })),
              ]}
              value={accent}
              onValueChange={(v) => setAccent(v as SoneAccent | "default")}
            />
          </Section>
          <Actions />
          <Display />
          <Forms />
          <Data />
          <Overlays />
          <Mobile />
        </Screen>
        <SoneToaster />
      </View>
    </SurfaceOneProvider>
  );
}

function Screen({ children }: { readonly children: ReactNode }) {
  const s = useSoneStyles(({ tokens: t }) => ({
    root: { flex: 1, backgroundColor: t.surfaceBase },
    content: { padding: t.space4, gap: t.space5, maxWidth: 640 },
  }));
  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      {children}
    </ScrollView>
  );
}

function Section({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}) {
  const s = useSoneStyles(({ tokens: t }) => ({
    body: { gap: t.space3 },
  }));
  return (
    <View style={s.body}>
      <SoneText role="heading" size="lg" weight="semibold">
        {title}
      </SoneText>
      {children}
    </View>
  );
}

const Row = ({ children }: { readonly children: ReactNode }) => {
  const s = useSoneStyles(({ tokens: t }) => ({
    row: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      alignItems: "center" as const,
      gap: t.space2,
    },
  }));
  return <View style={s.row}>{children}</View>;
};

function Actions() {
  return (
    <Section title="Buttons">
      <Row>
        <SoneButton>Default</SoneButton>
        <SoneButton variant="secondary">Secondary</SoneButton>
        <SoneButton variant="outline">Outline</SoneButton>
        <SoneButton variant="ghost">Ghost</SoneButton>
        <SoneButton variant="destructive">Delete</SoneButton>
        <SoneButton variant="link">Link</SoneButton>
      </Row>
      <Row>
        <SoneButton size="sm">
          <SoneIcon name="plus" />
          New note
        </SoneButton>
        <SoneButton size="icon" variant="outline" aria-label="Search">
          <SoneIcon name="search" />
        </SoneButton>
        <SoneButtonGroup aria-label="Zoom">
          <SoneButton variant="outline" aria-label="Zoom out">
            <SoneIcon name="zoom-out" />
          </SoneButton>
          <SoneButton variant="outline" aria-label="Zoom in">
            <SoneIcon name="zoom-in" />
          </SoneButton>
        </SoneButtonGroup>
        <SoneButton disabled>Disabled</SoneButton>
      </Row>
    </Section>
  );
}

function Display() {
  return (
    <Section title="Display">
      <Row>
        <SoneBadge>Default</SoneBadge>
        <SoneBadge variant="secondary">Secondary</SoneBadge>
        <SoneBadge variant="outline">Outline</SoneBadge>
        <SoneBadge variant="success" dot>
          Live
        </SoneBadge>
        <SoneBadge variant="destructive">Error</SoneBadge>
        <SoneStatusDot tone="live" pulse label="Recording" />
        <SoneSpinner />
        <SoneAvatar>
          <SoneAvatarFallback>ŁS</SoneAvatarFallback>
        </SoneAvatar>
      </Row>
      <SoneAlert variant="warning">
        <SoneAlertTitle>Storage almost full</SoneAlertTitle>
        <SoneAlertDescription>
          Recordings older than 30 days will be archived.
        </SoneAlertDescription>
      </SoneAlert>
      <SoneCard>
        <SoneCardHeader>
          <SoneCardTitle>Weekly summary</SoneCardTitle>
          <SoneCardDescription>
            12 meetings, 4 hours recorded
          </SoneCardDescription>
        </SoneCardHeader>
        <SoneCardContent>
          <SoneSkeleton style={{ height: 12 }} />
        </SoneCardContent>
        <SoneCardFooter>
          <SoneButton size="sm" variant="outline">
            Open
          </SoneButton>
        </SoneCardFooter>
      </SoneCard>
      <SoneSeparator />
    </Section>
  );
}

function Forms() {
  const [on, setOn] = useState(true);
  const [volume, setVolume] = useState(40);
  return (
    <Section title="Forms">
      <SoneField>
        <SoneFieldLabel>Email</SoneFieldLabel>
        <SoneInput placeholder="you@example.com" />
      </SoneField>
      <SonePasswordInput placeholder="Password" aria-label="Password" />
      <SoneSearchField placeholder="Search notes" />
      <SoneInputOtp length={6} aria-label="Code" />
      <Row>
        <SoneSwitch
          checked={on}
          onCheckedChange={setOn}
          aria-label="Notifications"
        />
        <SoneRating defaultValue={4} ariaLabel="Rating" />
      </Row>
      <SoneSlider value={volume} onValueChange={setVolume} ariaLabel="Volume" />
      <SoneStepper
        steps={[
          { key: "a", label: "Account" },
          { key: "b", label: "Profile" },
          { key: "c", label: "Done" },
        ]}
        defaultCurrent={1}
      />
    </Section>
  );
}

function Data() {
  return (
    <Section title="Data">
      <SoneProgress value={64} aria-label="Upload" />
      <SoneProgress aria-label="Loading" />
      <SoneMeter label="Accuracy" value={3} max={4} />
      <SoneSparkline values={[3, 5, 2, 8, 6, 9, 7]} type="area" />
      <SoneBarList
        items={[
          { key: "a", label: "Meetings", value: 42 },
          { key: "b", label: "Notes", value: 28 },
          { key: "c", label: "Tasks", value: 13 },
        ]}
      />
      <SoneStackedBar
        showLegend
        segments={[
          { key: "a", label: "Audio", value: 4.2 },
          { key: "b", label: "Video", value: 2.1 },
          { key: "c", label: "Notes", value: 1.3 },
        ]}
      />
    </Section>
  );
}

function Overlays() {
  const [dialog, setDialog] = useState(false);
  const [sheet, setSheet] = useState(false);
  return (
    <Section title="Overlays">
      <Row>
        <SoneButton variant="outline" onPress={() => setDialog(true)}>
          Open dialog
        </SoneButton>
        <SoneButton variant="outline" onPress={() => setSheet(true)}>
          Open sheet
        </SoneButton>
      </Row>
      <SoneDialog open={dialog} onOpenChange={setDialog}>
        <SoneDialogHeader>
          <SoneDialogTitle>Delete the note?</SoneDialogTitle>
          <SoneDialogDescription>This cannot be undone.</SoneDialogDescription>
        </SoneDialogHeader>
        <SoneDialogFooter>
          <SoneButton variant="outline" onPress={() => setDialog(false)}>
            Cancel
          </SoneButton>
          <SoneButton variant="destructive" onPress={() => setDialog(false)}>
            Delete
          </SoneButton>
        </SoneDialogFooter>
      </SoneDialog>
      <SoneSheet open={sheet} onOpenChange={setSheet}>
        <SoneSheetHeader>
          <SoneSheetTitle>Filters</SoneSheetTitle>
          <SoneSheetDescription>Narrow the list down.</SoneSheetDescription>
        </SoneSheetHeader>
      </SoneSheet>
    </Section>
  );
}

const TABS = [
  { value: "plan", label: "Plan", icon: "map" },
  { value: "people", label: "People", icon: "people" },
  { value: "tasks", label: "Tasks", icon: "list-checks" },
] as const;

/** A canned picker: a real app calls expo-image-picker here. */
const pickPhoto = async (): Promise<string> =>
  `https://picsum.photos/seed/${Math.round(Math.random() * 1000)}/640/360`;

function Mobile() {
  const [tab, setTab] = useState<string>("plan");
  const [start, setStart] = useState<string | undefined>("2026-05-03");
  const [cover, setCover] = useState<string | undefined>();
  return (
    <Section title="Mobile">
      <SoneAppBar
        title="Lisbon"
        subtitle="3 – 9 May"
        onBack={() => toast("Back")}
        trailing={
          <SoneAvatar>
            <SoneAvatarFallback>AL</SoneAvatarFallback>
          </SoneAvatar>
        }
      />
      <SoneAvatarGroup
        aria-label="Participants"
        max={3}
        people={[
          { name: "Ada Lovelace" },
          { name: "Grace Hopper" },
          { name: "Alan Turing" },
          { name: "Edsger Dijkstra" },
          { name: "Barbara Liskov" },
        ]}
      />
      <SoneDateField
        ariaLabel="Start date"
        placeholder="Pick a date"
        value={start}
        onValueChange={setStart}
        clearable
      />
      <SoneImagePicker
        label="Add a cover"
        value={cover}
        onValueChange={setCover}
        pick={pickPhoto}
      />
      <SoneButtonGroup>
        <SoneButton variant="outline" onPress={() => toast("Saved")}>
          Toast
        </SoneButton>
        <SoneButton
          variant="outline"
          onPress={() =>
            toast.success("Saved", { description: "Trip updated" })
          }
        >
          Success
        </SoneButton>
        <SoneButton
          variant="outline"
          onPress={() => toast.error("Could not save", { duration: 0 })}
        >
          Error
        </SoneButton>
      </SoneButtonGroup>
      <SoneTabBar
        floating={false}
        ariaLabel="Trip sections"
        items={TABS}
        value={tab}
        onValueChange={setTab}
        labels="always"
      />
      <SoneTabBar
        floating={false}
        ariaLabel="Trip sections (active label)"
        items={TABS}
        value={tab}
        onValueChange={setTab}
      />
    </Section>
  );
}
