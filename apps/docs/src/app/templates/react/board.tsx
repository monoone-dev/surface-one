"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
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
  SoneKbd,
  SoneMenu,
  SoneMenuGroup,
  SoneMenuItem,
  SoneMenuLabel,
  SoneMenuRadioItem,
  SoneMenuSeparator,
  SonePageHeader,
  SonePageHeaderActions,
  SonePageHeaderContent,
  SonePageHeaderDescription,
  SonePageHeaderEyebrow,
  SonePageHeaderTitle,
  SoneProgress,
  SoneSegmented,
  SoneSelect,
  SoneStackedBar,
  SoneToggleGroup,
  SoneToggleGroupItem,
  type SegmentOption,
  type ShellIcon,
  type SoneStackedBarSegment,
} from "@surface-one/react";

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
  task,
  ISSUES,
  statusOf,
  personOf,
  epicOf,
  pointsOf,
  keyNumber,
} from "../data/board";

// The shared stylesheet (../styles/board.css + board.twins.css), prefixed with .tpl-board.
import { css } from "../styles/scoped/board.generated";

/** The open row menu, fixed to the viewport; `id` null is the board menu. */
interface MenuState {
  readonly id: string | null;
  readonly top: number;
  readonly right: number;
}

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

const GROUP_OPTIONS: readonly SegmentOption[] = [
  { value: "none", label: "None" },
  { value: "assignee", label: "Assignee" },
  { value: "epic", label: "Epic" },
];
const TYPE_OPTIONS = (Object.keys(TYPES) as IssueType[]).map((value) => ({
  value,
  label: TYPES[value].label,
}));
const PRIORITY_OPTIONS = (Object.keys(PRIORITIES) as PriorityId[]).map(
  (value) => ({ value, label: PRIORITIES[value].label }),
);

const tone = (e: Epic): CSSProperties =>
  ({ "--tone": `var(--${e.tone})` }) as CSSProperties;
const subtasksDone = (i: Issue): number =>
  i.subtasks.filter((t) => t.done).length;
const commentsOf = (i: Issue): readonly Comment[] => [...i.comments].reverse();
const updatedLabel = (i: Issue): string =>
  i.updated === 0
    ? "Today"
    : i.updated === 1
      ? "Yesterday"
      : `${i.updated} days ago`;

function lane(
  key: string,
  title: string | null,
  list: readonly Issue[],
  person: Person | null = null,
  epicRef: Epic | null = null,
): Lane {
  return {
    key,
    title,
    person,
    epic: epicRef,
    count: list.length,
    points: pointsOf(list),
    cells: STATUSES.map((status) => ({
      status,
      issues: list.filter((i) => i.status === status.id),
    })),
  };
}

/** The column heading, prefixed by the lane name when the board is grouped. */
function cellLabel(l: Lane, status: Status): string {
  const column = `board-col-${status.id}`;
  return l.title === null ? column : `board-lane-name-${l.key} ${column}`;
}

function Initials({ person }: { person: Person }) {
  return (
    <SoneAvatar size="sm" aria-hidden="true">
      <SoneAvatarFallback>{person.initials}</SoneAvatarFallback>
    </SoneAvatar>
  );
}

export default function BoardTemplate() {
  const root = useRef<HTMLDivElement | null>(null);
  const [issues, setIssues] = useState<readonly Issue[]>(ISSUES);
  const [query, setQuery] = useState("");
  const [assignees, setAssignees] = useState<readonly string[]>([]);
  const [mine, setMine] = useState(false);
  const [recent, setRecent] = useState(false);
  const [bugs, setBugs] = useState(false);
  const [epic, setEpic] = useState("all");
  const [groupBy, setGroupByState] = useState<GroupBy>("none");
  const [collapsed, setCollapsed] = useState<readonly string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  /** `<lane>:<status>` under the dragged card. */
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newType, setNewType] = useState("story");
  const [newSummary, setNewSummary] = useState("");
  const [draft, setDraft] = useState("");
  const [announcement, setAnnouncement] = useState("");

  // No React row menu yet: a ghost icon button opens a SoneMenu, fixed to the viewport
  // (portalled to <body>) so the scrolling board never clips it.
  const [menu, setMenu] = useState<MenuState | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);
  const menuTrigger = useRef<HTMLElement | null>(null);

  // Focus moves once the next render is on screen (Vue's nextTick).
  const afterRender = useRef<(() => void) | null>(null);
  useEffect(() => {
    const run = afterRender.current;
    afterRender.current = null;
    run?.();
  });

  const filtering =
    !!query.trim() ||
    assignees.length > 0 ||
    mine ||
    recent ||
    bugs ||
    epic !== "all";

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return issues.filter(
      (i) =>
        (!q ||
          i.summary.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q)) &&
        (!assignees.length || assignees.includes(i.assignee ?? "")) &&
        (!mine || i.assignee === ME) &&
        (!recent || i.updated <= 1) &&
        (!bugs || i.type === "bug") &&
        (epic === "all" || (i.epic ?? "none") === epic),
    );
  }, [issues, query, assignees, mine, recent, bugs, epic]);

  const columns = STATUSES.map((status) => ({
    status,
    count: visible.filter((i) => i.status === status.id).length,
    // The limit counts every issue in the column, filtered out or not.
    over:
      status.wip !== null &&
      issues.filter((i) => i.status === status.id).length > status.wip,
  }));

  const lanes = useMemo<readonly Lane[]>(() => {
    if (groupBy === "none") return [lane("all", null, visible)];
    if (groupBy === "assignee") {
      return [
        ...PEOPLE.map((p) =>
          lane(
            p.id,
            p.id === ME ? `${p.name} (you)` : p.name,
            visible.filter((i) => i.assignee === p.id),
            p,
          ),
        ),
        lane(
          "none",
          "Unassigned",
          visible.filter((i) => !i.assignee),
        ),
      ].filter((l) => l.count > 0);
    }
    return [
      ...EPICS.map((e) =>
        lane(
          e.id,
          e.name,
          visible.filter((i) => i.epic === e.id),
          null,
          e,
        ),
      ),
      lane(
        "none",
        "No epic",
        visible.filter((i) => !i.epic),
      ),
    ].filter((l) => l.count > 0);
  }, [visible, groupBy]);

  const totalPoints = pointsOf(issues);
  const donePoints = pointsOf(issues.filter((i) => i.status === "done"));
  const doneCount = issues.filter((i) => i.status === "done").length;
  const sumOf = (status: StatusId) =>
    pointsOf(issues.filter((i) => i.status === status));
  const progressSegments: SoneStackedBarSegment[] = [
    { key: "done", label: "Done", value: sumOf("done"), tone: "success" },
    {
      key: "review",
      label: "In review",
      value: sumOf("review"),
      tone: "chart-6",
    },
    {
      key: "progress",
      label: "In progress",
      value: sumOf("progress"),
      tone: "accent",
    },
  ];

  const selected = issues.find((i) => i.id === selectedId) ?? null;
  const menuIssue = issues.find((i) => i.id === menu?.id) ?? null;

  function focus(selector: string): boolean {
    const el = root.current?.querySelector<HTMLElement>(selector);
    el?.focus();
    return !!el;
  }

  const focusLater = (selector: string): void => {
    afterRender.current = () => focus(selector);
  };

  const say = (message: string): void => setAnnouncement(message);

  function completeSprint(): void {
    const open = issues.filter((i) => i.status !== "done").length;
    say(
      `${SPRINT.name} completed: ${doneCount} issues done, ${open} moved to the next sprint.`,
    );
  }

  function toggleAssignee(id: string): void {
    setAssignees((list) =>
      list.includes(id) ? list.filter((p) => p !== id) : [...list, id],
    );
  }

  function setGroupBy(value: string): void {
    setGroupByState(value as GroupBy);
    setCollapsed([]);
  }

  function toggleLane(key: string): void {
    setCollapsed((keys) =>
      keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key],
    );
  }

  function clearFilters(): void {
    setQuery("");
    setAssignees([]);
    setMine(false);
    setRecent(false);
    setBugs(false);
    setEpic("all");
  }

  function open(id: string): void {
    setSelectedId(id);
    setDraft("");
    focusLater("#board-detail-title");
  }

  function close(): void {
    const id = selectedId;
    setSelectedId(null);
    if (id) focusLater(`#board-open-${id}`);
  }

  function update(id: string, fn: (issue: Issue) => Issue): void {
    setIssues((list) => list.map((i) => (i.id === id ? fn(i) : i)));
  }

  function patch(id: string, changes: Partial<Issue>): void {
    update(id, (i) => ({ ...i, ...changes, updated: 0 }));
  }

  // ---- Moving issues: drag and drop, the card menu, the keyboard, the panel.

  /** `changes` ride along with the move: a drop in another swimlane. */
  function moveTo(
    id: string,
    status: StatusId,
    changes: Partial<Issue> = {},
  ): void {
    const issue = issues.find((i) => i.id === id);
    if (!issue) return;
    if (issue.status === status) {
      if (Object.keys(changes).length) patch(id, changes);
      return;
    }
    // A moved card goes to the bottom of its new column.
    const next = [
      ...issues.filter((i) => i.id !== id),
      { ...issue, ...changes, status, updated: 0 },
    ];
    setIssues(next);
    const target = statusOf(status);
    const over =
      target.wip !== null &&
      next.filter((i) => i.status === status).length > target.wip;
    say(
      `${id} moved to ${target.label}.` +
        (over ? ` ${target.label} is over its limit of ${target.wip}.` : ""),
    );
  }

  function assign(id: string, person: string | null): void {
    patch(id, { assignee: person });
    say(
      person
        ? `${id} assigned to ${personOf(person)?.name}.`
        : `${id} unassigned.`,
    );
  }

  function toggleFlag(id: string): void {
    const issue = issues.find((i) => i.id === id);
    if (!issue) return;
    patch(id, { flagged: !issue.flagged });
    say(issue.flagged ? `Flag removed from ${id}.` : `${id} flagged.`);
  }

  function remove(id: string): void {
    // Focus moves to the next card in the same list, else to the board.
    const order = lanes.flatMap((l) =>
      l.cells.flatMap((c) => c.issues.map((i) => i.id)),
    );
    const at = order.indexOf(id);
    const next = order[at + 1] ?? order[at - 1];
    setIssues((list) => list.filter((i) => i.id !== id));
    if (selectedId === id) setSelectedId(null);
    say(`${id} deleted.`);
    afterRender.current = () =>
      (next && focus(`#board-open-${next}`)) || focus("#board-title");
  }

  function onDragStart(event: DragEvent<HTMLElement>, id: string): void {
    setDragId(id);
    event.dataTransfer.setData("text/plain", id);
    event.dataTransfer.effectAllowed = "move";
  }

  function onDragEnd(): void {
    setDragId(null);
    setDropTarget(null);
  }

  function onDragOver(
    event: DragEvent<HTMLElement>,
    laneKey: string,
    status: StatusId,
  ): void {
    if (!dragId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTarget(`${laneKey}:${status}`);
  }

  function onDragLeave(
    event: DragEvent<HTMLElement>,
    laneKey: string,
    status: StatusId,
  ): void {
    const into = event.relatedTarget as Node | null;
    if (into && event.currentTarget.contains(into)) return;
    if (dropTarget === `${laneKey}:${status}`) setDropTarget(null);
  }

  function onDrop(
    event: DragEvent<HTMLElement>,
    laneKey: string,
    status: StatusId,
  ): void {
    event.preventDefault();
    const id = dragId ?? event.dataTransfer.getData("text/plain");
    onDragEnd();
    if (!id) return;
    // Dropped in another swimlane: the card takes that lane's assignee or epic.
    const value = laneKey === "none" ? null : laneKey;
    const changes: Partial<Issue> =
      groupBy === "assignee"
        ? { assignee: value }
        : groupBy === "epic"
          ? { epic: value }
          : {};
    moveTo(id, status, changes);
  }

  /** Shift + ← / → moves the focused card one column; focus follows it. */
  function onCardKeydown(
    event: KeyboardEvent<HTMLButtonElement>,
    issue: Issue,
  ): void {
    if (!event.shiftKey) return;
    const delta =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const target =
      STATUSES[STATUSES.findIndex((s) => s.id === issue.status) + delta];
    if (!target) return;
    moveTo(issue.id, target.id);
    focusLater(`#board-open-${issue.id}`);
  }

  function rename(id: string, summary: string): void {
    const text = summary.trim();
    if (text && text !== selected?.summary) patch(id, { summary: text });
  }

  function setPoints(id: string, value: string): void {
    patch(id, { points: value ? Number(value) : null });
  }

  function toggleSubtask(id: string, subtask: string): void {
    update(id, (i) => ({
      ...i,
      subtasks: i.subtasks.map((t) =>
        t.id === subtask ? { ...t, done: !t.done } : t,
      ),
    }));
  }

  function addComment(id: string): void {
    const text = draft.trim();
    if (!text) return;
    update(id, (i) => ({
      ...i,
      comments: [
        ...i.comments,
        { id: `c${i.comments.length + 1}`, author: ME, when: "Just now", text },
      ],
    }));
    setDraft("");
    say("Comment saved.");
  }

  // ---- Creating an issue inline, at the bottom of To Do.

  function startCreate(): void {
    setCreating(true);
    focusLater("#board-new-summary");
  }

  function cancelCreate(): void {
    setCreating(false);
    setNewSummary("");
    focusLater("#board-create");
  }

  function create(): void {
    const summary = newSummary.trim();
    if (!summary) return;
    const id = `SO-${Math.max(...issues.map((i) => keyNumber(i.id)), 153) + 1}`;
    setIssues([
      ...issues,
      {
        id,
        type: newType as IssueType,
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
    setNewSummary("");
    say(`${id} created in To Do.`);
  }

  // ---- The row and board menu.

  const menuItems = (): HTMLElement[] =>
    Array.from(
      panel.current?.querySelectorAll<HTMLElement>(
        '[role^="menuitem"]:not(:disabled)',
      ) ?? [],
    );

  function toggleMenu(id: string | null, event: MouseEvent<HTMLElement>): void {
    if (menu && menu.id === id) return closeMenu();
    menuTrigger.current = event.currentTarget;
    const rect = event.currentTarget.getBoundingClientRect();
    setMenu({
      id,
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
    // Opened from the keyboard: move focus into the menu.
    if (event.detail === 0) afterRender.current = () => menuItems()[0]?.focus();
  }

  function closeMenu(restoreFocus = false): void {
    setMenu(null);
    if (restoreFocus) menuTrigger.current?.focus();
  }

  /** Runs a menu command, then returns focus to the trigger or to `focusAfter`. */
  function menuAction(action: () => void, focusAfter?: string): void {
    action();
    closeMenu(!focusAfter);
    if (focusAfter) focusLater(focusAfter);
  }

  function removeFromMenu(id: string): void {
    closeMenu();
    remove(id);
  }

  function onMenuKeydown(event: KeyboardEvent<HTMLDivElement>): void {
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

  // A pointer down outside the open menu and its trigger closes it.
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

  return (
    <div ref={root} className="shell tpl-board">
      <style>{css}</style>
      <div className="body">
        <SonePageHeader>
          <SonePageHeaderContent>
            <SonePageHeaderEyebrow>
              Projects / Surface One
            </SonePageHeaderEyebrow>
            <SonePageHeaderTitle>{SPRINT.name}</SonePageHeaderTitle>
            <SonePageHeaderDescription>
              {SPRINT.goal}{" "}
              <span className="sprint-dates">
                <SoneIcon icon="clock" />
                {SPRINT.dates} · {SPRINT.remaining} days remaining
              </span>
            </SonePageHeaderDescription>
          </SonePageHeaderContent>
          <SonePageHeaderActions>
            <SoneButton
              variant="outline"
              size="sm"
              type="button"
              onClick={completeSprint}
            >
              Complete sprint
            </SoneButton>
            <SoneButton
              variant="ghost"
              size="icon-sm"
              type="button"
              aria-haspopup="menu"
              aria-expanded={menu?.id === null}
              aria-controls={menu?.id === null ? "board-menu" : undefined}
              aria-label="Board actions"
              title="Board actions"
              onClick={(e: MouseEvent<HTMLElement>) => toggleMenu(null, e)}
            >
              <SoneIcon icon="ellipsis" />
            </SoneButton>
          </SonePageHeaderActions>
        </SonePageHeader>

        <div className="toolbar">
          <SoneInputGroup className="search">
            <SoneInputGroupAddon as="span">
              <SoneIcon icon="search" />
            </SoneInputGroupAddon>
            <SoneInputGroupInput
              value={query}
              onValueChange={setQuery}
              type="search"
              aria-label="Search issues"
              placeholder="Search this board…"
            />
          </SoneInputGroup>
          <div className="people" role="group" aria-label="Filter by assignee">
            {PEOPLE.map((p) => (
              <button
                key={p.id}
                type="button"
                className="person-filter"
                aria-pressed={assignees.includes(p.id)}
                title={p.name}
                onClick={() => toggleAssignee(p.id)}
              >
                <Initials person={p} />
                <span className="sr-only">{p.name}</span>
              </button>
            ))}
          </div>
          <SoneToggleGroup
            variant="outline"
            size="sm"
            spacing={1}
            role="group"
            aria-label="Quick filters"
          >
            <SoneToggleGroupItem
              type="button"
              pressed={mine}
              onClick={() => setMine(!mine)}
            >
              Only my issues
            </SoneToggleGroupItem>
            <SoneToggleGroupItem
              type="button"
              pressed={recent}
              onClick={() => setRecent(!recent)}
            >
              Recently updated
            </SoneToggleGroupItem>
            <SoneToggleGroupItem
              type="button"
              pressed={bugs}
              onClick={() => setBugs(!bugs)}
            >
              Bugs
            </SoneToggleGroupItem>
          </SoneToggleGroup>
          <SoneSelect
            value={epic}
            onValueChange={setEpic}
            className="epic-filter"
            size="sm"
            aria-label="Epic"
          >
            <option value="all">All epics</option>
            {EPICS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
            <option value="none">No epic</option>
          </SoneSelect>
          <span className="group-by">
            <span className="group-label" aria-hidden="true">
              Group by
            </span>
            <SoneSegmented
              size="sm"
              ariaLabel="Group by"
              options={GROUP_OPTIONS}
              value={groupBy}
              onValueChange={setGroupBy}
            />
          </span>
          {filtering && (
            <SoneButton
              variant="ghost"
              size="sm"
              type="button"
              onClick={clearFilters}
            >
              Clear filters
            </SoneButton>
          )}
        </div>

        <div className="summary">
          <div className="sprint-progress">
            <p className="progress-text">
              <strong className="num">{donePoints}</strong> of{" "}
              <span className="num">{totalPoints}</span> story points done ·{" "}
              {doneCount} of {issues.length} issues
            </p>
            <SoneStackedBar
              size="sm"
              aria-label="Sprint progress in story points"
              segments={progressSegments}
              max={totalPoints}
            />
          </div>
          <p id="board-hint" className="hint">
            Drag issues between columns, or focus one and press{" "}
            <SoneKbd>Shift</SoneKbd> + <SoneKbd>←</SoneKbd> /{" "}
            <SoneKbd>→</SoneKbd>.
          </p>
        </div>

        <h3 id="board-title" className="sr-only" tabIndex={-1}>
          Board
        </h3>
        <p className="sr-only" role="status">
          {announcement}
        </p>

        <div className="board-scroll">
          <div className="board">
            <div className="board-head">
              {columns.map((col) => (
                <div
                  key={col.status.id}
                  className={col.over ? "col-head is-over" : "col-head"}
                >
                  <h4 id={`board-col-${col.status.id}`} className="col-title">
                    {col.status.label}
                  </h4>
                  <SoneBadge
                    variant={col.over ? "destructive" : "secondary"}
                    className="num"
                  >
                    {col.count}
                    <span className="sr-only"> issues</span>
                  </SoneBadge>
                  {col.status.wip !== null && (
                    <>
                      <span className="wip">Max {col.status.wip}</span>
                      {col.over && (
                        <span className="sr-only">Over the limit</span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {lanes.map((l) => (
              <div key={l.key} className="lane">
                {l.title !== null && (
                  <h4 className="lane-head">
                    <button
                      type="button"
                      className="lane-toggle"
                      aria-expanded={!collapsed.includes(l.key)}
                      aria-controls={`board-lane-${l.key}`}
                      onClick={() => toggleLane(l.key)}
                    >
                      <SoneIcon icon="chevron-right" className="lane-caret" />
                      {l.person ? (
                        <Initials person={l.person} />
                      ) : l.epic ? (
                        <span className="epic-dot" style={tone(l.epic)}>
                          <SoneIcon icon="zap" />
                        </span>
                      ) : null}
                      <span
                        id={`board-lane-name-${l.key}`}
                        className="lane-name"
                      >
                        {l.title}
                      </span>
                      <span className="lane-meta">
                        {l.count} {l.count === 1 ? "issue" : "issues"} ·{" "}
                        {l.points} points
                      </span>
                    </button>
                  </h4>
                )}
                {!collapsed.includes(l.key) && (
                  <div id={`board-lane-${l.key}`} className="cells">
                    {l.cells.map((cell) => (
                      <ul
                        key={cell.status.id}
                        className={
                          dropTarget === `${l.key}:${cell.status.id}`
                            ? "cell is-drop"
                            : "cell"
                        }
                        aria-labelledby={cellLabel(l, cell.status)}
                        onDragOver={(e) => onDragOver(e, l.key, cell.status.id)}
                        onDragLeave={(e) =>
                          onDragLeave(e, l.key, cell.status.id)
                        }
                        onDrop={(e) => onDrop(e, l.key, cell.status.id)}
                      >
                        {cell.issues.map((i) => (
                          <IssueCard
                            key={i.id}
                            issue={i}
                            selected={selectedId === i.id}
                            dragging={dragId === i.id}
                            detailOpen={!!selected}
                            menuOpen={menu?.id === i.id}
                            onOpen={() => open(i.id)}
                            onKeyDown={(e) => onCardKeydown(e, i)}
                            onMenu={(e) => toggleMenu(i.id, e)}
                            onDragStart={(e) => onDragStart(e, i.id)}
                            onDragEnd={onDragEnd}
                          />
                        ))}
                      </ul>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="board-foot">
              {creating ? (
                <form
                  className="create-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    create();
                  }}
                >
                  <SoneSelect
                    value={newType}
                    onValueChange={setNewType}
                    size="sm"
                    aria-label="Issue type"
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </SoneSelect>
                  <input
                    id="board-new-summary"
                    value={newSummary}
                    onChange={(e) => setNewSummary(e.target.value)}
                    type="text"
                    aria-label="Summary of the new issue"
                    placeholder="What needs to be done?"
                    autoComplete="off"
                    onKeyDown={(e) => {
                      if (e.key === "Escape") cancelCreate();
                    }}
                  />
                  <div className="create-actions">
                    <SoneButton
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={cancelCreate}
                    >
                      Cancel
                    </SoneButton>
                    <SoneButton
                      size="sm"
                      type="submit"
                      disabled={!newSummary.trim()}
                    >
                      Create
                    </SoneButton>
                  </div>
                </form>
              ) : (
                <SoneButton
                  id="board-create"
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="create-btn"
                  onClick={startCreate}
                >
                  <SoneIcon icon="plus" />
                  <span>Create issue</span>
                </SoneButton>
              )}
            </div>
          </div>
        </div>
        {!visible.length && (
          <p className="no-results">No issues match these filters.</p>
        )}
      </div>

      {/* No React side panel component yet: the same classes as [soneSidePanel] and its parts. */}
      {selected && (
        <div
          id="board-detail"
          className="side-panel details"
          data-slot="side-panel"
          role="region"
          aria-labelledby="board-detail-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
        >
          <div className="side-panel-header" data-slot="side-panel-header">
            <h3
              id="board-detail-title"
              className="side-panel-title"
              data-slot="side-panel-title"
              tabIndex={-1}
            >
              <TypeIcon type={selected.type} />
              {selected.id}
            </h3>
            <div className="side-panel-actions" data-slot="side-panel-actions">
              <SoneButton
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-pressed={selected.flagged}
                aria-label="Flagged"
                title="Flagged"
                onClick={() => toggleFlag(selected.id)}
              >
                <SoneIcon icon="alert-circle" />
              </SoneButton>
              <SoneButton
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-label="Close issue details"
                onClick={close}
              >
                <SoneIcon icon="close" />
              </SoneButton>
            </div>
          </div>
          <div className="side-panel-content" data-slot="side-panel-content">
            {selected.flagged && (
              <p className="flag-note">
                <SoneIcon icon="alert-circle" /> Flagged as an impediment
              </p>
            )}
            <SoneField>
              <SoneFieldLabel htmlFor="board-summary">Summary</SoneFieldLabel>
              {/* Saved on blur, as a native change event; keyed so another issue resets it. */}
              <textarea
                key={selected.id}
                id="board-summary"
                className="summary-input"
                rows={2}
                defaultValue={selected.summary}
                onBlur={(e) => rename(selected.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  e.currentTarget.blur();
                }}
              />
            </SoneField>

            <div className="fields">
              <SoneField>
                <SoneFieldLabel htmlFor="board-status">Status</SoneFieldLabel>
                <SoneSelect
                  size="sm"
                  selectId="board-status"
                  value={selected.status}
                  onSelectionChange={(v) => moveTo(selected.id, v as StatusId)}
                >
                  {STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </SoneSelect>
              </SoneField>
              <SoneField>
                <SoneFieldLabel htmlFor="board-assignee">
                  Assignee
                </SoneFieldLabel>
                <SoneSelect
                  size="sm"
                  selectId="board-assignee"
                  value={selected.assignee ?? ""}
                  onSelectionChange={(v) => assign(selected.id, v || null)}
                >
                  <option value="">Unassigned</option>
                  {PEOPLE.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </SoneSelect>
              </SoneField>
              <SoneField>
                <SoneFieldLabel htmlFor="board-priority">
                  Priority
                </SoneFieldLabel>
                <SoneSelect
                  size="sm"
                  selectId="board-priority"
                  value={selected.priority}
                  onSelectionChange={(v) =>
                    patch(selected.id, { priority: v as PriorityId })
                  }
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </SoneSelect>
              </SoneField>
              <SoneField>
                <SoneFieldLabel htmlFor="board-points">
                  Story points
                </SoneFieldLabel>
                <SoneSelect
                  size="sm"
                  selectId="board-points"
                  value={
                    selected.points === null ? "" : String(selected.points)
                  }
                  onSelectionChange={(v) => setPoints(selected.id, v)}
                >
                  <option value="">None</option>
                  {POINTS.map((n) => (
                    <option key={n} value={String(n)}>
                      {n}
                    </option>
                  ))}
                </SoneSelect>
              </SoneField>
              <SoneField className="wide">
                <SoneFieldLabel htmlFor="board-epic">Epic</SoneFieldLabel>
                <SoneSelect
                  size="sm"
                  selectId="board-epic"
                  value={selected.epic ?? ""}
                  onSelectionChange={(v) =>
                    patch(selected.id, { epic: v || null })
                  }
                >
                  <option value="">No epic</option>
                  {EPICS.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </SoneSelect>
              </SoneField>
            </div>

            <dl className="props">
              <div>
                <dt>Reporter</dt>
                <dd className="person">
                  {personOf(selected.reporter) && (
                    <>
                      <Initials person={personOf(selected.reporter)!} />
                      {personOf(selected.reporter)!.name}
                    </>
                  )}
                </dd>
              </div>
              <div>
                <dt>Labels</dt>
                <dd className="tags">
                  {selected.labels.map((label) => (
                    <SoneBadge key={label} variant="outline">
                      {label}
                    </SoneBadge>
                  ))}
                  {!selected.labels.length && "None"}
                </dd>
              </div>
              <div>
                <dt>Sprint</dt>
                <dd>{SPRINT.name}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>{updatedLabel(selected)}</dd>
              </div>
            </dl>

            <h4 className="section-title">Description</h4>
            <p className="text">{selected.description}</p>

            <h4 id="board-subtasks-title" className="section-title">
              Subtasks
              {selected.subtasks.length > 0 && (
                <span className="section-count num">
                  {subtasksDone(selected)} of {selected.subtasks.length} done
                </span>
              )}
            </h4>
            {selected.subtasks.length ? (
              <>
                <SoneProgress
                  aria-label="Subtasks done"
                  value={subtasksDone(selected)}
                  max={selected.subtasks.length}
                />
                <ul className="subtasks" aria-labelledby="board-subtasks-title">
                  {selected.subtasks.map((t) => (
                    <li key={t.id}>
                      <input
                        id={`board-subtask-${t.id}`}
                        type="checkbox"
                        checked={t.done}
                        onChange={() => toggleSubtask(selected.id, t.id)}
                      />
                      <label
                        htmlFor={`board-subtask-${t.id}`}
                        className={t.done ? "is-done" : undefined}
                      >
                        {t.title}
                      </label>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text muted">No subtasks yet.</p>
            )}

            <h4 className="section-title">Activity</h4>
            <form
              className="comment-form"
              onSubmit={(e) => {
                e.preventDefault();
                addComment(selected.id);
              }}
            >
              <SoneField>
                <SoneFieldLabel htmlFor="board-comment">
                  Add a comment
                </SoneFieldLabel>
                <textarea
                  id="board-comment"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  placeholder="Ask a question or post an update…"
                />
              </SoneField>
              <SoneButton size="sm" type="submit" disabled={!draft.trim()}>
                Save
              </SoneButton>
            </form>
            {selected.comments.length > 0 && (
              <ol className="comments" aria-label="Comments, newest first">
                {commentsOf(selected).map((c) => (
                  <li key={c.id}>
                    <SoneAvatar size="sm" aria-hidden="true">
                      <SoneAvatarFallback>
                        {personOf(c.author)?.initials}
                      </SoneAvatarFallback>
                    </SoneAvatar>
                    <span className="comment-body">
                      <span className="comment-meta">
                        <strong>{personOf(c.author)?.name}</strong> · {c.when}
                      </span>
                      <span className="comment-text">{c.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}

      {/* Only opened by a click, so `document` is there: never during a server render. */}
      {menu &&
        createPortal(
          <SoneMenu
            id="board-menu"
            ref={panel}
            className="row-panel tpl-board-menu"
            style={{ top: `${menu.top}px`, right: `${menu.right}px` }}
            aria-label={
              menuIssue ? `Actions for ${menuIssue.id}` : "Board actions"
            }
            tabIndex={-1}
            onKeyDown={onMenuKeydown}
          >
            {menuIssue ? (
              <>
                <SoneMenuGroup aria-label="Move to">
                  <SoneMenuLabel>Move to</SoneMenuLabel>
                  {STATUSES.map((s) => (
                    <SoneMenuRadioItem
                      key={s.id}
                      type="button"
                      checked={menuIssue.status === s.id}
                      onClick={() =>
                        menuAction(
                          () => moveTo(menuIssue.id, s.id),
                          `#board-open-${menuIssue.id}`,
                        )
                      }
                    >
                      {s.label}
                    </SoneMenuRadioItem>
                  ))}
                </SoneMenuGroup>
                <SoneMenuSeparator />
                <SoneMenuItem
                  type="button"
                  onClick={() =>
                    menuAction(() => open(menuIssue.id), "#board-detail-title")
                  }
                >
                  <SoneIcon icon="eye" /> Open issue
                </SoneMenuItem>
                <SoneMenuItem
                  type="button"
                  disabled={menuIssue.assignee === ME}
                  onClick={() => menuAction(() => assign(menuIssue.id, ME))}
                >
                  <SoneIcon icon="user" /> Assign to me
                </SoneMenuItem>
                <SoneMenuItem
                  type="button"
                  onClick={() => menuAction(() => toggleFlag(menuIssue.id))}
                >
                  <SoneIcon icon="alert-circle" />{" "}
                  {menuIssue.flagged ? "Remove flag" : "Add flag"}
                </SoneMenuItem>
                <SoneMenuSeparator />
                <SoneMenuItem
                  variant="destructive"
                  type="button"
                  onClick={() => removeFromMenu(menuIssue.id)}
                >
                  <SoneIcon icon="trash" /> Delete
                </SoneMenuItem>
              </>
            ) : (
              <>
                <SoneMenuItem
                  type="button"
                  onClick={() =>
                    menuAction(() => say("Sprint details opened."))
                  }
                >
                  <SoneIcon icon="edit" /> Edit sprint
                </SoneMenuItem>
                <SoneMenuItem
                  type="button"
                  onClick={() =>
                    menuAction(() => say("Board settings opened."))
                  }
                >
                  <SoneIcon icon="sliders" /> Board settings
                </SoneMenuItem>
                <SoneMenuItem
                  type="button"
                  onClick={() => menuAction(() => say("Board link copied."))}
                >
                  <SoneIcon icon="link" /> Copy board link
                </SoneMenuItem>
              </>
            )}
          </SoneMenu>,
          document.body,
        )}
    </div>
  );
}

function TypeIcon({ type }: { type: IssueType }) {
  return (
    <span className="type-icon" data-type={type}>
      <SoneIcon icon={TYPES[type].icon} label={TYPES[type].label} />
    </span>
  );
}

interface IssueCardProps {
  readonly issue: Issue;
  readonly selected: boolean;
  readonly dragging: boolean;
  /** The details panel is open: the card controls it. */
  readonly detailOpen: boolean;
  readonly menuOpen: boolean;
  readonly onOpen: () => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  readonly onMenu: (event: MouseEvent<HTMLElement>) => void;
  readonly onDragStart: (event: DragEvent<HTMLElement>) => void;
  readonly onDragEnd: () => void;
}

function IssueCard({
  issue: i,
  selected,
  dragging,
  detailOpen,
  menuOpen,
  onOpen,
  onKeyDown,
  onMenu,
  onDragStart,
  onDragEnd,
}: IssueCardProps) {
  const epic = epicOf(i.epic);
  const assignee = personOf(i.assignee);
  const classes = ["issue"];
  if (i.flagged) classes.push("is-flagged");
  if (selected) classes.push("is-selected");
  if (dragging) classes.push("is-dragging");
  return (
    <SoneCard
      as="li"
      size="sm"
      className={classes.join(" ")}
      draggable
      data-status={i.status}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="issue-head">
        <button
          id={`board-open-${i.id}`}
          type="button"
          className="issue-open"
          aria-describedby={`board-meta-${i.id}`}
          aria-controls={detailOpen ? "board-detail" : undefined}
          aria-keyshortcuts="Shift+ArrowLeft Shift+ArrowRight"
          onClick={onOpen}
          onKeyDown={onKeyDown}
        >
          {i.summary}
        </button>
        <SoneButton
          variant="ghost"
          size="icon-xs"
          type="button"
          className="issue-menu"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? "board-menu" : undefined}
          aria-label={`Actions for ${i.id}`}
          title={`Actions for ${i.id}`}
          onClick={onMenu}
        >
          <SoneIcon icon="ellipsis" />
        </SoneButton>
      </div>
      {(i.epic || i.labels.length > 0) && (
        <p className="issue-tags">
          {epic && (
            <span className="epic-tag" style={tone(epic)}>
              {epic.name}
            </span>
          )}
          {i.labels.map((label) => (
            <SoneBadge key={label} variant="outline">
              {label}
            </SoneBadge>
          ))}
        </p>
      )}
      <div id={`board-meta-${i.id}`} className="issue-meta">
        <TypeIcon type={i.type} />
        <span className="issue-key">{i.id}</span>
        {i.flagged && (
          <span className="flag">
            <SoneIcon icon="alert-circle" label="Flagged" />
          </span>
        )}
        {i.subtasks.length > 0 && (
          <span className="meta-count num">
            <SoneIcon icon="list-checks" />
            {subtasksDone(i)}/{i.subtasks.length}
            <span className="sr-only"> subtasks done</span>
          </span>
        )}
        {i.comments.length > 0 && (
          <span className="meta-count num">
            <SoneIcon icon="message-square" />
            {i.comments.length}
            <span className="sr-only">
              {" "}
              {i.comments.length === 1 ? "comment" : "comments"}
            </span>
          </span>
        )}
        <span className="meta-end">
          {i.points !== null && (
            <SoneBadge variant="secondary" className="points num">
              {i.points}
              <span className="sr-only"> story points</span>
            </SoneBadge>
          )}
          <span className="priority" data-priority={i.priority}>
            <SoneIcon
              icon={PRIORITIES[i.priority].icon}
              label={`${PRIORITIES[i.priority].label} priority`}
            />
          </span>
          {assignee ? (
            <>
              <SoneAvatar size="sm" aria-hidden="true" title={assignee.name}>
                <SoneAvatarFallback>{assignee.initials}</SoneAvatarFallback>
              </SoneAvatar>
              <span className="sr-only">Assigned to {assignee.name}</span>
            </>
          ) : (
            <span className="unassigned" title="Unassigned">
              <SoneIcon icon="user" label="Unassigned" />
            </span>
          )}
        </span>
      </div>
    </SoneCard>
  );
}
