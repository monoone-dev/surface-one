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
import { SoneCardDirective } from "@surface-one/angular/card";
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
} from "./data/crm";

const ACTIVITY_TYPES: Record<ActivityType, { label: string; icon: ShellIcon }> =
  {
    call: { label: "Call", icon: "audio-lines" },
    email: { label: "Email", icon: "share" },
    meeting: { label: "Meeting", icon: "meetings" },
    note: { label: "Note", icon: "notes" },
    stage: { label: "Stage change", icon: "move-horizontal" },
  };

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
    SoneCardDirective,
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
  `,
  styleUrl: "./styles/crm.css",
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
