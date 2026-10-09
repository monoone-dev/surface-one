import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
} from "@angular/core";
import { SONE_AVATAR_PARTS } from "@surface-one/angular/avatar";
import {
  SoneBadgeDirective,
  type BadgeVariant,
} from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent, type ShellIcon } from "@surface-one/angular/icon";
import {
  SONE_FIELD_PARTS,
  SONE_INPUT_GROUP_PARTS,
} from "@surface-one/angular/input";
import { SONE_MENU_PARTS } from "@surface-one/angular/menu";
import { SONE_PAGE_HEADER_PARTS } from "@surface-one/angular/page-header";
import { SoneRowMenuComponent } from "@surface-one/angular/row-menu";
import {
  SoneSegmentedComponent,
  type SegmentOption,
} from "@surface-one/angular/segmented";
import { SoneSelectComponent } from "@surface-one/angular/select";
import { SONE_SIDE_PANEL_PARTS } from "@surface-one/angular/side-panel";
import { SONE_STAT_PARTS } from "@surface-one/angular/stat";
import {
  SoneStepperComponent,
  type SoneStep,
} from "@surface-one/angular/stepper";
import {
  SoneTableColumnComponent,
  SoneTableComponent,
} from "@surface-one/angular/table";

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

@Component({
  selector: "docs-crm-template",
  imports: [
    ...SONE_AVATAR_PARTS,
    ...SONE_FIELD_PARTS,
    ...SONE_INPUT_GROUP_PARTS,
    ...SONE_MENU_PARTS,
    ...SONE_PAGE_HEADER_PARTS,
    ...SONE_SIDE_PANEL_PARTS,
    ...SONE_STAT_PARTS,
    SoneBadgeDirective,
    SoneButtonDirective,
    SoneIconComponent,
    SoneRowMenuComponent,
    SoneSegmentedComponent,
    SoneSelectComponent,
    SoneStepperComponent,
    SoneTableComponent,
    SoneTableColumnComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shell">
      <div class="body">
        <div sonePageHeader>
          <div sonePageHeaderContent>
            <p sonePageHeaderEyebrow>Sales · Q4 2026</p>
            <h2 sonePageHeaderTitle>Deals</h2>
            <p sonePageHeaderDescription>
              Every open opportunity, from first contact to signed contract.
            </p>
          </div>
          <div sonePageHeaderActions>
            <button soneBtn variant="outline" size="sm" type="button">
              <sone-icon icon="download" /><span>Export</span>
            </button>
            <button soneBtn size="sm" type="button">
              <sone-icon icon="plus" /><span>New deal</span>
            </button>
          </div>
        </div>

        <dl soneStatGroup class="stats">
          <div soneStat size="sm">
            <dt soneStatLabel>Open pipeline</dt>
            <dd soneStatValue>{{ money(openValue()) }}</dd>
            <dd soneStatHint>Weighted {{ money(weightedValue()) }}</dd>
          </div>
          <div soneStat size="sm">
            <dt soneStatLabel>Win rate</dt>
            <dd soneStatValue>{{ winRate() }}%</dd>
            <dd soneStatHint>
              {{ wonDeals().length }} won · {{ lost }} lost this quarter
            </dd>
          </div>
          <div soneStat size="sm">
            <dt soneStatLabel>Closing this month</dt>
            <dd soneStatValue>{{ closingThisMonth().length }}</dd>
            <dd soneStatHint>Worth {{ money(closingValue()) }}</dd>
          </div>
          <div soneStat size="sm">
            <dt soneStatLabel>Won this quarter</dt>
            <dd soneStatValue>{{ money(wonValue()) }}</dd>
            <dd soneStatHint>Across {{ wonDeals().length }} deals</dd>
          </div>
        </dl>

        <div class="toolbar">
          <div soneInputGroup class="search">
            <span soneInputGroupAddon><sone-icon icon="search" /></span>
            <input
              soneInputGroupInput
              type="search"
              aria-label="Search deals"
              placeholder="Search company or contact…"
              [value]="query()"
              (input)="query.set($any($event.target).value)"
            />
          </div>
          <sone-select class="owner" ariaLabel="Owner" [(value)]="owner">
            <option value="all">All owners</option>
            @for (o of owners; track o.id) {
              <option [value]="o.id">{{ o.name }}</option>
            }
          </sone-select>
          <sone-segmented ariaLabel="View" [options]="views" [(value)]="view" />
        </div>

        <h3 class="sr-only" id="crm-deals-title">
          {{ view() === "pipeline" ? "Pipeline" : "All deals" }}
        </h3>
        <p class="sr-only" role="status">{{ announcement() }}</p>

        @if (view() === "pipeline") {
          <ul class="board" aria-labelledby="crm-deals-title">
            @for (col of columns(); track col.stage.id) {
              <li class="column">
                <div class="column-head">
                  <h4 class="column-title" [id]="'crm-col-' + col.stage.id">
                    {{ col.stage.label }}
                  </h4>
                  <span soneBadge variant="outline" class="num"
                    >{{ col.deals.length
                    }}<span class="sr-only"> deals</span></span
                  >
                </div>
                <p class="column-total num">{{ money(col.total) }}</p>
                @if (col.deals.length) {
                  <ul
                    class="cards"
                    [attr.aria-labelledby]="'crm-col-' + col.stage.id"
                  >
                    @for (d of col.deals; track d.id) {
                      <li
                        soneCard
                        size="sm"
                        class="deal"
                        [class.is-selected]="selectedId() === d.id"
                      >
                        <div class="deal-head">
                          <button
                            type="button"
                            class="deal-open"
                            [id]="'crm-open-' + d.id"
                            [attr.aria-controls]="
                              selected() ? 'crm-detail' : null
                            "
                            (click)="open(d.id)"
                          >
                            {{ d.company }}
                          </button>
                          @let p = probabilityOf(d);
                          <span soneBadge [variant]="p.variant"
                            >{{ p.value }}%<span class="sr-only">
                              win probability</span
                            ></span
                          >
                        </div>
                        <p class="deal-contact">{{ d.contact.name }}</p>
                        <p class="deal-value num">{{ money(d.value) }}</p>
                        <div class="deal-foot">
                          @let o = ownerOf(d);
                          <sone-avatar size="sm" aria-hidden="true"
                            ><span soneAvatarFallback>{{
                              o.initials
                            }}</span></sone-avatar
                          >
                          <span class="sr-only">Owner {{ o.name }},</span>
                          <span class="deal-close num"
                            ><span class="sr-only">closes </span
                            >{{ day(d.close) }}</span
                          >
                          <span class="deal-move">
                            <button
                              soneBtn
                              variant="ghost"
                              size="icon-xs"
                              type="button"
                              [id]="'crm-prev-' + d.id"
                              [disabled]="col.index === 0"
                              [attr.aria-label]="moveLabel(d, -1)"
                              [title]="moveLabel(d, -1)"
                              (click)="move(d.id, -1, 'prev')"
                            >
                              <sone-icon icon="chevron-right" class="flip" />
                            </button>
                            <button
                              soneBtn
                              variant="ghost"
                              size="icon-xs"
                              type="button"
                              [id]="'crm-next-' + d.id"
                              [disabled]="col.index === stages.length - 1"
                              [attr.aria-label]="moveLabel(d, 1)"
                              [title]="moveLabel(d, 1)"
                              (click)="move(d.id, 1, 'next')"
                            >
                              <sone-icon icon="chevron-right" />
                            </button>
                          </span>
                        </div>
                      </li>
                    }
                  </ul>
                } @else {
                  <p class="column-empty">No deals in this stage.</p>
                }
              </li>
            }
          </ul>
        } @else {
          <div class="list">
            <sone-table
              class="deals-table"
              [rows]="visibleDeals()"
              [trackBy]="trackById"
              [isSelected]="isSelected"
              caption="Deals in the pipeline"
              emptyText="No deals match these filters."
            >
              <sone-table-column key="company" header="Company">
                <ng-template let-row>
                  <span class="company">
                    <button
                      type="button"
                      class="deal-open"
                      [id]="'crm-open-' + row.id"
                      [attr.aria-controls]="selected() ? 'crm-detail' : null"
                      (click)="open(row.id)"
                    >
                      {{ row.company }}
                    </button>
                    <span class="company-contact">{{ row.contact.name }}</span>
                  </span>
                </ng-template>
              </sone-table-column>
              <sone-table-column key="stage" header="Stage" width="120px">
                <ng-template let-row>
                  <span soneBadge [variant]="stageVariant(row)">{{
                    stageOf(row).label
                  }}</span>
                </ng-template>
              </sone-table-column>
              <sone-table-column key="owner" header="Owner" width="140px">
                <ng-template let-row>{{ ownerOf(row).name }}</ng-template>
              </sone-table-column>
              <sone-table-column
                key="value"
                header="Value"
                width="100px"
                [alignEnd]="true"
              >
                <ng-template let-row
                  ><span class="num">{{ money(row.value) }}</span></ng-template
                >
              </sone-table-column>
              <sone-table-column
                key="probability"
                header="Probability"
                width="100px"
                [alignEnd]="true"
              >
                <ng-template let-row
                  ><span class="num"
                    >{{ probabilityOf(row).value }}%</span
                  ></ng-template
                >
              </sone-table-column>
              <sone-table-column
                key="close"
                header="Close"
                width="80px"
                [alignEnd]="true"
              >
                <ng-template let-row
                  ><span class="num">{{ day(row.close) }}</span></ng-template
                >
              </sone-table-column>
              <sone-table-column
                key="actions"
                header="Actions"
                [hideHeader]="true"
                width="48px"
              >
                <ng-template let-row>
                  <sone-row-menu [label]="'Actions for ' + row.company">
                    <button
                      soneMenuItem
                      type="button"
                      role="menuitem"
                      (click)="open(row.id)"
                    >
                      <sone-icon icon="eye" /> Open deal
                    </button>
                    <button
                      soneMenuItem
                      type="button"
                      role="menuitem"
                      [disabled]="stageOf(row).id === 'won'"
                      (click)="move(row.id, 1)"
                    >
                      <sone-icon icon="chevron-right" /> Move to next stage
                    </button>
                    <button
                      soneMenuItem
                      type="button"
                      role="menuitem"
                      [disabled]="stageOf(row).id === 'lead'"
                      (click)="move(row.id, -1)"
                    >
                      <sone-icon icon="chevron-right" class="flip" /> Move back
                    </button>
                  </sone-row-menu>
                </ng-template>
              </sone-table-column>
            </sone-table>
          </div>
        }
      </div>

      @if (selected(); as deal) {
        <div
          soneSidePanel
          id="crm-detail"
          role="region"
          aria-labelledby="crm-detail-title"
          class="details"
          [class.is-auto]="auto()"
        >
          <div soneSidePanelHeader>
            <h3 soneSidePanelTitle id="crm-detail-title" tabindex="-1">
              {{ deal.company }}
            </h3>
            <div soneSidePanelActions>
              <button
                soneBtn
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-label="Close deal details"
                (click)="close()"
              >
                <sone-icon icon="close" />
              </button>
            </div>
          </div>
          <div soneSidePanelContent>
            @let p = probabilityOf(deal);
            <p class="detail-value num">{{ money(deal.value) }}</p>
            <p class="detail-badges">
              <span soneBadge [variant]="stageVariant(deal)">{{
                stageOf(deal).label
              }}</span>
              <span soneBadge [variant]="p.variant"
                >{{ p.value }}% probability</span
              >
            </p>
            <dl class="props">
              <div>
                <dt>Owner</dt>
                <dd class="person">
                  <sone-avatar size="sm" aria-hidden="true"
                    ><span soneAvatarFallback>{{
                      ownerOf(deal).initials
                    }}</span></sone-avatar
                  >
                  {{ ownerOf(deal).name }}
                </dd>
              </div>
              <div>
                <dt>Close date</dt>
                <dd class="num">{{ day(deal.close) }}</dd>
              </div>
            </dl>

            <h4 class="section-title">Stage</h4>
            <sone-stepper
              variant="numbered"
              orientation="vertical"
              ariaLabel="Deal stage"
              [showCount]="false"
              [steps]="stageSteps"
              [current]="stageIndexOf(deal)"
              (currentChange)="setStage(deal.id, $event)"
            />

            <h4 class="section-title">Contact</h4>
            <dl class="props">
              <div>
                <dt>Name</dt>
                <dd>
                  {{ deal.contact.name }}
                  <span class="muted">{{ deal.contact.title }}</span>
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a [href]="'mailto:' + deal.contact.email">{{
                    deal.contact.email
                  }}</a>
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd class="num">
                  <a [href]="'tel:' + deal.contact.phone.replaceAll(' ', '')">{{
                    deal.contact.phone
                  }}</a>
                </dd>
              </div>
            </dl>

            <h4 class="section-title">Next step</h4>
            <p class="text">{{ deal.nextStep }}</p>

            <h4 class="section-title">Notes</h4>
            <p class="text">{{ deal.notes }}</p>

            <h4 class="section-title">Activity</h4>
            <form class="log" (submit)="logActivity($event, deal.id)">
              <div soneField>
                <label soneFieldLabel for="crm-activity-type">Type</label>
                <sone-select
                  size="sm"
                  selectId="crm-activity-type"
                  [(value)]="activityType"
                >
                  @for (t of logTypes; track t.value) {
                    <option [value]="t.value">{{ t.label }}</option>
                  }
                </sone-select>
              </div>
              <div soneField>
                <label soneFieldLabel for="crm-activity-text"
                  >What happened?</label
                >
                <textarea
                  id="crm-activity-text"
                  rows="2"
                  placeholder="Called Sam about the redlines…"
                  [value]="draft()"
                  (input)="draft.set($any($event.target).value)"
                ></textarea>
              </div>
              <button
                soneBtn
                size="sm"
                type="submit"
                [disabled]="!draft().trim()"
              >
                Log activity
              </button>
            </form>
            <ol class="activity" aria-label="Activity, newest first">
              @for (a of deal.activities; track a.id) {
                <li>
                  <span class="activity-icon" aria-hidden="true"
                    ><sone-icon [icon]="activityIcon(a)"
                  /></span>
                  <span class="activity-body">
                    <span class="activity-text">{{ a.text }}</span>
                    <span class="activity-meta"
                      >{{ activityLabel(a) }} · {{ a.author }} ·
                      {{ a.when }}</span
                    >
                  </span>
                </li>
              }
            </ol>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
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
      border: 1px solid var(--border-subtle);
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
      border: 1px dashed var(--border);
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
  `,
})
export default class Template {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected readonly stages = STAGES;
  protected readonly owners = OWNERS;
  protected readonly lost = LOST_THIS_QUARTER;
  protected readonly views: readonly SegmentOption[] = [
    { value: "pipeline", label: "Pipeline", icon: "layout-grid" },
    { value: "list", label: "List", icon: "logs" },
  ];
  protected readonly stageSteps: readonly SoneStep[] = STAGES.map((s) => ({
    key: s.id,
    label: s.label,
    description: `${s.probability}% probability`,
  }));
  protected readonly logTypes = (
    ["call", "email", "meeting", "note"] as const
  ).map((value) => ({ value, label: ACTIVITY_TYPES[value].label }));

  protected readonly deals = signal<readonly Deal[]>(DEALS);
  protected readonly view = signal("pipeline");
  protected readonly query = signal("");
  protected readonly owner = signal("all");
  /** The deal in the detail panel. */
  protected readonly selectedId = signal<string | null>("d4");
  /** The panel shows the initial deal: hidden on narrow screens until a deal is opened. */
  protected readonly auto = signal(true);
  protected readonly activityType = signal("call");
  protected readonly draft = signal("");
  protected readonly announcement = signal("");

  protected readonly visibleDeals = computed(() => {
    const q = this.query().trim().toLowerCase();
    const owner = this.owner();
    return this.deals().filter(
      (d) =>
        (owner === "all" || d.owner === owner) &&
        (!q ||
          d.company.toLowerCase().includes(q) ||
          d.contact.name.toLowerCase().includes(q)),
    );
  });
  protected readonly columns = computed(() =>
    STAGES.map((stage, index) => {
      const deals = this.visibleDeals().filter((d) => d.stage === stage.id);
      return {
        stage,
        index,
        deals,
        total: deals.reduce((sum, d) => sum + d.value, 0),
      };
    }),
  );
  protected readonly selected = computed(
    () => this.deals().find((d) => d.id === this.selectedId()) ?? null,
  );

  private readonly openDeals = computed(() =>
    this.deals().filter((d) => d.stage !== "won"),
  );
  protected readonly wonDeals = computed(() =>
    this.deals().filter((d) => d.stage === "won"),
  );
  protected readonly openValue = computed(() =>
    this.openDeals().reduce((sum, d) => sum + d.value, 0),
  );
  protected readonly weightedValue = computed(() =>
    this.openDeals().reduce(
      (sum, d) => sum + (d.value * this.stageOf(d).probability) / 100,
      0,
    ),
  );
  protected readonly winRate = computed(() => {
    const won = this.wonDeals().length;
    return Math.round((won / (won + LOST_THIS_QUARTER)) * 100);
  });
  protected readonly closingThisMonth = computed(() =>
    this.openDeals().filter((d) => d.close.startsWith(THIS_MONTH)),
  );
  protected readonly closingValue = computed(() =>
    this.closingThisMonth().reduce((sum, d) => sum + d.value, 0),
  );
  protected readonly wonValue = computed(() =>
    this.wonDeals().reduce((sum, d) => sum + d.value, 0),
  );

  protected readonly trackById = (row: Deal): string => row.id;
  protected readonly isSelected = (row: Deal): boolean =>
    row.id === this.selectedId();

  protected money(value: number): string {
    return MONEY.format(value);
  }

  protected day(iso: string): string {
    return DAY.format(new Date(`${iso}T00:00:00Z`));
  }

  protected stageOf(deal: Deal): Stage {
    return STAGES[stageIndex(deal.stage)]!;
  }

  protected stageIndexOf(deal: Deal): number {
    return stageIndex(deal.stage);
  }

  protected stageVariant(deal: Deal): BadgeVariant {
    return deal.stage === "won" ? "success" : "secondary";
  }

  protected probabilityOf(deal: Deal): {
    value: number;
    variant: BadgeVariant;
  } {
    const value = this.stageOf(deal).probability;
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

  protected ownerOf(deal: Deal): Owner {
    return OWNERS.find((o) => o.id === deal.owner)!;
  }

  protected activityIcon(a: Activity): ShellIcon {
    return ACTIVITY_TYPES[a.type].icon;
  }

  protected activityLabel(a: Activity): string {
    return ACTIVITY_TYPES[a.type].label;
  }

  protected moveLabel(deal: Deal, delta: 1 | -1): string {
    const target = STAGES[stageIndex(deal.stage) + delta];
    if (!target) return delta > 0 ? "Already won" : "Already a lead";
    return delta > 0
      ? `Move ${deal.company} to ${target.label}`
      : `Move ${deal.company} back to ${target.label}`;
  }

  protected open(id: string): void {
    this.selectedId.set(id);
    this.auto.set(false);
    this.draft.set("");
    afterNextRender(() => this.focus("#crm-detail-title"), {
      injector: this.injector,
    });
  }

  protected close(): void {
    const id = this.selectedId();
    this.selectedId.set(null);
    if (id) {
      afterNextRender(() => this.focus(`#crm-open-${id}`), {
        injector: this.injector,
      });
    }
  }

  /** Moves a deal one stage along; from a card, focus follows it to its new column. */
  protected move(id: string, delta: 1 | -1, from?: "prev" | "next"): void {
    const deal = this.deals().find((d) => d.id === id);
    const target = deal && STAGES[stageIndex(deal.stage) + delta];
    if (!target) return;
    this.setStage(id, stageIndex(target.id));
    if (from) {
      afterNextRender(
        () =>
          this.focus(`#crm-${from}-${id}:not(:disabled)`) ||
          this.focus(`#crm-open-${id}`),
        { injector: this.injector },
      );
    }
  }

  protected setStage(id: string, index: number): void {
    const stage = STAGES[index];
    const deal = this.deals().find((d) => d.id === id);
    if (!stage || !deal || deal.stage === stage.id) return;
    this.update(id, (d) => ({
      ...d,
      stage: stage.id,
      activities: [
        this.activity(d, "stage", `Moved to ${stage.label}`),
        ...d.activities,
      ],
    }));
    this.announcement.set(`${deal.company} moved to ${stage.label}.`);
  }

  protected logActivity(event: Event, id: string): void {
    event.preventDefault();
    const text = this.draft().trim();
    if (!text) return;
    const type = this.activityType() as ActivityType;
    this.update(id, (d) => ({
      ...d,
      activities: [this.activity(d, type, text), ...d.activities],
    }));
    this.draft.set("");
    this.announcement.set(`${ACTIVITY_TYPES[type].label} logged.`);
  }

  private activity(deal: Deal, type: ActivityType, text: string): Activity {
    return {
      id: `a${deal.activities.length + 1}`,
      type,
      text,
      author: "You",
      when: "Just now",
    };
  }

  private update(id: string, fn: (deal: Deal) => Deal): void {
    this.deals.update((all) => all.map((d) => (d.id === id ? fn(d) : d)));
  }

  private focus(selector: string): boolean {
    const el = this.host.nativeElement.querySelector<HTMLElement>(selector);
    el?.focus();
    return !!el;
  }
}
