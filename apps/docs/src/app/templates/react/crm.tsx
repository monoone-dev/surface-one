"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { createPortal, flushSync } from "react-dom";
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
  cx,
  type BadgeVariant,
  type SegmentOption,
  type ShellIcon,
  type SoneStep,
  type SoneTableColumn,
} from "@surface-one/react";

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

const VIEWS: readonly SegmentOption[] = [
  { value: "pipeline", label: "Pipeline", icon: "layout-grid" },
  { value: "list", label: "List", icon: "logs" },
];
const STAGE_STEPS: readonly SoneStep[] = STAGES.map((s) => ({
  key: s.id,
  label: s.label,
  description: `${s.probability}% probability`,
}));
const LOG_TYPES = (["call", "email", "meeting", "note"] as const).map(
  (value) => ({ value, label: ACTIVITY_TYPES[value].label }),
);

const stageIndex = (id: StageId): number =>
  STAGES.findIndex((s) => s.id === id);
const money = (value: number): string => MONEY.format(value);
const day = (iso: string): string => DAY.format(new Date(`${iso}T00:00:00Z`));
const stageOf = (deal: Deal): Stage => STAGES[stageIndex(deal.stage)]!;
const stageVariant = (deal: Deal): BadgeVariant =>
  deal.stage === "won" ? "success" : "secondary";
const ownerOf = (deal: Deal): Owner => OWNERS.find((o) => o.id === deal.owner)!;
const sumOf = (list: readonly Deal[]): number =>
  list.reduce((sum, d) => sum + d.value, 0);

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

function moveLabel(deal: Deal, delta: 1 | -1): string {
  const target = STAGES[stageIndex(deal.stage) + delta];
  if (!target) return delta > 0 ? "Already won" : "Already a lead";
  return delta > 0
    ? `Move ${deal.company} to ${target.label}`
    : `Move ${deal.company} back to ${target.label}`;
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

/** The "more" glyph of the row actions button. */
const DOTS = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

interface RowMenu {
  readonly row: Deal;
  readonly top: number;
  readonly right: number;
}

export default function CrmTemplate() {
  const root = useRef<HTMLDivElement>(null);
  const [deals, setDeals] = useState<readonly Deal[]>(DEALS);
  const [view, setView] = useState("pipeline");
  const [query, setQuery] = useState("");
  const [owner, setOwner] = useState("all");
  /** The deal in the detail panel. */
  const [selectedId, setSelectedId] = useState<string | null>("d4");
  /** The panel shows the initial deal: hidden on narrow screens until a deal is opened. */
  const [auto, setAuto] = useState(true);
  const [activityType, setActivityType] = useState("call");
  const [draft, setDraft] = useState("");
  const [announcement, setAnnouncement] = useState("");

  const visibleDeals = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deals.filter(
      (d) =>
        (owner === "all" || d.owner === owner) &&
        (!q ||
          d.company.toLowerCase().includes(q) ||
          d.contact.name.toLowerCase().includes(q)),
    );
  }, [deals, query, owner]);
  const columns = STAGES.map((stage, index) => {
    const list = visibleDeals.filter((d) => d.stage === stage.id);
    return { stage, index, deals: list, total: sumOf(list) };
  });
  const selected = deals.find((d) => d.id === selectedId) ?? null;

  const openDeals = deals.filter((d) => d.stage !== "won");
  const wonDeals = deals.filter((d) => d.stage === "won");
  const weightedValue = openDeals.reduce(
    (sum, d) => sum + (d.value * stageOf(d).probability) / 100,
    0,
  );
  const winRate = Math.round(
    (wonDeals.length / (wonDeals.length + LOST_THIS_QUARTER)) * 100,
  );
  const closingThisMonth = openDeals.filter((d) =>
    d.close.startsWith(THIS_MONTH),
  );

  function focus(selector: string): boolean {
    const el = root.current?.querySelector<HTMLElement>(selector);
    el?.focus();
    return !!el;
  }

  function open(id: string): void {
    flushSync(() => {
      setSelectedId(id);
      setAuto(false);
      setDraft("");
    });
    focus("#crm-detail-title");
  }

  function close(): void {
    const id = selectedId;
    flushSync(() => setSelectedId(null));
    if (id) focus(`#crm-open-${id}`);
  }

  function update(id: string, fn: (deal: Deal) => Deal): void {
    setDeals((all) => all.map((d) => (d.id === id ? fn(d) : d)));
  }

  function setStage(id: string, index: number): void {
    const stage = STAGES[index];
    const deal = deals.find((d) => d.id === id);
    if (!stage || !deal || deal.stage === stage.id) return;
    update(id, (d) => ({
      ...d,
      stage: stage.id,
      activities: [
        activity(d, "stage", `Moved to ${stage.label}`),
        ...d.activities,
      ],
    }));
    setAnnouncement(`${deal.company} moved to ${stage.label}.`);
  }

  /** Moves a deal one stage along; from a card, focus follows it to its new column. */
  function move(id: string, delta: 1 | -1, from?: "prev" | "next"): void {
    const deal = deals.find((d) => d.id === id);
    const target = deal && STAGES[stageIndex(deal.stage) + delta];
    if (!target) return;
    if (!from) return setStage(id, stageIndex(target.id));
    flushSync(() => setStage(id, stageIndex(target.id)));
    if (!focus(`#crm-${from}-${id}:not(:disabled)`)) focus(`#crm-open-${id}`);
  }

  function logActivity(event: FormEvent, id: string): void {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const type = activityType as ActivityType;
    update(id, (d) => ({
      ...d,
      activities: [activity(d, type, text), ...d.activities],
    }));
    setDraft("");
    setAnnouncement(`${ACTIVITY_TYPES[type].label} logged.`);
  }

  // A ghost icon button opens a SoneMenu, fixed to the viewport (portalled to <body>)
  // so the scrolling table never clips it.
  const [menu, setMenu] = useState<RowMenu | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const menuTrigger = useRef<HTMLElement | null>(null);

  const menuItems = (): HTMLElement[] =>
    Array.from(
      panel.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not(:disabled)',
      ) ?? [],
    );

  function toggleMenu(row: Deal, event: MouseEvent<HTMLElement>): void {
    if (menu?.row.id === row.id) return closeMenu();
    const trigger = event.currentTarget;
    menuTrigger.current = trigger;
    const rect = trigger.getBoundingClientRect();
    const next = {
      row,
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    };
    // Opened from the keyboard: move focus into the menu.
    if (event.detail !== 0) return setMenu(next);
    flushSync(() => setMenu(next));
    menuItems()[0]?.focus();
  }

  function closeMenu(restoreFocus = false): void {
    setMenu(null);
    if (restoreFocus) menuTrigger.current?.focus();
  }

  function menuAction(action: () => void): void {
    action();
    closeMenu(true);
  }

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
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

  // A click outside the open menu (and its trigger) closes it.
  useEffect(() => {
    if (!menu) return;
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target as Node;
      if (panel.current?.contains(target)) return;
      if (menuTrigger.current?.contains(target)) return;
      setMenu(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [menu]);

  const tableColumns: readonly SoneTableColumn<Deal>[] = [
    {
      key: "company",
      header: "Company",
      cell: (row) => (
        <span className="company">
          <button
            id={`crm-open-${row.id}`}
            type="button"
            className="deal-open"
            aria-controls={selected ? "crm-detail" : undefined}
            onClick={() => open(row.id)}
          >
            {row.company}
          </button>
          <span className="company-contact">{row.contact.name}</span>
        </span>
      ),
    },
    {
      key: "stage",
      header: "Stage",
      width: "120px",
      cell: (row) => (
        <SoneBadge variant={stageVariant(row)}>{stageOf(row).label}</SoneBadge>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      width: "140px",
      cell: (row) => ownerOf(row).name,
    },
    {
      key: "value",
      header: "Value",
      width: "100px",
      alignEnd: true,
      cell: (row) => <span className="num">{money(row.value)}</span>,
    },
    {
      key: "probability",
      header: "Probability",
      width: "100px",
      alignEnd: true,
      cell: (row) => <span className="num">{probabilityOf(row).value}%</span>,
    },
    {
      key: "close",
      header: "Close",
      width: "80px",
      alignEnd: true,
      cell: (row) => <span className="num">{day(row.close)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      hideHeader: true,
      width: "48px",
      cell: (row) => (
        <SoneButton
          variant="ghost"
          size="icon-xs"
          type="button"
          aria-haspopup="menu"
          aria-expanded={menu?.row.id === row.id}
          aria-controls={menu?.row.id === row.id ? "crm-row-menu" : undefined}
          aria-label={`Actions for ${row.company}`}
          title={`Actions for ${row.company}`}
          onClick={(event: MouseEvent<HTMLElement>) => toggleMenu(row, event)}
        >
          {DOTS}
        </SoneButton>
      ),
    },
  ];

  return (
    <div ref={root} className="shell tpl-crm">
      <style>{css}</style>
      <div className="body">
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
              <SoneIcon icon="download" />
              <span>Export</span>
            </SoneButton>
            <SoneButton size="sm" type="button">
              <SoneIcon icon="plus" />
              <span>New deal</span>
            </SoneButton>
          </SonePageHeaderActions>
        </SonePageHeader>

        <SoneStatGroup className="stats">
          <SoneStat size="sm">
            <SoneStatLabel>Open pipeline</SoneStatLabel>
            <SoneStatValue>{money(sumOf(openDeals))}</SoneStatValue>
            <SoneStatHint>Weighted {money(weightedValue)}</SoneStatHint>
          </SoneStat>
          <SoneStat size="sm">
            <SoneStatLabel>Win rate</SoneStatLabel>
            <SoneStatValue>{winRate}%</SoneStatValue>
            <SoneStatHint>
              {wonDeals.length} won · {LOST_THIS_QUARTER} lost this quarter
            </SoneStatHint>
          </SoneStat>
          <SoneStat size="sm">
            <SoneStatLabel>Closing this month</SoneStatLabel>
            <SoneStatValue>{closingThisMonth.length}</SoneStatValue>
            <SoneStatHint>Worth {money(sumOf(closingThisMonth))}</SoneStatHint>
          </SoneStat>
          <SoneStat size="sm">
            <SoneStatLabel>Won this quarter</SoneStatLabel>
            <SoneStatValue>{money(sumOf(wonDeals))}</SoneStatValue>
            <SoneStatHint>Across {wonDeals.length} deals</SoneStatHint>
          </SoneStat>
        </SoneStatGroup>

        <div className="toolbar">
          <SoneInputGroup className="search">
            <SoneInputGroupAddon as="span">
              <SoneIcon icon="search" />
            </SoneInputGroupAddon>
            <SoneInputGroupInput
              value={query}
              onValueChange={setQuery}
              type="search"
              aria-label="Search deals"
              placeholder="Search company or contact…"
            />
          </SoneInputGroup>
          <SoneSelect
            value={owner}
            onValueChange={setOwner}
            className="owner"
            aria-label="Owner"
          >
            <option value="all">All owners</option>
            {OWNERS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </SoneSelect>
          <SoneSegmented
            value={view}
            onValueChange={setView}
            ariaLabel="View"
            options={VIEWS}
          />
        </div>

        <h3 id="crm-deals-title" className="sr-only">
          {view === "pipeline" ? "Pipeline" : "All deals"}
        </h3>
        <p className="sr-only" role="status">
          {announcement}
        </p>

        {view === "pipeline" ? (
          <ul className="board" aria-labelledby="crm-deals-title">
            {columns.map((col) => (
              <li key={col.stage.id} className="column">
                <div className="column-head">
                  <h4 id={`crm-col-${col.stage.id}`} className="column-title">
                    {col.stage.label}
                  </h4>
                  <SoneBadge variant="outline" className="num">
                    {col.deals.length}
                    <span className="sr-only"> deals</span>
                  </SoneBadge>
                </div>
                <p className="column-total num">{money(col.total)}</p>
                {col.deals.length ? (
                  <ul
                    className="cards"
                    aria-labelledby={`crm-col-${col.stage.id}`}
                  >
                    {col.deals.map((d) => (
                      <SoneCard
                        key={d.id}
                        as="li"
                        size="sm"
                        className={cx(
                          "deal",
                          selectedId === d.id && "is-selected",
                        )}
                      >
                        <div className="deal-head">
                          <button
                            id={`crm-open-${d.id}`}
                            type="button"
                            className="deal-open"
                            aria-controls={selected ? "crm-detail" : undefined}
                            onClick={() => open(d.id)}
                          >
                            {d.company}
                          </button>
                          <SoneBadge variant={probabilityOf(d).variant}>
                            {probabilityOf(d).value}%
                            <span className="sr-only"> win probability</span>
                          </SoneBadge>
                        </div>
                        <p className="deal-contact">{d.contact.name}</p>
                        <p className="deal-value num">{money(d.value)}</p>
                        <div className="deal-foot">
                          <SoneAvatar size="sm" aria-hidden="true">
                            <SoneAvatarFallback>
                              {ownerOf(d).initials}
                            </SoneAvatarFallback>
                          </SoneAvatar>
                          <span className="sr-only">
                            Owner {ownerOf(d).name},
                          </span>
                          <span className="deal-close num">
                            <span className="sr-only">closes </span>
                            {day(d.close)}
                          </span>
                          <span className="deal-move">
                            <SoneButton
                              id={`crm-prev-${d.id}`}
                              variant="ghost"
                              size="icon-xs"
                              type="button"
                              disabled={col.index === 0}
                              aria-label={moveLabel(d, -1)}
                              title={moveLabel(d, -1)}
                              onClick={() => move(d.id, -1, "prev")}
                            >
                              <SoneIcon icon="chevron-right" className="flip" />
                            </SoneButton>
                            <SoneButton
                              id={`crm-next-${d.id}`}
                              variant="ghost"
                              size="icon-xs"
                              type="button"
                              disabled={col.index === STAGES.length - 1}
                              aria-label={moveLabel(d, 1)}
                              title={moveLabel(d, 1)}
                              onClick={() => move(d.id, 1, "next")}
                            >
                              <SoneIcon icon="chevron-right" />
                            </SoneButton>
                          </span>
                        </div>
                      </SoneCard>
                    ))}
                  </ul>
                ) : (
                  <p className="column-empty">No deals in this stage.</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="list">
            <SoneTable
              className="deals-table"
              rows={visibleDeals}
              columns={tableColumns}
              rowKey={(row) => row.id}
              isSelected={(row) => row.id === selectedId}
              caption="Deals in the pipeline"
              emptyText="No deals match these filters."
            />
          </div>
        )}
      </div>

      {/* No side panel component yet: the same classes as [soneSidePanel] and its parts. */}
      {selected ? (
        <div
          id="crm-detail"
          className={cx("side-panel details", auto && "is-auto")}
          data-slot="side-panel"
          role="region"
          aria-labelledby="crm-detail-title"
        >
          <div className="side-panel-header" data-slot="side-panel-header">
            <h3
              id="crm-detail-title"
              className="side-panel-title"
              data-slot="side-panel-title"
              tabIndex={-1}
            >
              {selected.company}
            </h3>
            <div className="side-panel-actions" data-slot="side-panel-actions">
              <SoneButton
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-label="Close deal details"
                onClick={close}
              >
                <SoneIcon icon="close" />
              </SoneButton>
            </div>
          </div>
          <div className="side-panel-content" data-slot="side-panel-content">
            <p className="detail-value num">{money(selected.value)}</p>
            <p className="detail-badges">
              <SoneBadge variant={stageVariant(selected)}>
                {stageOf(selected).label}
              </SoneBadge>
              <SoneBadge variant={probabilityOf(selected).variant}>
                {probabilityOf(selected).value}% probability
              </SoneBadge>
            </p>
            <dl className="props">
              <div>
                <dt>Owner</dt>
                <dd className="person">
                  <SoneAvatar size="sm" aria-hidden="true">
                    <SoneAvatarFallback>
                      {ownerOf(selected).initials}
                    </SoneAvatarFallback>
                  </SoneAvatar>
                  {ownerOf(selected).name}
                </dd>
              </div>
              <div>
                <dt>Close date</dt>
                <dd className="num">{day(selected.close)}</dd>
              </div>
            </dl>

            <h4 className="section-title">Stage</h4>
            <SoneStepper
              variant="numbered"
              orientation="vertical"
              aria-label="Deal stage"
              showCount={false}
              steps={STAGE_STEPS}
              current={stageIndex(selected.stage)}
              onCurrentChange={(index) => setStage(selected.id, index)}
            />

            <h4 className="section-title">Contact</h4>
            <dl className="props">
              <div>
                <dt>Name</dt>
                <dd>
                  {selected.contact.name}
                  <span className="muted">{selected.contact.title}</span>
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${selected.contact.email}`}>
                    {selected.contact.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd className="num">
                  <a href={`tel:${selected.contact.phone.replaceAll(" ", "")}`}>
                    {selected.contact.phone}
                  </a>
                </dd>
              </div>
            </dl>

            <h4 className="section-title">Next step</h4>
            <p className="text">{selected.nextStep}</p>

            <h4 className="section-title">Notes</h4>
            <p className="text">{selected.notes}</p>

            <h4 className="section-title">Activity</h4>
            <form
              className="log"
              onSubmit={(event) => logActivity(event, selected.id)}
            >
              <SoneField>
                <SoneFieldLabel htmlFor="crm-activity-type">
                  Type
                </SoneFieldLabel>
                <SoneSelect
                  value={activityType}
                  onValueChange={setActivityType}
                  size="sm"
                  selectId="crm-activity-type"
                >
                  {LOG_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </SoneSelect>
              </SoneField>
              <SoneField>
                <SoneFieldLabel htmlFor="crm-activity-text">
                  What happened?
                </SoneFieldLabel>
                <textarea
                  id="crm-activity-text"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={2}
                  placeholder="Called Sam about the redlines…"
                />
              </SoneField>
              <SoneButton size="sm" type="submit" disabled={!draft.trim()}>
                Log activity
              </SoneButton>
            </form>
            <ol className="activity" aria-label="Activity, newest first">
              {selected.activities.map((a) => (
                <li key={a.id}>
                  <span className="activity-icon" aria-hidden="true">
                    <SoneIcon icon={ACTIVITY_TYPES[a.type].icon} />
                  </span>
                  <span className="activity-body">
                    <span className="activity-text">{a.text}</span>
                    <span className="activity-meta">
                      {`${ACTIVITY_TYPES[a.type].label} · ${a.author} · ${a.when}`}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : null}

      {/* Portalled out of the root: `tpl-crm` on the menu itself keeps its styles applying. */}
      {menu
        ? createPortal(
            <SoneMenu
              id="crm-row-menu"
              ref={panel}
              className="tpl-crm row-panel"
              style={{ top: `${menu.top}px`, right: `${menu.right}px` }}
              aria-label={`Actions for ${menu.row.company}`}
              tabIndex={-1}
              onKeyDown={onMenuKeyDown}
            >
              <SoneMenuItem
                type="button"
                onClick={() => {
                  const id = menu.row.id;
                  closeMenu();
                  open(id);
                }}
              >
                <SoneIcon icon="eye" /> Open deal
              </SoneMenuItem>
              <SoneMenuItem
                type="button"
                disabled={menu.row.stage === "won"}
                onClick={() => menuAction(() => move(menu.row.id, 1))}
              >
                <SoneIcon icon="chevron-right" /> Move to next stage
              </SoneMenuItem>
              <SoneMenuItem
                type="button"
                disabled={menu.row.stage === "lead"}
                onClick={() => menuAction(() => move(menu.row.id, -1))}
              >
                <SoneIcon icon="chevron-right" className="flip" /> Move back
              </SoneMenuItem>
            </SoneMenu>,
            document.body,
          )
        : null}
    </div>
  );
}

const css = `
.tpl-crm.shell {
  position: relative;
  display: flex;
  height: 720px;
  overflow: hidden;
}
.tpl-crm .body {
  flex: 1 1 auto;
  min-width: 0;
  overflow-y: auto;
  padding: var(--space-6);
}
.tpl-crm .num {
  font-variant-numeric: tabular-nums;
}
.tpl-crm .flip {
  transform: scaleX(-1);
}
.tpl-crm .stats {
  margin: var(--space-5) 0;
}
.tpl-crm .toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}
.tpl-crm .search {
  flex: 1 1 14rem;
  min-width: 0;
}
.tpl-crm .owner {
  flex: 0 1 11rem;
}
.tpl-crm .board {
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
.tpl-crm .column {
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
.tpl-crm .column-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}
.tpl-crm .column-title {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}
.tpl-crm .column-total {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
.tpl-crm .column-empty {
  margin: 0;
  padding: var(--space-4) var(--space-2);
  border: var(--border-width-thin) dashed var(--border);
  border-radius: var(--radius);
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  text-align: center;
}
.tpl-crm .cards {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}
.tpl-crm .deal {
  gap: var(--space-1);
}
.tpl-crm .deal.is-selected {
  border-color: var(--accent);
}
.tpl-crm .deal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
}
.tpl-crm .deal-open {
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
.tpl-crm .deal-open:hover {
  text-decoration: underline;
}
.tpl-crm .deal-open:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
.tpl-crm .deal-contact {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
}
.tpl-crm .deal-value {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}
.tpl-crm .deal-foot {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-1);
}
.tpl-crm .deal-close {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
.tpl-crm .deal-move {
  display: inline-flex;
  gap: var(--space-1);
  margin-left: auto;
}
.tpl-crm .list {
  overflow-x: auto;
}
.tpl-crm .deals-table {
  min-width: 44rem;
}
.tpl-crm .company {
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-2);
  min-width: 0;
}
.tpl-crm .company-contact {
  overflow: hidden;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpl-crm .details {
  flex: none;
  width: 22rem;
}
.tpl-crm .details h3:focus {
  outline: none;
}
.tpl-crm .detail-value {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
}
.tpl-crm .detail-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin: var(--space-2) 0 0;
}
.tpl-crm .props {
  display: grid;
  gap: var(--space-3);
  margin: var(--space-4) 0 0;
}
.tpl-crm .props div {
  display: grid;
  grid-template-columns: 5.5rem minmax(0, 1fr);
  align-items: baseline;
  gap: var(--space-2);
}
.tpl-crm .props dt {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}
.tpl-crm .props dd {
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}
.tpl-crm .props a {
  color: var(--accent-text);
}
.tpl-crm .person {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.tpl-crm .muted {
  display: block;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
.tpl-crm .section-title {
  margin: var(--space-6) 0 var(--space-3);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}
.tpl-crm .text {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
.tpl-crm .log {
  display: grid;
  gap: var(--space-3);
  justify-items: stretch;
}
.tpl-crm .log button {
  justify-self: end;
}
.tpl-crm .activity {
  display: grid;
  gap: var(--space-3);
  margin: var(--space-4) 0 0;
  padding: 0;
  list-style: none;
}
.tpl-crm .activity li {
  display: flex;
  gap: var(--space-3);
}
.tpl-crm .activity-icon {
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
.tpl-crm .activity-body {
  display: grid;
  min-width: 0;
}
.tpl-crm .activity-text {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}
.tpl-crm .activity-meta {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
@media (max-width: 900px) {
  .tpl-crm .details {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: var(--z-drawer);
    width: min(100%, 22rem);
    box-shadow: var(--menu-shadow);
  }
  .tpl-crm .details.is-auto {
    display: none;
  }
}
@media (max-width: 640px) {
  .tpl-crm .body {
    padding: var(--space-4);
  }
  .tpl-crm .board {
    grid-auto-columns: 85%;
  }
  .tpl-crm .owner {
    flex: 1 1 8rem;
  }
}
.tpl-crm.row-panel {
  position: fixed;
  z-index: var(--z-popover);
  max-width: calc(100vw - 2 * var(--space-4));
}
`;
