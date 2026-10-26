"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  SoneAvatar,
  SoneAvatarFallback,
  SoneBadge,
  SoneButton,
  SoneCard,
  SoneCardAction,
  SoneCardContent,
  SoneCardDescription,
  SoneCardHeader,
  SoneCardTitle,
  SoneIcon,
  SoneLogo,
  SoneMenu,
  SoneMenuItem,
  SonePageHeader,
  SonePageHeaderActions,
  SonePageHeaderContent,
  SonePageHeaderDescription,
  SonePageHeaderEyebrow,
  SonePageHeaderTitle,
  SoneSegmented,
  SoneTable,
  SoneTooltip,
  type BadgeVariant,
  type SegmentOption,
  type ShellIcon,
  type SoneTableColumn,
} from "@surface-one/react";

import { type ProjectStatus, type Project, PROJECTS } from "../data/dashboard";

// The shared stylesheet (../styles/dashboard.css + dashboard.twins.css), prefixed with .tpl-dashboard.
import { css } from "../styles/scoped/dashboard.generated";

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

interface RowMenu {
  readonly row: Project;
  readonly top: number;
  readonly right: number;
}

const STATUS: Record<ProjectStatus, { label: string; variant: BadgeVariant }> =
  {
    "on-track": { label: "On track", variant: "success" },
    "at-risk": { label: "At risk", variant: "warning" },
    planning: { label: "Planning", variant: "secondary" },
    blocked: { label: "Blocked", variant: "destructive" },
    done: { label: "Done", variant: "outline" },
  };

const nav: readonly NavItem[] = [
  { id: "overview", label: "Overview", icon: "dashboards" },
  { id: "projects", label: "Projects", icon: "folder" },
  { id: "meetings", label: "Meetings", icon: "meetings" },
  { id: "reminders", label: "Reminders", icon: "reminders", badge: 4 },
  { id: "people", label: "People", icon: "people" },
];
const teams = ["Product", "Platform", "Growth", "Design"] as const;
const stats: readonly Stat[] = [
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
const filters: readonly SegmentOption[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "attention", label: "Needs attention" },
];

const byId = (row: Project): string => row.id;

export default function DashboardTemplate() {
  // A template-local sidebar state (no persistence), open by default.
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarState = sidebarOpen ? "expanded" : "collapsed";
  const toggleSidebar = (): void => setSidebarOpen((open) => !open);

  const [activeNav, setActiveNav] = useState("overview");
  const activeLabel = nav.find((n) => n.id === activeNav)?.label ?? "";
  const [filter, setFilter] = useState("all");
  const [projects, setProjects] = useState(PROJECTS);
  const visibleProjects =
    filter === "active"
      ? projects.filter((p) => p.status !== "done")
      : filter === "attention"
        ? projects.filter(
            (p) => p.status === "at-risk" || p.status === "blocked",
          )
        : projects;

  function archive(id: string): void {
    setProjects((rows) => rows.filter((p) => p.id !== id));
  }

  // The row menu: a ghost icon button opens a SoneMenu, fixed to the viewport
  // (portaled to <body>) so the scrolling table never clips it.
  const [menu, setMenu] = useState<RowMenu | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const menuTrigger = useRef<HTMLElement | null>(null);
  /** Opened from the keyboard: move focus into the menu once it renders. */
  const focusOnOpen = useRef(false);

  const menuItems = (): HTMLElement[] =>
    Array.from(
      panel.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );

  function toggleMenu(row: Project, event: ReactMouseEvent<HTMLElement>): void {
    if (menu?.row.id === row.id) return closeMenu();
    menuTrigger.current = event.currentTarget;
    const rect = event.currentTarget.getBoundingClientRect();
    focusOnOpen.current = event.detail === 0;
    setMenu({
      row,
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
  }

  function closeMenu(restoreFocus = false): void {
    setMenu(null);
    if (restoreFocus) menuTrigger.current?.focus();
  }

  useEffect(() => {
    if (menu && focusOnOpen.current) {
      focusOnOpen.current = false;
      menuItems()[0]?.focus();
    }
  }, [menu]);

  function onMenuKeydown(event: ReactKeyboardEvent<HTMLElement>): void {
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

  // A pointer down outside the open menu closes it.
  useEffect(() => {
    if (!menu) return;
    const onPointerdown = (event: PointerEvent): void => {
      const target = event.target as Node;
      if (panel.current?.contains(target)) return;
      if (menuTrigger.current?.contains(target)) return;
      setMenu(null);
    };
    document.addEventListener("pointerdown", onPointerdown);
    return () => document.removeEventListener("pointerdown", onPointerdown);
  }, [menu]);

  // ⌘B / Ctrl+B toggles the sidebar, as in <sone-sidebar-wrapper>.
  useEffect(() => {
    const onKeydown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented || !(event.metaKey || event.ctrlKey)) return;
      if (event.altKey || event.shiftKey || event.key.toLowerCase() !== "b")
        return;
      const el = event.target as HTMLElement | null;
      if (el?.closest("input, textarea, select, [contenteditable]")) return;
      event.preventDefault();
      setSidebarOpen((open) => !open);
    };
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  }, []);

  const columns: readonly SoneTableColumn<Project>[] = [
    {
      key: "name",
      header: "Project",
      cell: (row) => (
        <span className="project">
          <span className="project-name">{row.name}</span>
          <span className="project-team">{row.team}</span>
        </span>
      ),
    },
    { key: "owner", header: "Owner", width: "150px" },
    {
      key: "status",
      header: "Status",
      width: "120px",
      cell: (row) => (
        <SoneBadge variant={STATUS[row.status].variant}>
          {STATUS[row.status].label}
        </SoneBadge>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      width: "90px",
      alignEnd: true,
      cell: (row) => <span className="num">{row.progress}%</span>,
    },
    {
      key: "due",
      header: "Due",
      width: "80px",
      alignEnd: true,
      cell: (row) => <span className="num">{row.due}</span>,
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
          aria-controls={menu?.row.id === row.id ? "dash-row-menu" : undefined}
          aria-label={`Actions for ${row.name}`}
          title={`Actions for ${row.name}`}
          onClick={(event: ReactMouseEvent<HTMLElement>) =>
            toggleMenu(row, event)
          }
        >
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
        </SoneButton>
      ),
    },
  ];

  return (
    // The same markup and classes as <sone-sidebar>.
    <div
      data-slot="sidebar-wrapper"
      data-state={sidebarState}
      className="tpl-dashboard shell"
    >
      <style>{css}</style>
      <div
        data-slot="sidebar"
        data-state={sidebarState}
        data-collapsible={sidebarOpen ? "" : "icon"}
        data-variant="inset"
        data-side="left"
        role="navigation"
        aria-label="Workspace"
      >
        <div data-slot="sidebar-container" data-side="left">
          <div data-slot="sidebar-inner" data-sidebar="sidebar">
            <div data-slot="sidebar-header" data-sidebar="header">
              <div className="brand">
                <SoneLogo size="sm" />
                <span className="brand-name">Northwind Studio</span>
              </div>
            </div>
            <div data-slot="sidebar-content" data-sidebar="content">
              <div data-slot="sidebar-group" data-sidebar="group">
                <div data-slot="sidebar-group-label" data-sidebar="group-label">
                  Workspace
                </div>
                <ul data-slot="sidebar-menu" data-sidebar="menu">
                  {nav.map((item) => (
                    <li
                      key={item.id}
                      data-slot="sidebar-menu-item"
                      data-sidebar="menu-item"
                    >
                      {/* The tooltip only shows while the sidebar is collapsed to icons. */}
                      <SoneTooltip
                        text={item.label}
                        side="right"
                        disabled={sidebarOpen}
                      >
                        <button
                          data-slot="sidebar-menu-button"
                          data-sidebar="menu-button"
                          data-size="default"
                          data-variant="default"
                          data-active={
                            activeNav === item.id ? "true" : undefined
                          }
                          aria-current={
                            activeNav === item.id ? "page" : undefined
                          }
                          type="button"
                          onClick={() => setActiveNav(item.id)}
                        >
                          <SoneIcon icon={item.icon} />
                          <span>{item.label}</span>
                        </button>
                      </SoneTooltip>
                      {item.badge ? (
                        <span
                          data-slot="sidebar-menu-badge"
                          data-sidebar="menu-badge"
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
              <hr data-slot="sidebar-separator" data-sidebar="separator" />
              <div data-slot="sidebar-group" data-sidebar="group">
                <div data-slot="sidebar-group-label" data-sidebar="group-label">
                  Teams
                </div>
                <ul data-slot="sidebar-menu" data-sidebar="menu">
                  {teams.map((team) => (
                    <li
                      key={team}
                      data-slot="sidebar-menu-item"
                      data-sidebar="menu-item"
                    >
                      <SoneTooltip
                        text={team}
                        side="right"
                        disabled={sidebarOpen}
                      >
                        <button
                          data-slot="sidebar-menu-button"
                          data-sidebar="menu-button"
                          data-size="sm"
                          data-variant="default"
                          type="button"
                        >
                          <SoneIcon icon="spaces" />
                          <span>{team}</span>
                        </button>
                      </SoneTooltip>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div data-slot="sidebar-footer" data-sidebar="footer">
              <ul data-slot="sidebar-menu" data-sidebar="menu">
                <li data-slot="sidebar-menu-item" data-sidebar="menu-item">
                  <SoneTooltip
                    text="Ada Park"
                    side="right"
                    disabled={sidebarOpen}
                  >
                    <button
                      data-slot="sidebar-menu-button"
                      data-sidebar="menu-button"
                      data-size="lg"
                      data-variant="default"
                      type="button"
                    >
                      <SoneAvatar size="sm" aria-hidden="true">
                        <SoneAvatarFallback>AP</SoneAvatarFallback>
                      </SoneAvatar>
                      <span className="user">
                        <span className="user-name">Ada Park</span>
                        <span className="user-role">Product lead</span>
                      </span>
                    </button>
                  </SoneTooltip>
                </li>
              </ul>
            </div>
            {/* The rail toggles on click (the Angular one also drags to resize). */}
            <div
              data-slot="sidebar-rail"
              data-sidebar="rail"
              role="button"
              tabIndex={-1}
              aria-label="Toggle sidebar"
              title={sidebarOpen ? "Click to collapse" : "Click to expand"}
              onClick={toggleSidebar}
            />
          </div>
        </div>
      </div>

      <div data-slot="sidebar-inset" className="inset">
        <div className="topbar">
          <SoneButton
            data-sidebar="trigger"
            variant="ghost"
            size="icon-sm"
            type="button"
            aria-label="Toggle sidebar"
            aria-expanded={sidebarOpen}
            onClick={toggleSidebar}
          >
            <SoneIcon icon="sidebar" />
          </SoneButton>
          <span className="crumbs">
            Workspace <span aria-hidden="true">/</span> {activeLabel}
          </span>
        </div>

        <div className="body">
          <SonePageHeader as="div">
            <SonePageHeaderContent>
              <SonePageHeaderEyebrow>Q4 portfolio</SonePageHeaderEyebrow>
              <SonePageHeaderTitle as="h2">Overview</SonePageHeaderTitle>
              <SonePageHeaderDescription>
                Delivery health across every active project, updated a few
                minutes ago.
              </SonePageHeaderDescription>
            </SonePageHeaderContent>
            <SonePageHeaderActions>
              <SoneButton variant="outline" size="sm" type="button">
                <SoneIcon icon="download" />
                <span>Export</span>
              </SoneButton>
              <SoneButton size="sm" type="button">
                <SoneIcon icon="plus" />
                <span>New project</span>
              </SoneButton>
            </SonePageHeaderActions>
          </SonePageHeader>

          <ul className="stats" aria-label="Key metrics">
            {stats.map((stat) => (
              <SoneCard key={stat.id} as="li" size="sm" className="stat">
                <SoneCardHeader>
                  <SoneCardTitle className="stat-label">
                    {stat.label}
                  </SoneCardTitle>
                  <SoneCardAction as="span">
                    <SoneBadge variant={stat.trend}>{stat.delta}</SoneBadge>
                  </SoneCardAction>
                </SoneCardHeader>
                <SoneCardContent>
                  <p className="stat-value">{stat.value}</p>
                  <p className="stat-hint">{stat.hint}</p>
                </SoneCardContent>
              </SoneCard>
            ))}
          </ul>

          <SoneCard className="projects">
            <SoneCardHeader>
              <SoneCardTitle id="dash-projects-title">Projects</SoneCardTitle>
              <SoneCardDescription>
                {visibleProjects.length} of {projects.length} projects
              </SoneCardDescription>
              <SoneCardAction>
                <SoneSegmented
                  value={filter}
                  onValueChange={setFilter}
                  size="sm"
                  ariaLabel="Filter projects"
                  options={filters}
                />
              </SoneCardAction>
            </SoneCardHeader>
            <SoneCardContent>
              <SoneTable
                rows={visibleProjects}
                columns={columns}
                rowKey={byId}
                caption="Projects due this quarter"
                emptyText="No projects match this filter."
              />
            </SoneCardContent>
          </SoneCard>
        </div>
      </div>

      {menu
        ? createPortal(
            <SoneMenu
              id="dash-row-menu"
              ref={panel}
              className="tpl-dashboard row-panel"
              style={{ top: `${menu.top}px`, right: `${menu.right}px` }}
              aria-label={`Actions for ${menu.row.name}`}
              tabIndex={-1}
              onKeyDown={onMenuKeydown}
            >
              <SoneMenuItem type="button" onClick={() => closeMenu(true)}>
                <SoneIcon icon="eye" /> Open
              </SoneMenuItem>
              <SoneMenuItem type="button" onClick={() => closeMenu(true)}>
                <SoneIcon icon="copy" /> Duplicate
              </SoneMenuItem>
              <SoneMenuItem
                type="button"
                variant="destructive"
                onClick={() => {
                  archive(menu.row.id);
                  closeMenu();
                }}
              >
                <SoneIcon icon="trash" /> Archive
              </SoneMenuItem>
            </SoneMenu>,
            document.body,
          )
        : null}
    </div>
  );
}
