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
import { SONE_CARD_PARTS } from "@surface-one/angular/card";
import { SoneLogoComponent } from "@surface-one/angular/logo";
import { SoneIconComponent, type ShellIcon } from "@surface-one/angular/icon";
import { SONE_MENU_PARTS } from "@surface-one/angular/menu";
import { SONE_PAGE_HEADER_PARTS } from "@surface-one/angular/page-header";
import { SoneRowMenuComponent } from "@surface-one/angular/row-menu";
import {
  SoneSegmentedComponent,
  type SegmentOption,
} from "@surface-one/angular/segmented";
import {
  SONE_SIDEBAR_PARTS,
  SoneSidebarService,
  provideSoneSidebarConfig,
} from "@surface-one/angular/sidebar";
import {
  SoneTableColumnComponent,
  SoneTableComponent,
} from "@surface-one/angular/table";

import { type ProjectStatus, type Project, PROJECTS } from "./data/dashboard";

interface Stat {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly delta: string;
  readonly trend: BadgeVariant;
  readonly hint: string;
}

interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly icon: ShellIcon;
  readonly badge?: number;
}

const STATUS: Record<ProjectStatus, { label: string; variant: BadgeVariant }> =
  {
    "on-track": { label: "On track", variant: "success" },
    "at-risk": { label: "At risk", variant: "warning" },
    planning: { label: "Planning", variant: "secondary" },
    blocked: { label: "Blocked", variant: "destructive" },
    done: { label: "Done", variant: "outline" },
  };

@Component({
  selector: "docs-dashboard-template",
  imports: [
    ...SONE_SIDEBAR_PARTS,
    ...SONE_CARD_PARTS,
    ...SONE_PAGE_HEADER_PARTS,
    ...SONE_MENU_PARTS,
    ...SONE_AVATAR_PARTS,
    SoneBadgeDirective,
    SoneButtonDirective,
    SoneIconComponent,
    SoneLogoComponent,
    SoneRowMenuComponent,
    SoneSegmentedComponent,
    SoneTableComponent,
    SoneTableColumnComponent,
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
      <sone-sidebar collapsible="icon" role="navigation" aria-label="Workspace">
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
                    [isActive]="activeNav() === item.id"
                    [attr.aria-current]="
                      activeNav() === item.id ? 'page' : null
                    "
                    [tooltip]="item.label"
                    (click)="activeNav.set(item.id)"
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
            <div soneSidebarGroupLabel>Teams</div>
            <ul soneSidebarMenu>
              @for (team of teams; track team) {
                <li soneSidebarMenuItem>
                  <button
                    soneSidebarMenuButton
                    type="button"
                    size="sm"
                    [tooltip]="team"
                  >
                    <sone-icon icon="spaces" /><span>{{ team }}</span>
                  </button>
                </li>
              }
            </ul>
          </div>
        </div>
        <div soneSidebarFooter>
          <ul soneSidebarMenu>
            <li soneSidebarMenuItem>
              <button
                soneSidebarMenuButton
                type="button"
                size="lg"
                tooltip="Ada Park"
              >
                <sone-avatar size="sm" aria-hidden="true"
                  ><span soneAvatarFallback>AP</span></sone-avatar
                >
                <span class="user">
                  <span class="user-name">Ada Park</span>
                  <span class="user-role">Product lead</span>
                </span>
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
            aria-label="Toggle sidebar"
          >
            <sone-icon icon="sidebar" />
          </button>
          <span class="crumbs"
            >Workspace <span aria-hidden="true">/</span>
            {{ activeLabel() }}</span
          >
        </div>

        <div class="body">
          <div sonePageHeader>
            <div sonePageHeaderContent>
              <p sonePageHeaderEyebrow>Q4 portfolio</p>
              <h2 sonePageHeaderTitle>Overview</h2>
              <p sonePageHeaderDescription>
                Delivery health across every active project, updated a few
                minutes ago.
              </p>
            </div>
            <div sonePageHeaderActions>
              <button soneBtn variant="outline" size="sm" type="button">
                <sone-icon icon="download" /><span>Export</span>
              </button>
              <button soneBtn size="sm" type="button">
                <sone-icon icon="plus" /><span>New project</span>
              </button>
            </div>
          </div>

          <ul class="stats" aria-label="Key metrics">
            @for (stat of stats; track stat.id) {
              <li soneCard size="sm" class="stat">
                <div soneCardHeader>
                  <h3 soneCardTitle class="stat-label">{{ stat.label }}</h3>
                  <span soneCardAction
                    ><span soneBadge [variant]="stat.trend">{{
                      stat.delta
                    }}</span></span
                  >
                </div>
                <div soneCardContent>
                  <p class="stat-value">{{ stat.value }}</p>
                  <p class="stat-hint">{{ stat.hint }}</p>
                </div>
              </li>
            }
          </ul>

          <div soneCard class="projects">
            <div soneCardHeader>
              <h3 soneCardTitle id="dash-projects-title">Projects</h3>
              <p soneCardDescription>
                {{ visibleProjects().length }} of
                {{ projects().length }} projects
              </p>
              <div soneCardAction>
                <sone-segmented
                  size="sm"
                  ariaLabel="Filter projects"
                  [options]="filters"
                  [(value)]="filter"
                />
              </div>
            </div>
            <div soneCardContent>
              <sone-table
                [rows]="visibleProjects()"
                [trackBy]="trackById"
                caption="Projects due this quarter"
                emptyText="No projects match this filter."
              >
                <sone-table-column key="name" header="Project">
                  <ng-template let-row>
                    <span class="project">
                      <span class="project-name">{{ row.name }}</span>
                      <span class="project-team">{{ row.team }}</span>
                    </span>
                  </ng-template>
                </sone-table-column>
                <sone-table-column key="owner" header="Owner" width="150px">
                  <ng-template let-row>{{ row.owner }}</ng-template>
                </sone-table-column>
                <sone-table-column key="status" header="Status" width="120px">
                  <ng-template let-row>
                    @let st = statusOf(row);
                    <span soneBadge [variant]="st.variant">{{ st.label }}</span>
                  </ng-template>
                </sone-table-column>
                <sone-table-column
                  key="progress"
                  header="Progress"
                  width="90px"
                  [alignEnd]="true"
                >
                  <ng-template let-row
                    ><span class="num">{{ row.progress }}%</span></ng-template
                  >
                </sone-table-column>
                <sone-table-column
                  key="due"
                  header="Due"
                  width="80px"
                  [alignEnd]="true"
                >
                  <ng-template let-row
                    ><span class="num">{{ row.due }}</span></ng-template
                  >
                </sone-table-column>
                <sone-table-column
                  key="actions"
                  header="Actions"
                  [hideHeader]="true"
                  width="48px"
                >
                  <ng-template let-row>
                    <sone-row-menu [label]="'Actions for ' + row.name">
                      <button soneMenuItem type="button" role="menuitem">
                        <sone-icon icon="eye" /> Open
                      </button>
                      <button soneMenuItem type="button" role="menuitem">
                        <sone-icon icon="copy" /> Duplicate
                      </button>
                      <button
                        soneMenuItem
                        type="button"
                        role="menuitem"
                        variant="destructive"
                        (click)="archive(row.id)"
                      >
                        <sone-icon icon="trash" /> Archive
                      </button>
                    </sone-row-menu>
                  </ng-template>
                </sone-table-column>
              </sone-table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  styleUrl: "./styles/dashboard.css",
})
export default class Template {
  protected readonly nav: readonly NavItem[] = [
    { id: "overview", label: "Overview", icon: "dashboards" },
    { id: "projects", label: "Projects", icon: "folder" },
    { id: "meetings", label: "Meetings", icon: "meetings" },
    { id: "reminders", label: "Reminders", icon: "reminders", badge: 4 },
    { id: "people", label: "People", icon: "people" },
  ];
  protected readonly teams = [
    "Product",
    "Platform",
    "Growth",
    "Design",
  ] as const;
  protected readonly stats: readonly Stat[] = [
    {
      id: "active",
      label: "Active projects",
      value: "12",
      delta: "+2",
      trend: "success",
      hint: "vs. last quarter",
    },
    {
      id: "risk",
      label: "At risk",
      value: "3",
      delta: "+1",
      trend: "warning",
      hint: "Needs an owner check-in",
    },
    {
      id: "velocity",
      label: "Tasks closed",
      value: "184",
      delta: "+12%",
      trend: "success",
      hint: "Last 30 days",
    },
    {
      id: "budget",
      label: "Budget used",
      value: "64%",
      delta: "−4%",
      trend: "secondary",
      hint: "Of the Q4 allocation",
    },
  ];
  protected readonly filters: readonly SegmentOption[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "attention", label: "Needs attention" },
  ];

  protected readonly activeNav = signal("overview");
  protected readonly activeLabel = computed(
    () => this.nav.find((n) => n.id === this.activeNav())?.label ?? "",
  );
  protected readonly filter = signal("all");
  protected readonly projects = signal<readonly Project[]>(PROJECTS);
  protected readonly visibleProjects = computed(() => {
    const rows = this.projects();
    switch (this.filter()) {
      case "active":
        return rows.filter((p) => p.status !== "done");
      case "attention":
        return rows.filter(
          (p) => p.status === "at-risk" || p.status === "blocked",
        );
      default:
        return rows;
    }
  });

  protected statusOf(row: Project): { label: string; variant: BadgeVariant } {
    return STATUS[row.status];
  }

  protected readonly trackById = (row: Project): string => row.id;

  protected archive(id: string): void {
    this.projects.update((rows) => rows.filter((p) => p.id !== id));
  }
}
