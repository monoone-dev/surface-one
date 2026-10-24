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
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneCardDirective } from "@surface-one/angular/card";
import { SoneIconComponent, type ShellIcon } from "@surface-one/angular/icon";
import {
  SONE_FIELD_PARTS,
  SONE_INPUT_GROUP_PARTS,
} from "@surface-one/angular/input";
import { SoneKbdComponent } from "@surface-one/angular/kbd";
import { SONE_MENU_PARTS } from "@surface-one/angular/menu";
import { SONE_PAGE_HEADER_PARTS } from "@surface-one/angular/page-header";
import { SoneProgressComponent } from "@surface-one/angular/progress";
import { SoneRowMenuComponent } from "@surface-one/angular/row-menu";
import {
  SoneSegmentedComponent,
  type SegmentOption,
} from "@surface-one/angular/segmented";
import { SoneSelectComponent } from "@surface-one/angular/select";
import { SONE_SIDE_PANEL_PARTS } from "@surface-one/angular/side-panel";
import {
  SoneStackedBarComponent,
  type SoneStackedBarSegment,
} from "@surface-one/angular/stacked-bar";
import { SONE_TOGGLE_PARTS } from "@surface-one/angular/toggle-group";

import {
  type StatusId,
  type IssueType,
  type PriorityId,
  type GroupBy,
  type Status,
  type Person,
  type Epic,
  type Comment,
  type Issue,
  type Lane,
  STATUSES,
  PEOPLE,
  ME,
  EPICS,
  POINTS,
  SPRINT,
  ISSUES,
  statusOf,
  personOf,
  epicOf,
  pointsOf,
  keyNumber,
} from "./data/board";

const TYPES: Record<IssueType, { label: string; icon: ShellIcon }> = {
  story: { label: "Story", icon: "bookmark" },
  task: { label: "Task", icon: "square-check" },
  bug: { label: "Bug", icon: "bug" },
};

const PRIORITIES: Record<PriorityId, { label: string; icon: ShellIcon }> = {
  highest: { label: "Highest", icon: "chevrons-up" },
  high: { label: "High", icon: "arrow-up" },
  medium: { label: "Medium", icon: "equal" },
  low: { label: "Low", icon: "arrow-down" },
  lowest: { label: "Lowest", icon: "chevrons-down" },
};

@Component({
  selector: "docs-board-template",
  imports: [
    ...SONE_AVATAR_PARTS,
    ...SONE_FIELD_PARTS,
    ...SONE_INPUT_GROUP_PARTS,
    ...SONE_MENU_PARTS,
    ...SONE_PAGE_HEADER_PARTS,
    ...SONE_SIDE_PANEL_PARTS,
    ...SONE_TOGGLE_PARTS,
    SoneBadgeDirective,
    SoneButtonDirective,
    SoneCardDirective,
    SoneIconComponent,
    SoneKbdComponent,
    SoneProgressComponent,
    SoneRowMenuComponent,
    SoneSegmentedComponent,
    SoneSelectComponent,
    SoneStackedBarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shell">
      <div class="body">
        <div sonePageHeader>
          <div sonePageHeaderContent>
            <p sonePageHeaderEyebrow>Projects / Surface One</p>
            <h2 sonePageHeaderTitle>{{ sprint.name }}</h2>
            <p sonePageHeaderDescription>
              {{ sprint.goal }}
              <span class="sprint-dates"
                ><sone-icon icon="clock" />{{ sprint.dates }} ·
                {{ sprint.remaining }} days remaining</span
              >
            </p>
          </div>
          <div sonePageHeaderActions>
            <button
              soneBtn
              variant="outline"
              size="sm"
              type="button"
              (click)="completeSprint()"
            >
              Complete sprint
            </button>
            <sone-row-menu label="Board actions" [prominent]="true">
              <button
                soneMenuItem
                type="button"
                (click)="say('Sprint details opened.')"
              >
                <sone-icon icon="edit" /> Edit sprint
              </button>
              <button
                soneMenuItem
                type="button"
                (click)="say('Board settings opened.')"
              >
                <sone-icon icon="sliders" /> Board settings
              </button>
              <button
                soneMenuItem
                type="button"
                (click)="say('Board link copied.')"
              >
                <sone-icon icon="link" /> Copy board link
              </button>
            </sone-row-menu>
          </div>
        </div>

        <div class="toolbar">
          <div soneInputGroup class="search">
            <span soneInputGroupAddon><sone-icon icon="search" /></span>
            <input
              soneInputGroupInput
              type="search"
              aria-label="Search issues"
              placeholder="Search this board…"
              [value]="query()"
              (input)="query.set($any($event.target).value)"
            />
          </div>
          <div class="people" role="group" aria-label="Filter by assignee">
            @for (p of people; track p.id) {
              <button
                type="button"
                class="person-filter"
                [attr.aria-pressed]="assignees().includes(p.id)"
                [title]="p.name"
                (click)="toggleAssignee(p.id)"
              >
                <sone-avatar size="sm" aria-hidden="true"
                  ><span soneAvatarFallback>{{ p.initials }}</span></sone-avatar
                >
                <span class="sr-only">{{ p.name }}</span>
              </button>
            }
          </div>
          <div
            soneToggleGroup
            variant="outline"
            size="sm"
            spacing="1"
            role="group"
            aria-label="Quick filters"
          >
            <button
              soneToggleGroupItem
              type="button"
              [pressed]="mine()"
              (click)="mine.set(!mine())"
            >
              Only my issues
            </button>
            <button
              soneToggleGroupItem
              type="button"
              [pressed]="recent()"
              (click)="recent.set(!recent())"
            >
              Recently updated
            </button>
            <button
              soneToggleGroupItem
              type="button"
              [pressed]="bugs()"
              (click)="bugs.set(!bugs())"
            >
              Bugs
            </button>
          </div>
          <sone-select
            class="epic-filter"
            size="sm"
            ariaLabel="Epic"
            [(value)]="epic"
          >
            <option value="all">All epics</option>
            @for (e of epics; track e.id) {
              <option [value]="e.id">{{ e.name }}</option>
            }
            <option value="none">No epic</option>
          </sone-select>
          <span class="group-by">
            <span class="group-label" aria-hidden="true">Group by</span>
            <sone-segmented
              size="sm"
              ariaLabel="Group by"
              [options]="groupOptions"
              [value]="groupBy()"
              (valueChange)="setGroupBy($event)"
            />
          </span>
          @if (filtering()) {
            <button
              soneBtn
              variant="ghost"
              size="sm"
              type="button"
              (click)="clearFilters()"
            >
              Clear filters
            </button>
          }
        </div>

        <div class="summary">
          <div class="sprint-progress">
            <p class="progress-text">
              <strong class="num">{{ donePoints() }}</strong> of
              <span class="num">{{ totalPoints() }}</span> story points done ·
              {{ doneCount() }} of {{ issues().length }} issues
            </p>
            <sone-stacked-bar
              size="sm"
              ariaLabel="Sprint progress in story points"
              [segments]="progressSegments()"
              [max]="totalPoints()"
            />
          </div>
          <p class="hint" id="board-hint">
            Drag issues between columns, or focus one and press
            <sone-kbd>Shift</sone-kbd> + <sone-kbd>←</sone-kbd> /
            <sone-kbd>→</sone-kbd>.
          </p>
        </div>

        <h3 class="sr-only" id="board-title" tabindex="-1">Board</h3>
        <p class="sr-only" role="status">{{ announcement() }}</p>

        <div class="board-scroll">
          <div class="board">
            <div class="board-head">
              @for (col of columns(); track col.status.id) {
                <div class="col-head" [class.is-over]="col.over">
                  <h4 class="col-title" [id]="'board-col-' + col.status.id">
                    {{ col.status.label }}
                  </h4>
                  <span
                    soneBadge
                    [variant]="col.over ? 'destructive' : 'secondary'"
                    class="num"
                    >{{ col.count }}<span class="sr-only"> issues</span></span
                  >
                  @if (col.status.wip !== null) {
                    <span class="wip">Max {{ col.status.wip }}</span>
                    @if (col.over) {
                      <span class="sr-only">Over the limit</span>
                    }
                  }
                </div>
              }
            </div>

            @for (lane of lanes(); track lane.key) {
              <div class="lane">
                @if (lane.title !== null) {
                  <h4 class="lane-head">
                    <button
                      type="button"
                      class="lane-toggle"
                      [attr.aria-expanded]="!collapsed().includes(lane.key)"
                      [attr.aria-controls]="'board-lane-' + lane.key"
                      (click)="toggleLane(lane.key)"
                    >
                      <sone-icon icon="chevron-right" class="lane-caret" />
                      @if (lane.person) {
                        <sone-avatar size="sm" aria-hidden="true"
                          ><span soneAvatarFallback>{{
                            lane.person.initials
                          }}</span></sone-avatar
                        >
                      } @else if (lane.epic) {
                        <span class="epic-dot" [style.--tone]="tone(lane.epic)"
                          ><sone-icon icon="zap"
                        /></span>
                      }
                      <span
                        class="lane-name"
                        [id]="'board-lane-name-' + lane.key"
                        >{{ lane.title }}</span
                      >
                      <span class="lane-meta"
                        >{{ lane.count }}
                        {{ lane.count === 1 ? "issue" : "issues" }} ·
                        {{ lane.points }} points</span
                      >
                    </button>
                  </h4>
                }
                @if (!collapsed().includes(lane.key)) {
                  <div class="cells" [id]="'board-lane-' + lane.key">
                    @for (cell of lane.cells; track cell.status.id) {
                      <ul
                        class="cell"
                        [class.is-drop]="
                          dropTarget() === lane.key + ':' + cell.status.id
                        "
                        [attr.aria-labelledby]="cellLabel(lane, cell.status)"
                        (dragover)="
                          onDragOver($event, lane.key, cell.status.id)
                        "
                        (dragleave)="
                          onDragLeave($event, lane.key, cell.status.id)
                        "
                        (drop)="onDrop($event, lane.key, cell.status.id)"
                      >
                        @for (i of cell.issues; track i.id) {
                          @let assignee = personOf(i.assignee);
                          @let epic = epicOf(i.epic);
                          <li
                            soneCard
                            size="sm"
                            class="issue"
                            draggable="true"
                            [attr.data-status]="i.status"
                            [class.is-flagged]="i.flagged"
                            [class.is-selected]="selectedId() === i.id"
                            [class.is-dragging]="dragId() === i.id"
                            (dragstart)="onDragStart($event, i.id)"
                            (dragend)="onDragEnd()"
                          >
                            <div class="issue-head">
                              <button
                                type="button"
                                class="issue-open"
                                [id]="'board-open-' + i.id"
                                [attr.aria-describedby]="'board-meta-' + i.id"
                                [attr.aria-controls]="
                                  selected() ? 'board-detail' : null
                                "
                                aria-keyshortcuts="Shift+ArrowLeft Shift+ArrowRight"
                                (click)="open(i.id)"
                                (keydown)="onCardKeydown($event, i)"
                              >
                                {{ i.summary }}
                              </button>
                              <sone-row-menu
                                class="issue-menu"
                                [label]="'Actions for ' + i.id"
                              >
                                <div soneMenuGroup aria-label="Move to">
                                  <p soneMenuLabel>Move to</p>
                                  @for (s of statuses; track s.id) {
                                    <button
                                      soneMenuRadioItem
                                      type="button"
                                      [checked]="i.status === s.id"
                                      (click)="moveFromMenu(i.id, s.id)"
                                    >
                                      {{ s.label }}
                                    </button>
                                  }
                                </div>
                                <div soneMenuSeparator></div>
                                <button
                                  soneMenuItem
                                  type="button"
                                  (click)="open(i.id)"
                                >
                                  <sone-icon icon="eye" /> Open issue
                                </button>
                                <button
                                  soneMenuItem
                                  type="button"
                                  [disabled]="i.assignee === me"
                                  (click)="assign(i.id, me)"
                                >
                                  <sone-icon icon="user" /> Assign to me
                                </button>
                                <button
                                  soneMenuItem
                                  type="button"
                                  (click)="toggleFlag(i.id)"
                                >
                                  <sone-icon icon="alert-circle" />
                                  {{ i.flagged ? "Remove flag" : "Add flag" }}
                                </button>
                                <div soneMenuSeparator></div>
                                <button
                                  soneMenuItem
                                  variant="destructive"
                                  type="button"
                                  (click)="remove(i.id)"
                                >
                                  <sone-icon icon="trash" /> Delete
                                </button>
                              </sone-row-menu>
                            </div>
                            @if (epic || i.labels.length) {
                              <p class="issue-tags">
                                @if (epic) {
                                  <span
                                    class="epic-tag"
                                    [style.--tone]="tone(epic)"
                                    >{{ epic.name }}</span
                                  >
                                }
                                @for (l of i.labels; track l) {
                                  <span soneBadge variant="outline">{{
                                    l
                                  }}</span>
                                }
                              </p>
                            }
                            <div class="issue-meta" [id]="'board-meta-' + i.id">
                              <span class="type-icon" [attr.data-type]="i.type"
                                ><sone-icon
                                  [icon]="typeIcon(i)"
                                  [label]="typeLabel(i)"
                              /></span>
                              <span class="issue-key">{{ i.id }}</span>
                              @if (i.flagged) {
                                <span class="flag"
                                  ><sone-icon
                                    icon="alert-circle"
                                    label="Flagged"
                                /></span>
                              }
                              @if (i.subtasks.length) {
                                <span class="meta-count num"
                                  ><sone-icon icon="list-checks" />{{
                                    subtasksDone(i)
                                  }}/{{ i.subtasks.length
                                  }}<span class="sr-only">
                                    subtasks done</span
                                  ></span
                                >
                              }
                              @if (i.comments.length) {
                                <span class="meta-count num"
                                  ><sone-icon icon="message-square" />{{
                                    i.comments.length
                                  }}<span class="sr-only">
                                    {{
                                      i.comments.length === 1
                                        ? "comment"
                                        : "comments"
                                    }}</span
                                  ></span
                                >
                              }
                              <span class="meta-end">
                                @if (i.points !== null) {
                                  <span
                                    soneBadge
                                    variant="secondary"
                                    class="points num"
                                    >{{ i.points
                                    }}<span class="sr-only">
                                      story points</span
                                    ></span
                                  >
                                }
                                <span
                                  class="priority"
                                  [attr.data-priority]="i.priority"
                                  ><sone-icon
                                    [icon]="priorityIcon(i)"
                                    [label]="priorityLabel(i) + ' priority'"
                                /></span>
                                @if (assignee) {
                                  <sone-avatar
                                    size="sm"
                                    aria-hidden="true"
                                    [title]="assignee.name"
                                    ><span soneAvatarFallback>{{
                                      assignee.initials
                                    }}</span></sone-avatar
                                  >
                                  <span class="sr-only"
                                    >Assigned to {{ assignee.name }}</span
                                  >
                                } @else {
                                  <span class="unassigned" title="Unassigned"
                                    ><sone-icon icon="user" label="Unassigned"
                                  /></span>
                                }
                              </span>
                            </div>
                          </li>
                        }
                      </ul>
                    }
                  </div>
                }
              </div>
            }

            <div class="board-foot">
              @if (creating()) {
                <form class="create-form" (submit)="create($event)">
                  <sone-select
                    size="sm"
                    ariaLabel="Issue type"
                    [(value)]="newType"
                  >
                    @for (t of typeOptions; track t.value) {
                      <option [value]="t.value">{{ t.label }}</option>
                    }
                  </sone-select>
                  <input
                    id="board-new-summary"
                    type="text"
                    aria-label="Summary of the new issue"
                    placeholder="What needs to be done?"
                    autocomplete="off"
                    [value]="newSummary()"
                    (input)="newSummary.set($any($event.target).value)"
                    (keydown.escape)="cancelCreate()"
                  />
                  <div class="create-actions">
                    <button
                      soneBtn
                      variant="ghost"
                      size="sm"
                      type="button"
                      (click)="cancelCreate()"
                    >
                      Cancel
                    </button>
                    <button
                      soneBtn
                      size="sm"
                      type="submit"
                      [disabled]="!newSummary().trim()"
                    >
                      Create
                    </button>
                  </div>
                </form>
              } @else {
                <button
                  soneBtn
                  variant="ghost"
                  size="sm"
                  type="button"
                  id="board-create"
                  class="create-btn"
                  (click)="startCreate()"
                >
                  <sone-icon icon="plus" /><span>Create issue</span>
                </button>
              }
            </div>
          </div>
        </div>
        @if (!visible().length) {
          <p class="no-results">No issues match these filters.</p>
        }
      </div>

      @if (selected(); as issue) {
        <div
          soneSidePanel
          id="board-detail"
          role="region"
          aria-labelledby="board-detail-title"
          class="details"
          (keydown.escape)="close()"
        >
          <div soneSidePanelHeader>
            <h3 soneSidePanelTitle id="board-detail-title" tabindex="-1">
              <span class="type-icon" [attr.data-type]="issue.type"
                ><sone-icon [icon]="typeIcon(issue)" [label]="typeLabel(issue)"
              /></span>
              {{ issue.id }}
            </h3>
            <div soneSidePanelActions>
              <button
                soneBtn
                variant="ghost"
                size="icon-sm"
                type="button"
                [attr.aria-pressed]="issue.flagged"
                aria-label="Flagged"
                title="Flagged"
                (click)="toggleFlag(issue.id)"
              >
                <sone-icon icon="alert-circle" />
              </button>
              <button
                soneBtn
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-label="Close issue details"
                (click)="close()"
              >
                <sone-icon icon="close" />
              </button>
            </div>
          </div>
          <div soneSidePanelContent>
            @if (issue.flagged) {
              <p class="flag-note">
                <sone-icon icon="alert-circle" /> Flagged as an impediment
              </p>
            }
            <div soneField>
              <label soneFieldLabel for="board-summary">Summary</label>
              <textarea
                id="board-summary"
                class="summary-input"
                rows="2"
                [value]="issue.summary"
                (change)="rename(issue.id, $any($event.target).value)"
                (keydown.enter)="
                  $event.preventDefault(); $any($event.target).blur()
                "
              ></textarea>
            </div>

            <div class="fields">
              <div soneField>
                <label soneFieldLabel for="board-status">Status</label>
                <sone-select
                  size="sm"
                  selectId="board-status"
                  [value]="issue.status"
                  (selectionChange)="moveTo(issue.id, $any($event))"
                >
                  @for (s of statuses; track s.id) {
                    <option [value]="s.id">{{ s.label }}</option>
                  }
                </sone-select>
              </div>
              <div soneField>
                <label soneFieldLabel for="board-assignee">Assignee</label>
                <sone-select
                  size="sm"
                  selectId="board-assignee"
                  [value]="issue.assignee ?? ''"
                  (selectionChange)="assign(issue.id, $event || null)"
                >
                  <option value="">Unassigned</option>
                  @for (p of people; track p.id) {
                    <option [value]="p.id">{{ p.name }}</option>
                  }
                </sone-select>
              </div>
              <div soneField>
                <label soneFieldLabel for="board-priority">Priority</label>
                <sone-select
                  size="sm"
                  selectId="board-priority"
                  [value]="issue.priority"
                  (selectionChange)="
                    patch(issue.id, { priority: $any($event) })
                  "
                >
                  @for (p of priorityOptions; track p.value) {
                    <option [value]="p.value">{{ p.label }}</option>
                  }
                </sone-select>
              </div>
              <div soneField>
                <label soneFieldLabel for="board-points">Story points</label>
                <sone-select
                  size="sm"
                  selectId="board-points"
                  [value]="issue.points === null ? '' : '' + issue.points"
                  (selectionChange)="setPoints(issue.id, $event)"
                >
                  <option value="">None</option>
                  @for (n of points; track n) {
                    <option [value]="'' + n">{{ n }}</option>
                  }
                </sone-select>
              </div>
              <div soneField class="wide">
                <label soneFieldLabel for="board-epic">Epic</label>
                <sone-select
                  size="sm"
                  selectId="board-epic"
                  [value]="issue.epic ?? ''"
                  (selectionChange)="patch(issue.id, { epic: $event || null })"
                >
                  <option value="">No epic</option>
                  @for (e of epics; track e.id) {
                    <option [value]="e.id">{{ e.name }}</option>
                  }
                </sone-select>
              </div>
            </div>

            <dl class="props">
              <div>
                <dt>Reporter</dt>
                <dd class="person">
                  @let reporter = personOf(issue.reporter);
                  @if (reporter) {
                    <sone-avatar size="sm" aria-hidden="true"
                      ><span soneAvatarFallback>{{
                        reporter.initials
                      }}</span></sone-avatar
                    >
                    {{ reporter.name }}
                  }
                </dd>
              </div>
              <div>
                <dt>Labels</dt>
                <dd class="tags">
                  @for (l of issue.labels; track l) {
                    <span soneBadge variant="outline">{{ l }}</span>
                  } @empty {
                    None
                  }
                </dd>
              </div>
              <div>
                <dt>Sprint</dt>
                <dd>{{ sprint.name }}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>{{ updatedLabel(issue) }}</dd>
              </div>
            </dl>

            <h4 class="section-title">Description</h4>
            <p class="text">{{ issue.description }}</p>

            <h4 class="section-title" id="board-subtasks-title">
              Subtasks
              @if (issue.subtasks.length) {
                <span class="section-count num"
                  >{{ subtasksDone(issue) }} of
                  {{ issue.subtasks.length }} done</span
                >
              }
            </h4>
            @if (issue.subtasks.length) {
              <sone-progress
                ariaLabel="Subtasks done"
                [value]="subtasksDone(issue)"
                [max]="issue.subtasks.length"
              />
              <ul class="subtasks" aria-labelledby="board-subtasks-title">
                @for (t of issue.subtasks; track t.id) {
                  <li>
                    <input
                      type="checkbox"
                      [id]="'board-subtask-' + t.id"
                      [checked]="t.done"
                      (change)="toggleSubtask(issue.id, t.id)"
                    />
                    <label
                      [for]="'board-subtask-' + t.id"
                      [class.is-done]="t.done"
                      >{{ t.title }}</label
                    >
                  </li>
                }
              </ul>
            } @else {
              <p class="text muted">No subtasks yet.</p>
            }

            <h4 class="section-title">Activity</h4>
            <form class="comment-form" (submit)="addComment($event, issue.id)">
              <div soneField>
                <label soneFieldLabel for="board-comment">Add a comment</label>
                <textarea
                  id="board-comment"
                  rows="2"
                  placeholder="Ask a question or post an update…"
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
                Save
              </button>
            </form>
            @if (issue.comments.length) {
              <ol class="comments" aria-label="Comments, newest first">
                @for (c of commentsOf(issue); track c.id) {
                  @let author = personOf(c.author);
                  <li>
                    <sone-avatar size="sm" aria-hidden="true"
                      ><span soneAvatarFallback>{{
                        author?.initials
                      }}</span></sone-avatar
                    >
                    <span class="comment-body">
                      <span class="comment-meta"
                        ><strong>{{ author?.name }}</strong> ·
                        {{ c.when }}</span
                      >
                      <span class="comment-text">{{ c.text }}</span>
                    </span>
                  </li>
                }
              </ol>
            }
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
  styleUrl: "./styles/board.css",
})
export default class BoardTemplate {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected readonly sprint = SPRINT;
  protected readonly statuses = STATUSES;
  protected readonly people = PEOPLE;
  protected readonly epics = EPICS;
  protected readonly points = POINTS;
  protected readonly me = ME;
  protected readonly groupOptions: readonly SegmentOption[] = [
    { value: "none", label: "None" },
    { value: "assignee", label: "Assignee" },
    { value: "epic", label: "Epic" },
  ];
  protected readonly typeOptions = (Object.keys(TYPES) as IssueType[]).map(
    (value) => ({ value, label: TYPES[value].label }),
  );
  protected readonly priorityOptions = (
    Object.keys(PRIORITIES) as PriorityId[]
  ).map((value) => ({ value, label: PRIORITIES[value].label }));

  protected readonly issues = signal<readonly Issue[]>(ISSUES);
  protected readonly query = signal("");
  protected readonly assignees = signal<readonly string[]>([]);
  protected readonly mine = signal(false);
  protected readonly recent = signal(false);
  protected readonly bugs = signal(false);
  protected readonly epic = signal("all");
  protected readonly groupBy = signal<GroupBy>("none");
  protected readonly collapsed = signal<readonly string[]>([]);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly dragId = signal<string | null>(null);
  /** `<lane>:<status>` under the dragged card. */
  protected readonly dropTarget = signal<string | null>(null);
  protected readonly creating = signal(false);
  protected readonly newType = signal<string>("story");
  protected readonly newSummary = signal("");
  protected readonly draft = signal("");
  protected readonly announcement = signal("");

  protected readonly filtering = computed(
    () =>
      !!this.query().trim() ||
      this.assignees().length > 0 ||
      this.mine() ||
      this.recent() ||
      this.bugs() ||
      this.epic() !== "all",
  );

  protected readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    const people = this.assignees();
    const epic = this.epic();
    return this.issues().filter(
      (i) =>
        (!q ||
          i.summary.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q)) &&
        (!people.length || people.includes(i.assignee ?? "")) &&
        (!this.mine() || i.assignee === ME) &&
        (!this.recent() || i.updated <= 1) &&
        (!this.bugs() || i.type === "bug") &&
        (epic === "all" || (i.epic ?? "none") === epic),
    );
  });

  protected readonly columns = computed(() =>
    STATUSES.map((status) => ({
      status,
      count: this.visible().filter((i) => i.status === status.id).length,
      // The limit counts every issue in the column, filtered out or not.
      over:
        status.wip !== null &&
        this.issues().filter((i) => i.status === status.id).length > status.wip,
    })),
  );

  protected readonly lanes = computed<readonly Lane[]>(() => {
    const issues = this.visible();
    const lane = (
      key: string,
      title: string | null,
      list: readonly Issue[],
      person: Person | null = null,
      epic: Epic | null = null,
    ): Lane => ({
      key,
      title,
      person,
      epic,
      count: list.length,
      points: pointsOf(list),
      cells: STATUSES.map((status) => ({
        status,
        issues: list.filter((i) => i.status === status.id),
      })),
    });
    const group = this.groupBy();
    if (group === "none") return [lane("all", null, issues)];
    if (group === "assignee") {
      return [
        ...PEOPLE.map((p) =>
          lane(
            p.id,
            p.id === ME ? `${p.name} (you)` : p.name,
            issues.filter((i) => i.assignee === p.id),
            p,
          ),
        ),
        lane(
          "none",
          "Unassigned",
          issues.filter((i) => !i.assignee),
        ),
      ].filter((l) => l.count > 0);
    }
    return [
      ...EPICS.map((e) =>
        lane(
          e.id,
          e.name,
          issues.filter((i) => i.epic === e.id),
          null,
          e,
        ),
      ),
      lane(
        "none",
        "No epic",
        issues.filter((i) => !i.epic),
      ),
    ].filter((l) => l.count > 0);
  });

  protected readonly totalPoints = computed(() => pointsOf(this.issues()));
  protected readonly donePoints = computed(() =>
    pointsOf(this.issues().filter((i) => i.status === "done")),
  );
  protected readonly doneCount = computed(
    () => this.issues().filter((i) => i.status === "done").length,
  );
  protected readonly progressSegments = computed<SoneStackedBarSegment[]>(
    () => {
      const sum = (status: StatusId) =>
        pointsOf(this.issues().filter((i) => i.status === status));
      return [
        { key: "done", label: "Done", value: sum("done"), tone: "success" },
        {
          key: "review",
          label: "In review",
          value: sum("review"),
          tone: "chart-6",
        },
        {
          key: "progress",
          label: "In progress",
          value: sum("progress"),
          tone: "accent",
        },
      ];
    },
  );

  protected readonly selected = computed(
    () => this.issues().find((i) => i.id === this.selectedId()) ?? null,
  );

  protected readonly personOf = personOf;
  protected readonly epicOf = epicOf;

  protected tone(epic: Epic): string {
    return `var(--${epic.tone})`;
  }

  protected typeIcon(i: Issue): ShellIcon {
    return TYPES[i.type].icon;
  }

  protected typeLabel(i: Issue): string {
    return TYPES[i.type].label;
  }

  protected priorityIcon(i: Issue): ShellIcon {
    return PRIORITIES[i.priority].icon;
  }

  protected priorityLabel(i: Issue): string {
    return PRIORITIES[i.priority].label;
  }

  protected subtasksDone(i: Issue): number {
    return i.subtasks.filter((t) => t.done).length;
  }

  protected commentsOf(i: Issue): readonly Comment[] {
    return [...i.comments].reverse();
  }

  protected updatedLabel(i: Issue): string {
    if (i.updated === 0) return "Today";
    return i.updated === 1 ? "Yesterday" : `${i.updated} days ago`;
  }

  /** The column heading, prefixed by the lane name when the board is grouped. */
  protected cellLabel(lane: Lane, status: Status): string {
    const column = `board-col-${status.id}`;
    return lane.title === null
      ? column
      : `board-lane-name-${lane.key} ${column}`;
  }

  protected say(message: string): void {
    this.announcement.set(message);
  }

  protected completeSprint(): void {
    const open = this.issues().filter((i) => i.status !== "done").length;
    this.say(
      `${SPRINT.name} completed: ${this.doneCount()} issues done, ${open} moved to the next sprint.`,
    );
  }

  protected toggleAssignee(id: string): void {
    this.assignees.update((list) =>
      list.includes(id) ? list.filter((p) => p !== id) : [...list, id],
    );
  }

  protected setGroupBy(value: string): void {
    this.groupBy.set(value as GroupBy);
    this.collapsed.set([]);
  }

  protected toggleLane(key: string): void {
    this.collapsed.update((list) =>
      list.includes(key) ? list.filter((k) => k !== key) : [...list, key],
    );
  }

  protected clearFilters(): void {
    this.query.set("");
    this.assignees.set([]);
    this.mine.set(false);
    this.recent.set(false);
    this.bugs.set(false);
    this.epic.set("all");
  }

  protected open(id: string): void {
    this.selectedId.set(id);
    this.draft.set("");
    afterNextRender(() => this.focus("#board-detail-title"), {
      injector: this.injector,
    });
  }

  protected close(): void {
    const id = this.selectedId();
    this.selectedId.set(null);
    if (id) this.focusLater(`#board-open-${id}`);
  }

  // ---- Moving issues: drag and drop, the card menu, the keyboard, the panel.

  protected onDragStart(event: DragEvent, id: string): void {
    this.dragId.set(id);
    event.dataTransfer?.setData("text/plain", id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
  }

  protected onDragEnd(): void {
    this.dragId.set(null);
    this.dropTarget.set(null);
  }

  protected onDragOver(event: DragEvent, lane: string, status: StatusId): void {
    if (!this.dragId()) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    this.dropTarget.set(`${lane}:${status}`);
  }

  protected onDragLeave(
    event: DragEvent,
    lane: string,
    status: StatusId,
  ): void {
    const into = event.relatedTarget as Node | null;
    if (into && (event.currentTarget as Node).contains(into)) return;
    if (this.dropTarget() === `${lane}:${status}`) this.dropTarget.set(null);
  }

  protected onDrop(event: DragEvent, lane: string, status: StatusId): void {
    event.preventDefault();
    const id = this.dragId() ?? event.dataTransfer?.getData("text/plain");
    this.onDragEnd();
    if (!id) return;
    // Dropped in another swimlane: the card takes that lane's assignee or epic.
    const group = this.groupBy();
    const value = lane === "none" ? null : lane;
    if (group === "assignee") this.assign(id, value, false);
    if (group === "epic") this.patch(id, { epic: value });
    this.moveTo(id, status);
  }

  /** Shift + ← / → moves the focused card one column; focus follows it. */
  protected onCardKeydown(event: KeyboardEvent, issue: Issue): void {
    if (!event.shiftKey) return;
    const delta =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const index = STATUSES.findIndex((s) => s.id === issue.status) + delta;
    const target = STATUSES[index];
    if (!target) return;
    this.moveTo(issue.id, target.id);
    this.focusLater(`#board-open-${issue.id}`);
  }

  protected moveTo(id: string, status: StatusId): void {
    const issue = this.issues().find((i) => i.id === id);
    if (!issue || issue.status === status) return;
    // A moved card goes to the bottom of its new column.
    this.issues.update((all) => [
      ...all.filter((i) => i.id !== id),
      { ...issue, status, updated: 0 },
    ]);
    const target = statusOf(status);
    const over =
      target.wip !== null &&
      this.issues().filter((i) => i.status === status).length > target.wip;
    this.say(
      `${id} moved to ${target.label}.` +
        (over ? ` ${target.label} is over its limit of ${target.wip}.` : ""),
    );
  }

  /** From the card menu: focus follows the card to its new column. */
  protected moveFromMenu(id: string, status: StatusId): void {
    this.moveTo(id, status);
    this.focusLater(`#board-open-${id}`);
  }

  protected assign(id: string, person: string | null, announce = true): void {
    this.patch(id, { assignee: person });
    if (announce) {
      this.say(
        person
          ? `${id} assigned to ${personOf(person)?.name}.`
          : `${id} unassigned.`,
      );
    }
  }

  protected toggleFlag(id: string): void {
    const issue = this.issues().find((i) => i.id === id);
    if (!issue) return;
    this.patch(id, { flagged: !issue.flagged });
    this.say(issue.flagged ? `Flag removed from ${id}.` : `${id} flagged.`);
  }

  protected remove(id: string): void {
    // Focus moves to the next card in the same list, else to the board.
    const order = this.lanes().flatMap((l) =>
      l.cells.flatMap((c) => c.issues.map((i) => i.id)),
    );
    const at = order.indexOf(id);
    const next = order[at + 1] ?? order[at - 1];
    this.issues.update((all) => all.filter((i) => i.id !== id));
    if (this.selectedId() === id) this.selectedId.set(null);
    this.say(`${id} deleted.`);
    afterNextRender(
      () =>
        (next && this.focus(`#board-open-${next}`)) ||
        this.focus("#board-title"),
      { injector: this.injector },
    );
  }

  protected setPoints(id: string, value: string): void {
    this.patch(id, { points: value ? Number(value) : null });
  }

  protected rename(id: string, summary: string): void {
    const text = summary.trim();
    if (text) this.patch(id, { summary: text });
  }

  protected toggleSubtask(id: string, subtask: string): void {
    this.update(id, (i) => ({
      ...i,
      subtasks: i.subtasks.map((t) =>
        t.id === subtask ? { ...t, done: !t.done } : t,
      ),
    }));
  }

  protected addComment(event: Event, id: string): void {
    event.preventDefault();
    const text = this.draft().trim();
    if (!text) return;
    this.update(id, (i) => ({
      ...i,
      comments: [
        ...i.comments,
        { id: `c${i.comments.length + 1}`, author: ME, when: "Just now", text },
      ],
    }));
    this.draft.set("");
    this.say("Comment saved.");
  }

  // ---- Creating an issue inline, at the bottom of To Do.

  protected startCreate(): void {
    this.creating.set(true);
    this.focusLater("#board-new-summary");
  }

  protected cancelCreate(): void {
    this.creating.set(false);
    this.newSummary.set("");
    this.focusLater("#board-create");
  }

  protected create(event: Event): void {
    event.preventDefault();
    const summary = this.newSummary().trim();
    if (!summary) return;
    const id = `SO-${Math.max(...this.issues().map((i) => keyNumber(i.id)), 153) + 1}`;
    const epic = this.epic();
    this.issues.update((all) => [
      ...all,
      {
        id,
        type: this.newType() as IssueType,
        summary,
        status: "todo",
        assignee: null,
        reporter: ME,
        priority: "medium",
        points: null,
        epic: epic === "all" || epic === "none" ? null : epic,
        labels: [],
        flagged: false,
        updated: 0,
        description: "No description yet.",
        subtasks: [],
        comments: [],
      },
    ]);
    this.newSummary.set("");
    this.say(`${id} created in To Do.`);
  }

  protected patch(id: string, changes: Partial<Issue>): void {
    this.update(id, (i) => ({ ...i, ...changes, updated: 0 }));
  }

  private update(id: string, fn: (issue: Issue) => Issue): void {
    this.issues.update((all) => all.map((i) => (i.id === id ? fn(i) : i)));
  }

  private focusLater(selector: string): void {
    afterNextRender(() => this.focus(selector), { injector: this.injector });
  }

  private focus(selector: string): boolean {
    const el = this.host.nativeElement.querySelector<HTMLElement>(selector);
    el?.focus();
    return !!el;
  }
}
