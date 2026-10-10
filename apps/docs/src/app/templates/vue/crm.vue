<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import {
  SoneAvatar,
  SoneAvatarFallback,
  SoneBadge,
  SoneButton,
  SoneCard,
  SoneField,
  SoneFieldLabel,
  SoneIcon,
  SoneInputGroup,
  SoneInputGroupAddon,
  SoneInputGroupInput,
  SoneMenu,
  SoneMenuItem,
  SonePageHeader,
  SonePageHeaderActions,
  SonePageHeaderContent,
  SonePageHeaderDescription,
  SonePageHeaderEyebrow,
  SonePageHeaderTitle,
  SoneSegmented,
  SoneSelect,
  SoneStat,
  SoneStatGroup,
  SoneStatHint,
  SoneStatLabel,
  SoneStatValue,
  SoneStepper,
  SoneTable,
  type BadgeVariant,
  type SegmentOption,
  type ShellIcon,
  type SoneStep,
  type SoneTableColumn,
} from "@surface-one/vue";

type StageId = "lead" | "qualified" | "proposal" | "negotiation" | "won";
type ActivityType = "call" | "email" | "meeting" | "note" | "stage";

interface Stage {
  readonly id: StageId;
  readonly label: string;
  readonly probability: number;
}

interface Owner {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
}

interface Activity {
  readonly id: string;
  readonly type: ActivityType;
  readonly text: string;
  readonly author: string;
  readonly when: string;
}

interface Deal {
  readonly id: string;
  readonly company: string;
  readonly contact: {
    readonly name: string;
    readonly title: string;
    readonly email: string;
    readonly phone: string;
  };
  readonly value: number;
  readonly stage: StageId;
  readonly owner: string;
  /** ISO date (YYYY-MM-DD). */
  readonly close: string;
  readonly nextStep: string;
  readonly notes: string;
  readonly activities: readonly Activity[];
}

const STAGES: readonly Stage[] = [
  { id: "lead", label: "Lead", probability: 10 },
  { id: "qualified", label: "Qualified", probability: 25 },
  { id: "proposal", label: "Proposal", probability: 50 },
  { id: "negotiation", label: "Negotiation", probability: 75 },
  { id: "won", label: "Won", probability: 100 },
];

const OWNERS: readonly Owner[] = [
  { id: "ap", name: "Ada Park", initials: "AP" },
  { id: "lr", name: "Leo Ruiz", initials: "LR" },
  { id: "ms", name: "Mina Sato", initials: "MS" },
  { id: "tg", name: "Theo Grant", initials: "TG" },
];

const ACTIVITY_TYPES: Record<ActivityType, { label: string; icon: ShellIcon }> =
  {
    call: { label: "Call", icon: "audio-lines" },
    email: { label: "Email", icon: "share" },
    meeting: { label: "Meeting", icon: "meetings" },
    note: { label: "Note", icon: "notes" },
    stage: { label: "Stage change", icon: "move-horizontal" },
  };

/** The current month, fixed so the screen renders the same on the server and the client. */
const THIS_MONTH = "2026-10";
/** Deals lost this quarter: the other half of the win rate. */
const LOST_THIS_QUARTER = 2;

const DEALS: readonly Deal[] = [
  {
    id: "d1",
    company: "Acme Logistics",
    contact: {
      name: "Priya Shah",
      title: "VP Operations",
      email: "priya@acme.example",
      phone: "+1 415 555 0142",
    },
    value: 18000,
    stage: "lead",
    owner: "ap",
    close: "2026-11-20",
    nextStep: "Book a discovery call for next week.",
    notes: "Inbound from the webinar. Runs 40 depots, wants route reports.",
    activities: [
      {
        id: "a1",
        type: "email",
        text: "Sent the intro deck",
        author: "Ada Park",
        when: "Oct 6",
      },
    ],
  },
  {
    id: "d2",
    company: "Brightline Health",
    contact: {
      name: "Marcus Lee",
      title: "Head of IT",
      email: "marcus@brightline.example",
      phone: "+1 212 555 0187",
    },
    value: 42500,
    stage: "qualified",
    owner: "lr",
    close: "2026-10-28",
    nextStep: "Security questionnaire due Friday.",
    notes: "Needs SSO and an EU data region before legal signs off.",
    activities: [
      {
        id: "a1",
        type: "meeting",
        text: "Discovery call with the IT team",
        author: "Leo Ruiz",
        when: "Oct 2",
      },
      {
        id: "a2",
        type: "email",
        text: "Shared the security overview",
        author: "Leo Ruiz",
        when: "Oct 5",
      },
    ],
  },
  {
    id: "d3",
    company: "Cobalt Foods",
    contact: {
      name: "Elena Rossi",
      title: "CFO",
      email: "elena@cobalt.example",
      phone: "+39 02 5550 1234",
    },
    value: 27000,
    stage: "proposal",
    owner: "ms",
    close: "2026-10-17",
    nextStep: "Walk Elena through the annual pricing.",
    notes: "Comparing us with two vendors. Price is the deciding factor.",
    activities: [
      {
        id: "a1",
        type: "call",
        text: "Pricing questions answered",
        author: "Mina Sato",
        when: "Oct 7",
      },
    ],
  },
  {
    id: "d4",
    company: "Driftwood Hotels",
    contact: {
      name: "Sam Carter",
      title: "Director of Guest Experience",
      email: "sam@driftwood.example",
      phone: "+1 305 555 0119",
    },
    value: 64000,
    stage: "negotiation",
    owner: "ap",
    close: "2026-10-24",
    nextStep: "Send the redlined contract back to procurement.",
    notes: "Rolling out to 12 hotels in two waves. Wants a 3-year term.",
    activities: [
      {
        id: "a1",
        type: "meeting",
        text: "Demo for the regional managers",
        author: "Ada Park",
        when: "Sep 30",
      },
      {
        id: "a2",
        type: "email",
        text: "Received the contract redlines",
        author: "Ada Park",
        when: "Oct 8",
      },
    ],
  },
  {
    id: "d5",
    company: "Evergreen Schools",
    contact: {
      name: "Hana Kim",
      title: "Procurement lead",
      email: "hana@evergreen.example",
      phone: "+1 503 555 0163",
    },
    value: 12800,
    stage: "lead",
    owner: "tg",
    close: "2026-12-05",
    nextStep: "Confirm the budget cycle.",
    notes: "Pilot for three campuses, budget opens in December.",
    activities: [
      {
        id: "a1",
        type: "note",
        text: "Referred by Juniper Retail",
        author: "Theo Grant",
        when: "Oct 1",
      },
    ],
  },
  {
    id: "d6",
    company: "Fjord Outdoor",
    contact: {
      name: "Jonas Berg",
      title: "COO",
      email: "jonas@fjord.example",
      phone: "+47 555 01 234",
    },
    value: 35200,
    stage: "proposal",
    owner: "lr",
    close: "2026-11-07",
    nextStep: "Follow up on the proposal.",
    notes: "Seasonal business: go-live must land before the spring catalogue.",
    activities: [
      {
        id: "a1",
        type: "email",
        text: "Proposal sent",
        author: "Leo Ruiz",
        when: "Oct 3",
      },
    ],
  },
  {
    id: "d7",
    company: "Granite Insurance",
    contact: {
      name: "Olivia Grant",
      title: "Head of Claims",
      email: "olivia@granite.example",
      phone: "+44 20 5550 1988",
    },
    value: 88000,
    stage: "negotiation",
    owner: "tg",
    close: "2026-10-31",
    nextStep: "Final pricing call with Olivia and finance.",
    notes: "Largest deal this quarter. Asked for a 10% multi-year discount.",
    activities: [
      {
        id: "a1",
        type: "call",
        text: "Discount request discussed",
        author: "Theo Grant",
        when: "Oct 8",
      },
    ],
  },
  {
    id: "d8",
    company: "Harbor Analytics",
    contact: {
      name: "Noah Patel",
      title: "CTO",
      email: "noah@harbor.example",
      phone: "+1 617 555 0135",
    },
    value: 23400,
    stage: "won",
    owner: "ms",
    close: "2026-10-03",
    nextStep: "Hand over to onboarding.",
    notes: "Signed a 2-year contract. Kick-off on October 14.",
    activities: [
      {
        id: "a1",
        type: "stage",
        text: "Moved to Won",
        author: "Mina Sato",
        when: "Oct 3",
      },
    ],
  },
  {
    id: "d9",
    company: "Iris Studios",
    contact: {
      name: "Chloe Martin",
      title: "Founder",
      email: "chloe@iris.example",
      phone: "+33 1 55 50 12 34",
    },
    value: 9600,
    stage: "qualified",
    owner: "ap",
    close: "2026-11-14",
    nextStep: "Send two customer stories from agencies.",
    notes: "Small team, fast decision. Cares about the design tools.",
    activities: [
      {
        id: "a1",
        type: "call",
        text: "Qualification call",
        author: "Ada Park",
        when: "Oct 4",
      },
    ],
  },
  {
    id: "d10",
    company: "Juniper Retail",
    contact: {
      name: "Diego Alvarez",
      title: "E-commerce lead",
      email: "diego@juniper.example",
      phone: "+34 91 555 0142",
    },
    value: 51000,
    stage: "won",
    owner: "lr",
    close: "2026-09-26",
    nextStep: "Quarterly business review in January.",
    notes: "Expanding to the marketplace team next year.",
    activities: [
      {
        id: "a1",
        type: "stage",
        text: "Moved to Won",
        author: "Leo Ruiz",
        when: "Sep 26",
      },
    ],
  },
];

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const DAY = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const stageIndex = (id: StageId): number =>
  STAGES.findIndex((s) => s.id === id);

const stages = STAGES;
const owners = OWNERS;
const lost = LOST_THIS_QUARTER;
const views: readonly SegmentOption[] = [
  { value: "pipeline", label: "Pipeline", icon: "layout-grid" },
  { value: "list", label: "List", icon: "logs" },
];
const stageSteps: readonly SoneStep[] = STAGES.map((s) => ({
  key: s.id,
  label: s.label,
  description: `${s.probability}% probability`,
}));
const logTypes = (["call", "email", "meeting", "note"] as const).map(
  (value) => ({ value, label: ACTIVITY_TYPES[value].label }),
);
const tableColumns: readonly SoneTableColumn[] = [
  { key: "company", header: "Company" },
  { key: "stage", header: "Stage", width: "120px" },
  { key: "owner", header: "Owner", width: "140px" },
  { key: "value", header: "Value", width: "100px", alignEnd: true },
  { key: "probability", header: "Probability", width: "100px", alignEnd: true },
  { key: "close", header: "Close", width: "80px", alignEnd: true },
  { key: "actions", header: "Actions", hideHeader: true, width: "48px" },
];

const root = ref<HTMLElement | null>(null);
const deals = ref<readonly Deal[]>(DEALS);
const view = ref("pipeline");
const query = ref("");
const owner = ref("all");
/** The deal in the detail panel. */
const selectedId = ref<string | null>("d4");
/** The panel shows the initial deal: hidden on narrow screens until a deal is opened. */
const auto = ref(true);
const activityType = ref("call");
const draft = ref("");
const announcement = ref("");

const visibleDeals = computed(() => {
  const q = query.value.trim().toLowerCase();
  return deals.value.filter(
    (d) =>
      (owner.value === "all" || d.owner === owner.value) &&
      (!q ||
        d.company.toLowerCase().includes(q) ||
        d.contact.name.toLowerCase().includes(q)),
  );
});
const columns = computed(() =>
  STAGES.map((stage, index) => {
    const list = visibleDeals.value.filter((d) => d.stage === stage.id);
    return {
      stage,
      index,
      deals: list,
      total: list.reduce((sum, d) => sum + d.value, 0),
    };
  }),
);
const selected = computed(
  () => deals.value.find((d) => d.id === selectedId.value) ?? null,
);

const openDeals = computed(() => deals.value.filter((d) => d.stage !== "won"));
const wonDeals = computed(() => deals.value.filter((d) => d.stage === "won"));
const openValue = computed(() =>
  openDeals.value.reduce((sum, d) => sum + d.value, 0),
);
const weightedValue = computed(() =>
  openDeals.value.reduce(
    (sum, d) => sum + (d.value * stageOf(d).probability) / 100,
    0,
  ),
);
const winRate = computed(() => {
  const won = wonDeals.value.length;
  return Math.round((won / (won + LOST_THIS_QUARTER)) * 100);
});
const closingThisMonth = computed(() =>
  openDeals.value.filter((d) => d.close.startsWith(THIS_MONTH)),
);
const closingValue = computed(() =>
  closingThisMonth.value.reduce((sum, d) => sum + d.value, 0),
);
const wonValue = computed(() =>
  wonDeals.value.reduce((sum, d) => sum + d.value, 0),
);

const byId = (row: Deal): string => row.id;
const isSelected = (row: Deal): boolean => row.id === selectedId.value;
const asDeal = (row: unknown): Deal => row as Deal;

const money = (value: number): string => MONEY.format(value);
const day = (iso: string): string => DAY.format(new Date(`${iso}T00:00:00Z`));
const stageOf = (deal: Deal): Stage => STAGES[stageIndex(deal.stage)]!;
const stageVariant = (deal: Deal): BadgeVariant =>
  deal.stage === "won" ? "success" : "secondary";

function probabilityOf(deal: Deal): { value: number; variant: BadgeVariant } {
  const value = stageOf(deal).probability;
  const variant: BadgeVariant =
    value >= 100
      ? "success"
      : value >= 75
        ? "warning"
        : value >= 50
          ? "secondary"
          : "outline";
  return { value, variant };
}

const ownerOf = (deal: Deal): Owner => OWNERS.find((o) => o.id === deal.owner)!;

function moveLabel(deal: Deal, delta: 1 | -1): string {
  const target = STAGES[stageIndex(deal.stage) + delta];
  if (!target) return delta > 0 ? "Already won" : "Already a lead";
  return delta > 0
    ? `Move ${deal.company} to ${target.label}`
    : `Move ${deal.company} back to ${target.label}`;
}

function focus(selector: string): boolean {
  const el = root.value?.querySelector<HTMLElement>(selector);
  el?.focus();
  return !!el;
}

function open(id: string): void {
  selectedId.value = id;
  auto.value = false;
  draft.value = "";
  void nextTick(() => focus("#crm-detail-title"));
}

function close(): void {
  const id = selectedId.value;
  selectedId.value = null;
  if (id) void nextTick(() => focus(`#crm-open-${id}`));
}

function update(id: string, fn: (deal: Deal) => Deal): void {
  deals.value = deals.value.map((d) => (d.id === id ? fn(d) : d));
}

function activity(deal: Deal, type: ActivityType, text: string): Activity {
  return {
    id: `a${deal.activities.length + 1}`,
    type,
    text,
    author: "You",
    when: "Just now",
  };
}

function setStage(id: string, index: number): void {
  const stage = STAGES[index];
  const deal = deals.value.find((d) => d.id === id);
  if (!stage || !deal || deal.stage === stage.id) return;
  update(id, (d) => ({
    ...d,
    stage: stage.id,
    activities: [
      activity(d, "stage", `Moved to ${stage.label}`),
      ...d.activities,
    ],
  }));
  announcement.value = `${deal.company} moved to ${stage.label}.`;
}

/** Moves a deal one stage along; from a card, focus follows it to its new column. */
function move(id: string, delta: 1 | -1, from?: "prev" | "next"): void {
  const deal = deals.value.find((d) => d.id === id);
  const target = deal && STAGES[stageIndex(deal.stage) + delta];
  if (!target) return;
  setStage(id, stageIndex(target.id));
  if (from) {
    void nextTick(
      () =>
        focus(`#crm-${from}-${id}:not(:disabled)`) || focus(`#crm-open-${id}`),
    );
  }
}

function logActivity(id: string): void {
  const text = draft.value.trim();
  if (!text) return;
  const type = activityType.value as ActivityType;
  update(id, (d) => ({
    ...d,
    activities: [activity(d, type, text), ...d.activities],
  }));
  draft.value = "";
  announcement.value = `${ACTIVITY_TYPES[type].label} logged.`;
}

// No Vue row menu yet: a ghost icon button opens a SoneMenu, fixed to the viewport
// (teleported to <body>) so the scrolling table never clips it.
const menu = ref<{ row: Deal; top: number; right: number } | null>(null);
const panel = ref<InstanceType<typeof SoneMenu> | null>(null);
const panelEl = (): HTMLElement | undefined => panel.value?.$el;
let menuTrigger: HTMLElement | null = null;

function toggleMenu(row: Deal, event: MouseEvent): void {
  if (menu.value?.row.id === row.id) return closeMenu();
  menuTrigger = event.currentTarget as HTMLElement;
  const rect = menuTrigger.getBoundingClientRect();
  menu.value = {
    row,
    top: rect.bottom + 4,
    right: window.innerWidth - rect.right,
  };
  // Opened from the keyboard: move focus into the menu.
  if (event.detail === 0) void nextTick(() => menuItems()[0]?.focus());
}

function closeMenu(restoreFocus = false): void {
  menu.value = null;
  if (restoreFocus) menuTrigger?.focus();
}

function menuAction(action: () => void): void {
  action();
  closeMenu(true);
}

const menuItems = (): HTMLElement[] =>
  Array.from(
    panelEl()?.querySelectorAll<HTMLElement>(
      '[role="menuitem"]:not(:disabled)',
    ) ?? [],
  );

function onMenuKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape" || event.key === "Tab") {
    closeMenu(true);
    return;
  }
  const items = menuItems();
  const current = items.indexOf(document.activeElement as HTMLElement);
  const next: Record<string, number> = {
    ArrowDown: (current + 1) % items.length,
    ArrowUp: (current - 1 + items.length) % items.length,
    Home: 0,
    End: items.length - 1,
  };
  if (!(event.key in next)) return;
  event.preventDefault();
  items[next[event.key]!]?.focus();
}

function onDocumentPointerdown(event: PointerEvent): void {
  const target = event.target as Node;
  if (!menu.value || panelEl()?.contains(target)) return;
  if (menuTrigger?.contains(target)) return;
  closeMenu();
}

onMounted(() =>
  document.addEventListener("pointerdown", onDocumentPointerdown),
);
onBeforeUnmount(() =>
  document.removeEventListener("pointerdown", onDocumentPointerdown),
);
</script>

<template>
  <div ref="root" class="shell">
    <div class="body">
      <SonePageHeader>
        <SonePageHeaderContent>
          <SonePageHeaderEyebrow>Sales · Q4 2026</SonePageHeaderEyebrow>
          <SonePageHeaderTitle>Deals</SonePageHeaderTitle>
          <SonePageHeaderDescription>
            Every open opportunity, from first contact to signed contract.
          </SonePageHeaderDescription>
        </SonePageHeaderContent>
        <SonePageHeaderActions>
          <SoneButton variant="outline" size="sm" type="button">
            <SoneIcon icon="download" /><span>Export</span>
          </SoneButton>
          <SoneButton size="sm" type="button">
            <SoneIcon icon="plus" /><span>New deal</span>
          </SoneButton>
        </SonePageHeaderActions>
      </SonePageHeader>

      <SoneStatGroup class="stats">
        <SoneStat size="sm">
          <SoneStatLabel>Open pipeline</SoneStatLabel>
          <SoneStatValue>{{ money(openValue) }}</SoneStatValue>
          <SoneStatHint>Weighted {{ money(weightedValue) }}</SoneStatHint>
        </SoneStat>
        <SoneStat size="sm">
          <SoneStatLabel>Win rate</SoneStatLabel>
          <SoneStatValue>{{ winRate }}%</SoneStatValue>
          <SoneStatHint>
            {{ wonDeals.length }} won · {{ lost }} lost this quarter
          </SoneStatHint>
        </SoneStat>
        <SoneStat size="sm">
          <SoneStatLabel>Closing this month</SoneStatLabel>
          <SoneStatValue>{{ closingThisMonth.length }}</SoneStatValue>
          <SoneStatHint>Worth {{ money(closingValue) }}</SoneStatHint>
        </SoneStat>
        <SoneStat size="sm">
          <SoneStatLabel>Won this quarter</SoneStatLabel>
          <SoneStatValue>{{ money(wonValue) }}</SoneStatValue>
          <SoneStatHint>Across {{ wonDeals.length }} deals</SoneStatHint>
        </SoneStat>
      </SoneStatGroup>

      <div class="toolbar">
        <SoneInputGroup class="search">
          <SoneInputGroupAddon as="span"
            ><SoneIcon icon="search"
          /></SoneInputGroupAddon>
          <SoneInputGroupInput
            v-model="query"
            type="search"
            aria-label="Search deals"
            placeholder="Search company or contact…"
          />
        </SoneInputGroup>
        <SoneSelect v-model="owner" class="owner" aria-label="Owner">
          <option value="all">All owners</option>
          <option v-for="o in owners" :key="o.id" :value="o.id">
            {{ o.name }}
          </option>
        </SoneSelect>
        <SoneSegmented v-model="view" aria-label="View" :options="views" />
      </div>

      <h3 id="crm-deals-title" class="sr-only">
        {{ view === "pipeline" ? "Pipeline" : "All deals" }}
      </h3>
      <p class="sr-only" role="status">{{ announcement }}</p>

      <ul
        v-if="view === 'pipeline'"
        class="board"
        aria-labelledby="crm-deals-title"
      >
        <li v-for="col in columns" :key="col.stage.id" class="column">
          <div class="column-head">
            <h4 :id="'crm-col-' + col.stage.id" class="column-title">
              {{ col.stage.label }}
            </h4>
            <SoneBadge variant="outline" class="num"
              >{{ col.deals.length
              }}<span class="sr-only"> deals</span></SoneBadge
            >
          </div>
          <p class="column-total num">{{ money(col.total) }}</p>
          <ul
            v-if="col.deals.length"
            class="cards"
            :aria-labelledby="'crm-col-' + col.stage.id"
          >
            <SoneCard
              v-for="d in col.deals"
              :key="d.id"
              as="li"
              size="sm"
              class="deal"
              :class="{ 'is-selected': selectedId === d.id }"
            >
              <div class="deal-head">
                <button
                  :id="'crm-open-' + d.id"
                  type="button"
                  class="deal-open"
                  :aria-controls="selected ? 'crm-detail' : undefined"
                  @click="open(d.id)"
                >
                  {{ d.company }}
                </button>
                <SoneBadge :variant="probabilityOf(d).variant"
                  >{{ probabilityOf(d).value }}%<span class="sr-only">
                    win probability</span
                  ></SoneBadge
                >
              </div>
              <p class="deal-contact">{{ d.contact.name }}</p>
              <p class="deal-value num">{{ money(d.value) }}</p>
              <div class="deal-foot">
                <SoneAvatar size="sm" aria-hidden="true"
                  ><SoneAvatarFallback>{{
                    ownerOf(d).initials
                  }}</SoneAvatarFallback></SoneAvatar
                >
                <span class="sr-only">Owner {{ ownerOf(d).name }},</span>
                <span class="deal-close num"
                  ><span class="sr-only">closes </span>{{ day(d.close) }}</span
                >
                <span class="deal-move">
                  <SoneButton
                    :id="'crm-prev-' + d.id"
                    variant="ghost"
                    size="icon-xs"
                    type="button"
                    :disabled="col.index === 0"
                    :aria-label="moveLabel(d, -1)"
                    :title="moveLabel(d, -1)"
                    @click="move(d.id, -1, 'prev')"
                  >
                    <SoneIcon icon="chevron-right" class="flip" />
                  </SoneButton>
                  <SoneButton
                    :id="'crm-next-' + d.id"
                    variant="ghost"
                    size="icon-xs"
                    type="button"
                    :disabled="col.index === stages.length - 1"
                    :aria-label="moveLabel(d, 1)"
                    :title="moveLabel(d, 1)"
                    @click="move(d.id, 1, 'next')"
                  >
                    <SoneIcon icon="chevron-right" />
                  </SoneButton>
                </span>
              </div>
            </SoneCard>
          </ul>
          <p v-else class="column-empty">No deals in this stage.</p>
        </li>
      </ul>

      <div v-else class="list">
        <SoneTable
          class="deals-table"
          :rows="visibleDeals"
          :columns="tableColumns"
          :row-key="byId"
          :is-selected="isSelected"
          caption="Deals in the pipeline"
          empty-text="No deals match these filters."
        >
          <template #cell-company="{ row }">
            <span class="company">
              <button
                :id="'crm-open-' + asDeal(row).id"
                type="button"
                class="deal-open"
                :aria-controls="selected ? 'crm-detail' : undefined"
                @click="open(asDeal(row).id)"
              >
                {{ asDeal(row).company }}
              </button>
              <span class="company-contact">{{
                asDeal(row).contact.name
              }}</span>
            </span>
          </template>
          <template #cell-stage="{ row }">
            <SoneBadge :variant="stageVariant(asDeal(row))">{{
              stageOf(asDeal(row)).label
            }}</SoneBadge>
          </template>
          <template #cell-owner="{ row }">{{
            ownerOf(asDeal(row)).name
          }}</template>
          <template #cell-value="{ row }">
            <span class="num">{{ money(asDeal(row).value) }}</span>
          </template>
          <template #cell-probability="{ row }">
            <span class="num">{{ probabilityOf(asDeal(row)).value }}%</span>
          </template>
          <template #cell-close="{ row }">
            <span class="num">{{ day(asDeal(row).close) }}</span>
          </template>
          <template #cell-actions="{ row }">
            <SoneButton
              variant="ghost"
              size="icon-xs"
              type="button"
              aria-haspopup="menu"
              :aria-expanded="menu?.row.id === asDeal(row).id"
              :aria-controls="
                menu?.row.id === asDeal(row).id ? 'crm-row-menu' : undefined
              "
              :aria-label="'Actions for ' + asDeal(row).company"
              :title="'Actions for ' + asDeal(row).company"
              @click="toggleMenu(asDeal(row), $event)"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </SoneButton>
          </template>
        </SoneTable>
      </div>
    </div>

    <!-- No Vue side panel component yet: the same classes as [soneSidePanel] and its parts. -->
    <div
      v-if="selected"
      id="crm-detail"
      class="side-panel details"
      :class="{ 'is-auto': auto }"
      data-slot="side-panel"
      role="region"
      aria-labelledby="crm-detail-title"
    >
      <div class="side-panel-header" data-slot="side-panel-header">
        <h3
          id="crm-detail-title"
          class="side-panel-title"
          data-slot="side-panel-title"
          tabindex="-1"
        >
          {{ selected.company }}
        </h3>
        <div class="side-panel-actions" data-slot="side-panel-actions">
          <SoneButton
            variant="ghost"
            size="icon-sm"
            type="button"
            aria-label="Close deal details"
            @click="close"
          >
            <SoneIcon icon="close" />
          </SoneButton>
        </div>
      </div>
      <div class="side-panel-content" data-slot="side-panel-content">
        <p class="detail-value num">{{ money(selected.value) }}</p>
        <p class="detail-badges">
          <SoneBadge :variant="stageVariant(selected)">{{
            stageOf(selected).label
          }}</SoneBadge>
          <SoneBadge :variant="probabilityOf(selected).variant"
            >{{ probabilityOf(selected).value }}% probability</SoneBadge
          >
        </p>
        <dl class="props">
          <div>
            <dt>Owner</dt>
            <dd class="person">
              <SoneAvatar size="sm" aria-hidden="true"
                ><SoneAvatarFallback>{{
                  ownerOf(selected).initials
                }}</SoneAvatarFallback></SoneAvatar
              >
              {{ ownerOf(selected).name }}
            </dd>
          </div>
          <div>
            <dt>Close date</dt>
            <dd class="num">{{ day(selected.close) }}</dd>
          </div>
        </dl>

        <h4 class="section-title">Stage</h4>
        <SoneStepper
          variant="numbered"
          orientation="vertical"
          aria-label="Deal stage"
          :show-count="false"
          :steps="stageSteps"
          :current="stageIndex(selected.stage)"
          @update:current="setStage(selected.id, $event)"
        />

        <h4 class="section-title">Contact</h4>
        <dl class="props">
          <div>
            <dt>Name</dt>
            <dd>
              {{ selected.contact.name }}
              <span class="muted">{{ selected.contact.title }}</span>
            </dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>
              <a :href="'mailto:' + selected.contact.email">{{
                selected.contact.email
              }}</a>
            </dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd class="num">
              <a :href="'tel:' + selected.contact.phone.replaceAll(' ', '')">{{
                selected.contact.phone
              }}</a>
            </dd>
          </div>
        </dl>

        <h4 class="section-title">Next step</h4>
        <p class="text">{{ selected.nextStep }}</p>

        <h4 class="section-title">Notes</h4>
        <p class="text">{{ selected.notes }}</p>

        <h4 class="section-title">Activity</h4>
        <form class="log" @submit.prevent="logActivity(selected.id)">
          <SoneField>
            <SoneFieldLabel for="crm-activity-type">Type</SoneFieldLabel>
            <SoneSelect
              v-model="activityType"
              size="sm"
              select-id="crm-activity-type"
            >
              <option v-for="t in logTypes" :key="t.value" :value="t.value">
                {{ t.label }}
              </option>
            </SoneSelect>
          </SoneField>
          <SoneField>
            <SoneFieldLabel for="crm-activity-text"
              >What happened?</SoneFieldLabel
            >
            <textarea
              id="crm-activity-text"
              v-model="draft"
              rows="2"
              placeholder="Called Sam about the redlines…"
            ></textarea>
          </SoneField>
          <SoneButton size="sm" type="submit" :disabled="!draft.trim()">
            Log activity
          </SoneButton>
        </form>
        <ol class="activity" aria-label="Activity, newest first">
          <li v-for="a in selected.activities" :key="a.id">
            <span class="activity-icon" aria-hidden="true"
              ><SoneIcon :icon="ACTIVITY_TYPES[a.type].icon"
            /></span>
            <span class="activity-body">
              <span class="activity-text">{{ a.text }}</span>
              <span class="activity-meta"
                >{{ ACTIVITY_TYPES[a.type].label }} · {{ a.author }} ·
                {{ a.when }}</span
              >
            </span>
          </li>
        </ol>
      </div>
    </div>

    <Teleport to="body">
      <SoneMenu
        v-if="menu"
        id="crm-row-menu"
        ref="panel"
        class="row-panel"
        :style="{ top: `${menu.top}px`, right: `${menu.right}px` }"
        :aria-label="'Actions for ' + menu.row.company"
        tabindex="-1"
        @keydown="onMenuKeydown"
      >
        <SoneMenuItem
          type="button"
          @click="
            () => {
              const id = menu!.row.id;
              closeMenu();
              open(id);
            }
          "
        >
          <SoneIcon icon="eye" /> Open deal
        </SoneMenuItem>
        <SoneMenuItem
          type="button"
          :disabled="menu.row.stage === 'won'"
          @click="menuAction(() => move(menu!.row.id, 1))"
        >
          <SoneIcon icon="chevron-right" /> Move to next stage
        </SoneMenuItem>
        <SoneMenuItem
          type="button"
          :disabled="menu.row.stage === 'lead'"
          @click="menuAction(() => move(menu!.row.id, -1))"
        >
          <SoneIcon icon="chevron-right" class="flip" /> Move back
        </SoneMenuItem>
      </SoneMenu>
    </Teleport>
  </div>
</template>

<style scoped>
.shell {
  position: relative;
  display: flex;
  height: 720px;
  overflow: hidden;
}
.body {
  flex: 1 1 auto;
  min-width: 0;
  overflow-y: auto;
  padding: var(--space-6);
}
.num {
  font-variant-numeric: tabular-nums;
}
.flip {
  transform: scaleX(-1);
}
.stats {
  margin: var(--space-5) 0;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}
.search {
  flex: 1 1 14rem;
  min-width: 0;
}
.owner {
  flex: 0 1 11rem;
}
.board {
  display: grid;
  grid-auto-columns: minmax(13rem, 1fr);
  grid-auto-flow: column;
  gap: var(--space-3);
  margin: 0;
  padding: 0 0 var(--space-2);
  overflow-x: auto;
  list-style: none;
  scroll-snap-type: x proximity;
}
.column {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
  padding: var(--space-3);
  border: var(--border-width-thin) solid var(--border-subtle);
  border-radius: var(--radius);
  background: var(--surface-base);
  scroll-snap-align: start;
}
.column-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}
.column-title {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}
.column-total {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
.column-empty {
  margin: 0;
  padding: var(--space-4) var(--space-2);
  border: var(--border-width-thin) dashed var(--border);
  border-radius: var(--radius);
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  text-align: center;
}
.cards {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}
.deal {
  gap: var(--space-1);
}
.deal.is-selected {
  border-color: var(--accent);
}
.deal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
}
.deal-open {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: var(--radius-control);
  background: none;
  color: var(--text-primary);
  font: inherit;
  font-weight: var(--font-weight-semibold);
  text-align: start;
  cursor: pointer;
}
.deal-open:hover {
  text-decoration: underline;
}
.deal-open:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
.deal-contact {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
}
.deal-value {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}
.deal-foot {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-1);
}
.deal-close {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
.deal-move {
  display: inline-flex;
  gap: var(--space-1);
  margin-left: auto;
}
.list {
  overflow-x: auto;
}
.deals-table {
  min-width: 44rem;
}
.company {
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-2);
  min-width: 0;
}
.company-contact {
  overflow: hidden;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.details {
  flex: none;
  width: 22rem;
}
.details h3:focus {
  outline: none;
}
.detail-value {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
}
.detail-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin: var(--space-2) 0 0;
}
.props {
  display: grid;
  gap: var(--space-3);
  margin: var(--space-4) 0 0;
}
.props div {
  display: grid;
  grid-template-columns: 5.5rem minmax(0, 1fr);
  align-items: baseline;
  gap: var(--space-2);
}
.props dt {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}
.props dd {
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}
.props a {
  color: var(--accent-text);
}
.person {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.muted {
  display: block;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
.section-title {
  margin: var(--space-6) 0 var(--space-3);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}
.text {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
.log {
  display: grid;
  gap: var(--space-3);
  justify-items: stretch;
}
.log button {
  justify-self: end;
}
.activity {
  display: grid;
  gap: var(--space-3);
  margin: var(--space-4) 0 0;
  padding: 0;
  list-style: none;
}
.activity li {
  display: flex;
  gap: var(--space-3);
}
.activity-icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: var(--control-h-sm);
  height: var(--control-h-sm);
  border-radius: var(--radius-pill);
  background: var(--surface-hover);
  color: var(--text-secondary);
}
.activity-body {
  display: grid;
  min-width: 0;
}
.activity-text {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}
.activity-meta {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
@media (max-width: 900px) {
  .details {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: var(--z-drawer);
    width: min(100%, 22rem);
    box-shadow: var(--menu-shadow);
  }
  .details.is-auto {
    display: none;
  }
}
@media (max-width: 640px) {
  .body {
    padding: var(--space-4);
  }
  .board {
    grid-auto-columns: 85%;
  }
  .owner {
    flex: 1 1 8rem;
  }
}
.row-panel {
  position: fixed;
  z-index: var(--z-popover);
  max-width: calc(100vw - 2 * var(--space-4));
}
</style>
