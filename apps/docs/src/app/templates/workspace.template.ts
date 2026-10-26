import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from "@angular/core";
import { SONE_AVATAR_PARTS } from "@surface-one/angular/avatar";
import {
  SoneBadgeDirective,
  type BadgeVariant,
} from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SoneLogoComponent } from "@surface-one/angular/logo";
import { SoneIconComponent, type ShellIcon } from "@surface-one/angular/icon";
import { SoneMarkdownComponent } from "@surface-one/angular/markdown";
import { SONE_MESSAGE_PARTS } from "@surface-one/angular/message";
import { SoneProgressComponent } from "@surface-one/angular/progress";
import { SoneSelectComponent } from "@surface-one/angular/select";
import { SONE_SIDE_PANEL_PARTS } from "@surface-one/angular/side-panel";
import {
  SONE_SIDEBAR_PARTS,
  SoneSidebarService,
  provideSoneSidebarConfig,
} from "@surface-one/angular/sidebar";

import { type Task, type Comment, BRIEF } from "./data/workspace";

interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly icon: ShellIcon;
  readonly badge?: number;
}

const STATUSES: Record<string, { label: string; variant: BadgeVariant }> = {
  todo: { label: "To do", variant: "outline" },
  progress: { label: "In progress", variant: "secondary" },
  review: { label: "In review", variant: "warning" },
  done: { label: "Done", variant: "success" },
};

@Component({
  selector: "docs-workspace-template",
  imports: [
    ...SONE_AVATAR_PARTS,
    ...SONE_FIELD_PARTS,
    ...SONE_MESSAGE_PARTS,
    ...SONE_SIDE_PANEL_PARTS,
    ...SONE_SIDEBAR_PARTS,
    SoneBadgeDirective,
    SoneButtonDirective,
    SoneIconComponent,
    SoneLogoComponent,
    SoneMarkdownComponent,
    SoneProgressComponent,
    SoneSelectComponent,
  ],
  // A template-local sidebar state (no persistence): never shares state with the docs shell.
  providers: [
    SoneSidebarService,
    provideSoneSidebarConfig({
      defaultOpen: true,
      openStorageKey: null,
      widthStorageKey: null,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div soneSidebarWrapper class="shell">
      <!-- Left sidebar: navigation, collapses to icons -->
      <sone-sidebar
        variant="inset"
        class="nav"
        collapsible="icon"
        role="navigation"
        aria-label="Workspace"
      >
        <div soneSidebarHeader>
          <div class="brand">
            <sone-logo size="sm" />
            <span class="brand-name">Northwind Studio</span>
          </div>
        </div>
        <div soneSidebarContent>
          <div soneSidebarGroup>
            <div soneSidebarGroupLabel>Workspace</div>
            <ul soneSidebarMenu>
              @for (item of nav; track item.id) {
                <li soneSidebarMenuItem>
                  <button
                    soneSidebarMenuButton
                    type="button"
                    [isActive]="item.id === 'tasks'"
                    [attr.aria-current]="item.id === 'tasks' ? 'page' : null"
                    [tooltip]="item.label"
                  >
                    <sone-icon [icon]="item.icon" /><span>{{
                      item.label
                    }}</span>
                  </button>
                  @if (item.badge) {
                    <span soneSidebarMenuBadge>{{ item.badge }}</span>
                  }
                </li>
              }
            </ul>
          </div>
          <hr soneSidebarSeparator />
          <div soneSidebarGroup>
            <div soneSidebarGroupLabel>Projects</div>
            <ul soneSidebarMenu>
              @for (p of projects; track p) {
                <li soneSidebarMenuItem>
                  <button
                    soneSidebarMenuButton
                    type="button"
                    size="sm"
                    [isActive]="p === 'Billing migration'"
                    [tooltip]="p"
                  >
                    <sone-icon icon="folder" /><span>{{ p }}</span>
                  </button>
                </li>
              }
            </ul>
          </div>
        </div>
        <div soneSidebarFooter>
          <ul soneSidebarMenu>
            <li soneSidebarMenuItem>
              <button soneSidebarMenuButton type="button" tooltip="Settings">
                <sone-icon icon="settings" /><span>Settings</span>
              </button>
            </li>
          </ul>
        </div>
        <div soneSidebarRail></div>
      </sone-sidebar>

      <div soneSidebarInset class="inset">
        <div class="topbar">
          <button
            soneBtn
            soneSidebarTrigger
            variant="ghost"
            size="icon-sm"
            type="button"
            aria-label="Toggle navigation"
          >
            <sone-icon icon="sidebar" />
          </button>
          <span class="crumbs"
            >Billing migration <span aria-hidden="true">/</span> NW-142</span
          >
          <span class="spacer"></span>
          <button
            soneBtn
            variant="ghost"
            size="icon-sm"
            type="button"
            aria-label="Show details"
            aria-controls="ws-details"
            [attr.aria-expanded]="details()"
            (click)="details.set(!details())"
          >
            <sone-icon icon="sidebar" class="flip" />
          </button>
        </div>

        <div class="main">
          <!-- Centre: the task itself -->
          <article class="content" aria-labelledby="ws-title">
            <p class="eyebrow">
              NW-142 ·
              <span soneBadge [variant]="statusInfo().variant">{{
                statusInfo().label
              }}</span>
            </p>
            <h2 id="ws-title">Fix the EUR price mapping before the freeze</h2>
            <sone-markdown size="sm" [source]="brief" />

            <h3 class="sub">
              Checklist
              <span class="sub-meta"
                >{{ doneCount() }} of {{ tasks().length }}</span
              >
            </h3>
            <sone-progress
              size="sm"
              ariaLabel="Checklist progress"
              [value]="doneCount()"
              [max]="tasks().length"
            />
            <ul class="tasks">
              @for (t of tasks(); track t.id) {
                <li>
                  <div soneField orientation="horizontal">
                    <input
                      type="checkbox"
                      [id]="'ws-task-' + t.id"
                      [checked]="t.done"
                      (change)="toggle(t.id)"
                    />
                    <label
                      soneFieldLabel
                      [for]="'ws-task-' + t.id"
                      [class.done]="t.done"
                      >{{ t.label }}</label
                    >
                  </div>
                </li>
              }
            </ul>

            <h3 class="sub">Activity</h3>
            <div soneMessageGroup class="activity">
              @for (c of comments(); track c.id) {
                <div soneMessage>
                  <sone-avatar soneMessageAvatar size="sm" aria-hidden="true"
                    ><span soneAvatarFallback>{{
                      c.initials
                    }}</span></sone-avatar
                  >
                  <div soneMessageContent>
                    <div soneMessageHeader>{{ c.author }} · {{ c.time }}</div>
                    <p class="comment">{{ c.text }}</p>
                  </div>
                </div>
              }
            </div>
            <form class="reply" (submit)="comment($event)">
              <label class="sr-only" for="ws-comment">Add a comment</label>
              <textarea
                id="ws-comment"
                rows="2"
                placeholder="Add a comment…"
                [value]="draft()"
                (input)="draft.set($any($event.target).value)"
              ></textarea>
              <button
                soneBtn
                size="sm"
                type="submit"
                [disabled]="!draft().trim()"
              >
                Comment
              </button>
            </form>
          </article>
        </div>
      </div>
      <!-- Right sidebar: properties of the task -->
      @if (details()) {
        <div
          soneSidePanel
          id="ws-details"
          role="region"
          aria-labelledby="ws-details-title"
          class="details"
        >
          <div soneSidePanelHeader>
            <h3 soneSidePanelTitle id="ws-details-title">Details</h3>
            <div soneSidePanelActions>
              <button
                soneBtn
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-label="Hide details"
                (click)="details.set(false)"
              >
                <sone-icon icon="close" />
              </button>
            </div>
          </div>
          <div soneSidePanelContent>
            <div soneFieldGroup>
              <div soneField>
                <label soneFieldLabel for="ws-status">Status</label>
                <sone-select size="sm" selectId="ws-status" [(value)]="status">
                  @for (s of statusOptions; track s.value) {
                    <option [value]="s.value">{{ s.label }}</option>
                  }
                </sone-select>
              </div>
              <div soneField>
                <label soneFieldLabel for="ws-priority">Priority</label>
                <sone-select
                  size="sm"
                  selectId="ws-priority"
                  [(value)]="priority"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </sone-select>
              </div>
            </div>
            <dl class="props">
              <div>
                <dt>Assignee</dt>
                <dd class="person">
                  <sone-avatar size="sm" aria-hidden="true"
                    ><span soneAvatarFallback>LR</span></sone-avatar
                  >
                  Leo Ruiz
                </dd>
              </div>
              <div>
                <dt>Reviewer</dt>
                <dd class="person">
                  <sone-avatar size="sm" aria-hidden="true"
                    ><span soneAvatarFallback>AP</span></sone-avatar
                  >
                  Ada Park
                </dd>
              </div>
              <div>
                <dt>Due</dt>
                <dd>Oct 14</dd>
              </div>
              <div>
                <dt>Estimate</dt>
                <dd>3 points</dd>
              </div>
              <div>
                <dt>Labels</dt>
                <dd class="labels">
                  <span soneBadge variant="outline">billing</span>
                  <span soneBadge variant="outline">migration</span>
                  <span soneBadge variant="destructive">blocker</span>
                </dd>
              </div>
            </dl>
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
  styleUrl: "./styles/workspace.css",
})
export default class Template {
  protected readonly nav: readonly NavItem[] = [
    { id: "inbox", label: "Inbox", icon: "bell-ring", badge: 3 },
    { id: "tasks", label: "My tasks", icon: "list-checks" },
    { id: "meetings", label: "Meetings", icon: "meetings" },
    { id: "notes", label: "Notes", icon: "notes" },
  ];
  protected readonly projects = [
    "Harbor launch",
    "Billing migration",
    "Onboarding v2",
  ] as const;
  protected readonly statusOptions = Object.entries(STATUSES).map(
    ([value, s]) => ({ value, label: s.label }),
  );
  protected readonly brief = BRIEF;

  protected readonly details = signal(true);
  protected readonly status = signal("progress");
  protected readonly priority = signal("high");
  protected readonly draft = signal("");
  protected readonly tasks = signal<readonly Task[]>([
    { id: "map", label: "Map legacy_eur prices to cents", done: true },
    { id: "backfill", label: "Backfill affected subscriptions", done: false },
    { id: "dry-run", label: "Re-run the migration dry run", done: false },
  ]);
  protected readonly comments = signal<readonly Comment[]>([
    {
      id: "c1",
      author: "Leo Ruiz",
      initials: "LR",
      time: "09:24",
      text: "Mapping is done in the PR. Backfill script is next.",
    },
    {
      id: "c2",
      author: "Ada Park",
      initials: "AP",
      time: "10:02",
      text: "Thanks! Please ping me once the dry run is green.",
    },
  ]);

  protected readonly statusInfo = computed(() => STATUSES[this.status()]);
  protected readonly doneCount = computed(
    () => this.tasks().filter((t) => t.done).length,
  );

  protected toggle(id: string): void {
    this.tasks.update((all) =>
      all.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }

  protected comment(event: Event): void {
    event.preventDefault();
    const text = this.draft().trim();
    if (!text) return;
    this.comments.update((all) => [
      ...all,
      {
        id: `c${all.length + 1}`,
        author: "You",
        initials: "YO",
        time: "now",
        text,
      },
    ]);
    this.draft.set("");
  }
}
