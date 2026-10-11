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

import {
  type ActivityType,
  type Stage,
  type Owner,
  type Activity,
  type Deal,
  STAGES,
  OWNERS,
  THIS_MONTH,
  LOST_THIS_QUARTER,
  DEALS,
  MONEY,
  DAY,
  stageIndex,
} from "../data/crm";

const ACTIVITY_TYPES: Record<ActivityType, { label: string; icon: ShellIcon }> =
  {
    call: { label: "Call", icon: "audio-lines" },
    email: { label: "Email", icon: "share" },
    meeting: { label: "Meeting", icon: "meetings" },
    note: { label: "Note", icon: "notes" },
    stage: { label: "Stage change", icon: "move-horizontal" },
  };

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

<style scoped src="../styles/crm.css"></style>
<style scoped src="../styles/crm.twins.css"></style>
