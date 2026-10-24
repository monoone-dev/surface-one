import {
  AGENT_STATUS_EN,
  MARKDOWN_TOOLBAR_LABELS_EN,
  type AgentState,
  type MarkdownToolbarLabelKey,
} from "./angular";

/**
 * The few strings the components say themselves (the Angular package marks the same
 * ones with `$localize`). English by default; the Vue and React packages let an app
 * translate them (`app.use(SurfaceOne, { messages })`, `<SurfaceOneProvider messages>`).
 */
export interface SoneMessages {
  /** The corner close button of a dialog or sheet. */
  readonly close: string;
  /** A spinner's accessible name. */
  readonly loading: string;
  /** The meter's spoken count: `3 of 4`. */
  readonly meterCount: (filled: number, max: number) => string;
  /** The speaker key `me`. */
  readonly speakerMe: string;
  /** The speaker key `others`. */
  readonly speakerOthers: string;
  /** A numbered speaker (`others-N` → N+1, `speaker-N` → N). */
  readonly speakerNumbered: (n: number) => string;
  /** Read before a stat trend that went up / down / did not change: "up 12%". */
  readonly statTrendUp: string;
  readonly statTrendDown: string;
  readonly statTrendFlat: string;
  /** The locale charts format their numbers in (legend values, stacked-bar summary). */
  readonly numberLocale: string;
  /** A stacked bar's spoken summary: "Playback 4.2 GB (40%)", "7.6 GB of 20 GB", "7.6 GB in total". */
  readonly stackedBarPart: (
    label: string,
    value: string,
    percent: string,
  ) => string;
  readonly stackedBarOf: (total: string, max: string) => string;
  readonly stackedBarTotal: (total: string) => string;
  readonly stackedBarEmpty: string;
  /** A stepper's accessible name. */
  readonly stepperLabel: string;
  /** A stepper's visible count: `Step 2 of 4`. */
  readonly stepCount: (current: number, total: number) => string;
  /** A copy button's label. */
  readonly copy: string;
  /** A copy button's confirmation. */
  readonly copied: string;
  /** A password input's show / hide toggle. */
  readonly showPassword: string;
  /** A dismissible alert's close button. */
  readonly dismiss: string;
  /** A labelled sparkline's spoken summary: `30 values, peak 5, total 50`. */
  readonly sparklineSummary: (
    count: number,
    peak: string,
    total: string,
  ) => string;
  /** A read-only rating's spoken score: `4.5 out of 5`. */
  readonly ratingSummary: (score: number, max: number) => string;
  /** An interactive rating's group name. */
  readonly ratingLabel: string;
  /** One star of an interactive rating: `1 star`, `3 stars`. */
  readonly ratingStar: (count: number) => string;
  /** A number input's − and + buttons. */
  readonly decrease: string;
  readonly increase: string;
  /** A dock's accessible name. */
  readonly dockLabel: string;
  /** A flow canvas's accessible name, a node's role description and the keyboard help. */
  readonly flowCanvas: string;
  readonly flowNode: string;
  readonly flowInstructions: string;
  /** A node's outgoing connections: `connects to Ship order, Notify buyer`. */
  readonly flowConnectsTo: (targets: string) => string;
  /** A node's status, spoken after its name. */
  readonly flowStatusRunning: string;
  readonly flowStatusSuccess: string;
  readonly flowStatusError: string;
  readonly flowStatusWarning: string;
  /** Appended to a selected node's name. */
  readonly flowSelected: string;
  /** The handles that start / end a connection. */
  readonly flowConnectFrom: (node: string, port: string) => string;
  readonly flowConnectTo: (node: string, port: string) => string;
  /** Live-region announcements of a flow canvas. */
  readonly flowConnecting: (node: string) => string;
  readonly flowConnected: (from: string, to: string) => string;
  readonly flowCancelled: string;
  readonly flowDeleted: (count: number) => string;
  readonly flowMoved: (node: string, x: number, y: number) => string;
  /** The flow controls' group name and buttons. */
  readonly flowControls: string;
  readonly flowZoomIn: string;
  readonly flowZoomOut: string;
  readonly flowFit: string;
  readonly flowResetZoom: string;
  readonly flowLock: string;
  /** An inline confirm's buttons and its action's label while busy. */
  readonly confirm: string;
  readonly cancel: string;
  readonly confirmBusy: string;
  /** A search field's placeholder / accessible name and its clear button. */
  readonly search: string;
  readonly clearSearch: string;
  /** The "Show more" button of a paged list, while it loads and after a failed load. */
  readonly showMore: string;
  readonly showMoreBusy: string;
  readonly showMoreRetry: string;
  /** The locale a chat history formats its dates in (`Sep 24, 2026, 9:40 AM`). */
  readonly dateLocale: string;
  /** A chat history's accessible name, its states and its Retry button. */
  readonly chatHistoryLabel: string;
  readonly chatHistoryLoading: string;
  readonly chatHistoryRefreshing: string;
  readonly chatHistoryRetry: string;
  readonly chatHistoryEmptyTitle: string;
  readonly chatHistoryEmptyDescription: string;
  /** No title matches the filter: `No conversations match “plan”.` */
  readonly chatHistoryNoMatch: (query: string) => string;
  /** The age groups of a `sidebar` chat history. */
  readonly chatHistoryToday: string;
  readonly chatHistoryYesterday: string;
  readonly chatHistoryPrevious7Days: string;
  readonly chatHistoryPrevious30Days: string;
  readonly chatHistoryOlder: string;
  /** The sidebar rail: its name while expanded (a splitter) and collapsed (a button), and its hints. */
  readonly sidebarResize: string;
  readonly sidebarToggle: string;
  readonly sidebarExpandedHint: string;
  readonly sidebarCollapsedHint: string;
  /** Agent conversations (terminal, agent chat): the person's name and the arrow's spoken word (`You to Lead`). */
  readonly agentYou: string;
  readonly agentTo: string;
  /** The log's accessible name in the terminal and the agent chat. */
  readonly terminalLabel: string;
  readonly agentChatLabel: string;
  /** The prompt field's accessible name. */
  readonly agentPromptLabel: string;
  /** The button that scrolls a log back to its newest line. */
  readonly agentJumpToNewest: string;
  /** The running time's name in an agent status. */
  readonly agentStatusTime: string;
  /** What an agent status says in `state`; `speaker` is null when the status names no one. */
  readonly agentStatus: (state: AgentState, speaker: string | null) => string;
  /** Markdown: the alt text of an image written without one. */
  readonly markdownImage: string;
  /** Markdown: what stands in for an image that is not inline (`Chart — image not loaded`). */
  readonly markdownImageBlocked: (alt: string) => string;
  /** Markdown: a task box's accessible name. */
  readonly markdownTask: string;
  /** A toast's close button. */
  readonly dismissNotification: string;
  /** A secret field: its status label, the set / unset badges and the buttons. */
  readonly secretStatus: string;
  readonly secretSet: string;
  readonly secretUnset: string;
  readonly secretSave: string;
  readonly secretSaving: string;
  /** Removes the saved secret (a verb). */
  readonly secretClear: string;
  /** A tag input: the field's name, the chip list's name and the "+N more" toggle. */
  readonly tagAdd: string;
  readonly tagList: string;
  readonly tagMore: (count: number) => string;
  readonly tagShowLess: string;
  /** A chip's remove button: `Remove design`. */
  readonly tagRemove: (tag: string) => string;
  /** Live-region announcements: `Added design, q3`, `Removed design`. */
  readonly tagsAdded: (tags: string) => string;
  readonly tagRemoved: (tag: string) => string;
  /** A tree row's caret: `Expand Design`, `Collapse Design`. */
  readonly treeExpand: (name: string) => string;
  readonly treeCollapse: (name: string) => string;
  /** A timeline's built-in strings (its `labels` prop overrides any of them). */
  readonly timelineTitle: string;
  readonly timelineDescription: string;
  readonly timelineLanes: string;
  readonly timelineChapters: string;
  readonly timelineChaptersHint: string;
  readonly timelineSeekAxis: string;
  readonly timelineSeekLanes: string;
  readonly timelineSeekChapters: string;
  readonly timelineLoading: string;
  readonly timelineNeedsGeneration: string;
  readonly timelineGenerate: string;
  readonly timelineUnavailable: string;
  /** Retries loading the timeline (a verb). */
  readonly timelineRetry: string;
  readonly timelinePin: string;
  readonly timelineLaneName: string;
  /** The pin button's name: `Pin this moment at 4:50`. */
  readonly timelinePinAt: (time: string) => string;
  /** A legend lane's rename button and its suggestion: `Rename others-1`, `Rename others-1 to Mia Chen`. */
  readonly timelineRenameLane: (lane: string) => string;
  readonly timelineRenameLaneTo: (lane: string, name: string) => string;
  /** The suggestion chip's text around the suggested name: `Looks like ` + name + `?`. */
  readonly timelineSuggestBefore: string;
  readonly timelineSuggestAfter: string;
  /** The chapter list's name and one chapter button's: `Chapter Intro, starts 0:00`. */
  readonly timelineChapterList: string;
  readonly timelineChapter: (label: string, start: string) => string;
  /** A breadcrumb's accessible name and what its ellipsis says for the collapsed crumbs. */
  readonly breadcrumbLabel: string;
  readonly breadcrumbMore: string;
  /** A pagination's accessible name, its Previous / Next buttons (text and name) and its ellipsis. */
  readonly paginationLabel: string;
  readonly paginationPrevious: string;
  readonly paginationPreviousLabel: string;
  readonly paginationNext: string;
  readonly paginationNextLabel: string;
  readonly paginationMore: string;
  /** A calendar's month buttons. */
  readonly calendarPreviousMonth: string;
  readonly calendarNextMonth: string;
  /** A date picker's placeholder and the name of its calendar popover. */
  readonly datePickerPlaceholder: string;
  readonly datePickerDialog: string;
  /** A combobox's empty state and its clear button (its chips' remove buttons say `tagRemove`). */
  readonly comboboxEmpty: string;
  readonly comboboxClear: string;
  /** Closes a multiple combobox's list sheet (React Native). */
  readonly comboboxDone: string;
  /** A chat thread's accessible name (the `role="log"`). */
  readonly chatConversation: string;
  /** The accessible name of a chat message's text, by sender. */
  readonly chatYouSaid: string;
  readonly chatAssistantSaid: string;
  /** The typing indicator while the assistant answers. */
  readonly chatThinking: string;
  /** The suggestion chips' group. */
  readonly chatSuggestions: string;
  /** The composer's send button (a verb), and while a message is being sent. */
  readonly chatSend: string;
  readonly chatSending: string;
  /** A source list's toggle: chips (`+3 more` / `Show less`) and rows (`Show all (8)` / `Show fewer`). */
  readonly sourceListMore: (count: number) => string;
  readonly sourceListShowLess: string;
  readonly sourceListShowAll: (count: number) => string;
  readonly sourceListShowFewer: string;
  /** The ⋯ menu of a page's actions. */
  readonly pageActionsMore: string;
  /** A mic toggle's accessible name while live / muted, and its visible label (a state, a verb). */
  readonly micMute: string;
  readonly micUnmute: string;
  readonly micMuted: string;
  readonly micMuteAction: string;
  /** The accessible name of a recording indicator's running clock. */
  readonly recordingTime: string;
  /**
   * The label of a built-in processing stage (`recording`, `transcribing`, `summarizing`,
   * `exporting`, `saved`, `finalized`, `done`, `error`); `undefined` for any other stage,
   * which then shows itself capitalised.
   */
  readonly processingStage: (stage: string) => string | undefined;
  /** The audio player: play / pause, the skip group and its buttons (`Back 15 seconds`, `15s`). */
  readonly audioPlay: string;
  readonly audioPause: string;
  readonly audioSkip: string;
  readonly audioBack: (seconds: number) => string;
  readonly audioForward: (seconds: number) => string;
  readonly audioSkipAmount: (seconds: number) => string;
  /** The audio player's seek track and its spoken position (`1:05 of 4:00`). */
  readonly audioSeek: string;
  readonly audioPosition: (position: string, duration: string) => string;
  /** The audio player's playback speed button. */
  readonly audioSpeed: string;
  /** The button that hides the floating recording bar. */
  readonly floatingBarHide: string;
  /** A download progress's default caption and its cancel button. */
  readonly downloadProgressLabel: string;
  readonly downloadProgressCancel: string;
  /** The column headers of a bar chart's visually hidden data table. */
  readonly barChartCategory: string;
  readonly barChartValue: string;
  /** A donut chart's centre caption at rest and its data table's share column. */
  readonly donutChartTotal: string;
  readonly donutChartShare: string;
  /** A textarea counter's spoken characters left: `1 character left`, `8 characters left`. */
  readonly textareaRemaining: (remaining: number) => string;
  /** A file upload's dropzone text, its list name and a file's remove button. */
  readonly fileUploadLabel: string;
  readonly fileUploadList: string;
  readonly fileUploadRemove: (name: string) => string;
  /** Why a file was turned away: its type, its size (over `max`), or one file too many. */
  readonly fileUploadWrongType: (name: string) => string;
  readonly fileUploadTooLarge: (name: string, max: string) => string;
  readonly fileUploadTooMany: (max: number) => string;
  /** A graph: the canvas's role description, keyboard help and empty name. */
  readonly graphRoleDescription: string;
  readonly graphInstructions: string;
  readonly graphEmpty: string;
  /** A graph canvas's default name: `Graph of 12 nodes · 30 links`. */
  readonly graphLabel: (summary: string) => string;
  /** The graph counts: `1 node`, `12 nodes`, `1 link`, `30 links`. */
  readonly graphNodes: (count: number) => string;
  readonly graphLinks: (count: number) => string;
  /** The title of the `clusters` block of unlinked nodes: `Unlinked · 4`. */
  readonly graphUnlinked: (count: number) => string;
  /** The graph controls: the toolbar, Fit, zoom and the list toggle. */
  readonly graphControls: string;
  readonly graphFit: string;
  readonly graphFitLabel: string;
  readonly graphZoomIn: string;
  readonly graphZoomOut: string;
  readonly graphList: string;
  readonly graphListLabel: string;
  /** The open action of the selected node, and the announcement when the selection clears. */
  readonly graphOpen: string;
  readonly graphSelectionCleared: string;
  /** A transcript: the button past the rendered window, and the two empty states. */
  readonly transcriptShowAll: (count: number) => string;
  readonly transcriptNoMatch: (query: string) => string;
  readonly transcriptEmpty: string;
  /** A live transcript: the log's name, the jump button (`Live transcript · Jump to latest`), a partial line, older lines. */
  readonly liveTranscriptLabel: string;
  readonly liveTranscriptJump: string;
  readonly liveTranscriptJumpToLatest: (label: string) => string;
  readonly liveTranscriptPartial: string;
  readonly liveTranscriptOlder: string;
  /** Markdown editor: a formatting toolbar button (by command) or the Headings menu. */
  readonly markdownToolbar: (key: MarkdownToolbarLabelKey) => string;
  /** Markdown editor: the toolbar's and the Write / Preview tabs' names. */
  readonly markdownEditorFormatting: string;
  readonly markdownEditorView: string;
  readonly markdownEditorWrite: string;
  readonly markdownEditorPreview: string;
  /** Markdown editor: the preview of an empty note. */
  readonly markdownEditorEmpty: string;
  /** Markdown editor: the heading the New section button inserts. */
  readonly markdownEditorSection: string;
  /** Markdown editor (live): a checked task box's accessible name (`markdownTask` names an open one). */
  readonly markdownTaskDone: string;
  /** A data table: the filter placeholder, the column menu, the select-all and row checkboxes, the selection count, the empty and loading rows. */
  readonly dataTableFilter: string;
  readonly dataTableColumns: string;
  readonly dataTableSelectAll: string;
  readonly dataTableSelectRow: (row: string | number) => string;
  readonly dataTableSelected: (count: number, total: number) => string;
  readonly dataTableEmpty: string;
  /** A carousel's and its slides' role descriptions, and a slide's default name: `2 of 5`. */
  readonly carousel: string;
  readonly carouselSlide: string;
  readonly carouselSlidePosition: (index: number, count: number) => string;
  /** A carousel's Previous / Next buttons, its dots' group and one dot: `Go to slide 3`. */
  readonly carouselPrevious: string;
  readonly carouselNext: string;
  readonly carouselDots: string;
  readonly carouselGoTo: (index: number) => string;
  /** A carousel's rotation control while it rotates / while it is stopped. */
  readonly carouselStop: string;
  readonly carouselStart: string;
}

const PROCESSING_STAGES_EN: Partial<Record<string, string>> = {
  recording: "Recording",
  transcribing: "Transcribing",
  summarizing: "Summarizing",
  exporting: "Exporting",
  saved: "Saved",
  finalized: "Finalizing",
  done: "Done",
  error: "Error",
};

export const SONE_DEFAULT_MESSAGES: SoneMessages = {
  close: "Close",
  loading: "Loading",
  meterCount: (filled, max) => `${filled} of ${max}`,
  speakerMe: "Me",
  speakerOthers: "Others",
  speakerNumbered: (n) => `Speaker ${n}`,
  statTrendUp: "up",
  statTrendDown: "down",
  statTrendFlat: "unchanged",
  numberLocale: "en",
  stackedBarPart: (label, value, percent) => `${label} ${value} (${percent})`,
  stackedBarOf: (total, max) => `${total} of ${max}`,
  stackedBarTotal: (total) => `${total} in total`,
  stackedBarEmpty: "No data",
  stepperLabel: "Progress",
  stepCount: (current, total) => `Step ${current} of ${total}`,
  copy: "Copy",
  copied: "Copied",
  showPassword: "Show password",
  dismiss: "Dismiss",
  sparklineSummary: (count, peak, total) =>
    `${count} values, peak ${peak}, total ${total}`,
  ratingSummary: (score, max) => `${score} out of ${max}`,
  ratingLabel: "Rating",
  ratingStar: (count) => (count === 1 ? "1 star" : `${count} stars`),
  decrease: "Decrease",
  increase: "Increase",
  dockLabel: "Tools",
  flowCanvas: "Flow diagram",
  flowNode: "node",
  flowInstructions:
    "Tab moves between nodes. Arrow keys move the focused node, C starts a connection from it and Enter on another node finishes it, Delete removes the selection, plus and minus zoom.",
  flowConnectsTo: (targets) => `connects to ${targets}`,
  flowStatusRunning: "running",
  flowStatusSuccess: "succeeded",
  flowStatusError: "failed",
  flowStatusWarning: "needs attention",
  flowSelected: "selected",
  flowConnectFrom: (node, port) => `Connect from ${node} ${port}`,
  flowConnectTo: (node, port) => `Connect to ${node} ${port}`,
  flowConnecting: (node) =>
    `Connecting from ${node}. Move to another node and press Enter, or Escape to cancel.`,
  flowConnected: (from, to) => `Connected ${from} to ${to}.`,
  flowCancelled: "Connection cancelled.",
  flowDeleted: (count) =>
    count === 1 ? "Deleted 1 item." : `Deleted ${count} items.`,
  flowMoved: (node, x, y) => `${node} moved to ${x}, ${y}.`,
  flowControls: "Canvas controls",
  flowZoomIn: "Zoom in",
  flowZoomOut: "Zoom out",
  flowFit: "Fit view",
  flowResetZoom: "Reset zoom",
  flowLock: "Lock canvas",
  confirm: "Confirm",
  cancel: "Cancel",
  confirmBusy: "Working…",
  search: "Search",
  clearSearch: "Clear search",
  showMore: "Show more",
  showMoreBusy: "Loading…",
  showMoreRetry: "Try again",
  dateLocale: "en",
  chatHistoryLabel: "Conversation history",
  chatHistoryLoading: "Loading conversations…",
  chatHistoryRefreshing: "Refreshing…",
  chatHistoryRetry: "Retry",
  chatHistoryEmptyTitle: "No conversations yet",
  chatHistoryEmptyDescription: "Conversations you start will appear here.",
  chatHistoryNoMatch: (query) => `No conversations match “${query}”.`,
  chatHistoryToday: "Today",
  chatHistoryYesterday: "Yesterday",
  chatHistoryPrevious7Days: "Previous 7 days",
  chatHistoryPrevious30Days: "Previous 30 days",
  chatHistoryOlder: "Older",
  sidebarResize: "Resize sidebar",
  sidebarToggle: "Toggle sidebar",
  sidebarExpandedHint:
    "Click to collapse · drag to resize · ⌥-click to reset width",
  agentYou: "You",
  agentTo: "to",
  terminalLabel: "Terminal",
  agentChatLabel: "Conversation",
  agentPromptLabel: "Message",
  agentJumpToNewest: "Jump to newest",
  agentStatusTime: "Time in this state",
  agentStatus: (state, speaker) => AGENT_STATUS_EN[state](speaker),
  markdownImage: "Image",
  markdownImageBlocked: (alt) => `${alt} — image not loaded`,
  markdownTask: "Task",
  sidebarCollapsedHint: "Click to expand",
  dismissNotification: "Dismiss notification",
  secretStatus: "Status",
  secretSet: "Key set ✓",
  secretUnset: "Not set",
  secretSave: "Save key",
  secretSaving: "Saving…",
  secretClear: "Clear",
  tagAdd: "Add tag",
  tagList: "Tags",
  tagMore: (count) => `+${count} more`,
  tagShowLess: "Show less",
  tagRemove: (tag) => `Remove ${tag}`,
  tagsAdded: (tags) => `Added ${tags}`,
  tagRemoved: (tag) => `Removed ${tag}`,
  treeExpand: (name) => `Expand ${name}`,
  treeCollapse: (name) => `Collapse ${name}`,
  timelineTitle: "Timeline",
  timelineDescription: "Who spoke when & what was discussed",
  timelineLanes: "Speakers",
  timelineChapters: "Topics",
  timelineChaptersHint: "Jump to a chapter",
  timelineSeekAxis: "Seek timeline",
  timelineSeekLanes: "Seek speaker timeline",
  timelineSeekChapters: "Seek topic timeline",
  timelineLoading: "Analysing speakers & topics…",
  timelineNeedsGeneration: "Speaker & topic timeline runs an on-device model",
  timelineGenerate: "Generate timeline",
  timelineUnavailable: "Timeline unavailable",
  timelineRetry: "Retry",
  timelinePin: "Pin moment",
  timelineLaneName: "Speaker name",
  timelinePinAt: (time) => `Pin this moment at ${time}`,
  timelineRenameLane: (lane) => `Rename ${lane}`,
  timelineRenameLaneTo: (lane, name) => `Rename ${lane} to ${name}`,
  timelineSuggestBefore: "Looks like ",
  timelineSuggestAfter: "?",
  timelineChapterList: "Chapters",
  timelineChapter: (label, start) => `Chapter ${label}, starts ${start}`,
  breadcrumbLabel: "Breadcrumb",
  breadcrumbMore: "More",
  paginationLabel: "Pagination",
  paginationPrevious: "Previous",
  paginationPreviousLabel: "Go to previous page",
  paginationNext: "Next",
  paginationNextLabel: "Go to next page",
  paginationMore: "More pages",
  calendarPreviousMonth: "Previous month",
  calendarNextMonth: "Next month",
  datePickerPlaceholder: "Pick a date",
  datePickerDialog: "Choose a date",
  comboboxEmpty: "No results found.",
  comboboxClear: "Clear selection",
  comboboxDone: "Done",
  chatConversation: "Conversation",
  chatYouSaid: "You said",
  chatAssistantSaid: "Assistant said",
  chatThinking: "Thinking",
  chatSuggestions: "Suggested questions",
  chatSend: "Send",
  chatSending: "Sending",
  sourceListMore: (count) => `+${count} more`,
  sourceListShowLess: "Show less",
  sourceListShowAll: (count) => `Show all (${count})`,
  sourceListShowFewer: "Show fewer",
  pageActionsMore: "More actions",
  micMute: "Mute microphone",
  micUnmute: "Unmute microphone",
  micMuted: "Muted",
  micMuteAction: "Mute",
  recordingTime: "Recording time",
  processingStage: (stage) => PROCESSING_STAGES_EN[stage],
  audioPlay: "Play",
  audioPause: "Pause",
  audioSkip: "Skip",
  audioBack: (seconds) => `Back ${seconds} seconds`,
  audioForward: (seconds) => `Forward ${seconds} seconds`,
  audioSkipAmount: (seconds) => `${seconds}s`,
  audioSeek: "Seek",
  audioPosition: (position, duration) => `${position} of ${duration}`,
  audioSpeed: "Playback speed",
  floatingBarHide: "Hide",
  downloadProgressLabel: "Downloading…",
  downloadProgressCancel: "Cancel download",
  barChartCategory: "Category",
  barChartValue: "Value",
  donutChartTotal: "Total",
  donutChartShare: "Share",
  textareaRemaining: (remaining) =>
    remaining === 1 ? "1 character left" : `${remaining} characters left`,
  fileUploadLabel: "Drop files here or click to browse",
  fileUploadList: "Selected files",
  fileUploadRemove: (name) => `Remove ${name}`,
  fileUploadWrongType: (name) => `${name} is not an accepted file type.`,
  fileUploadTooLarge: (name, max) => `${name} is larger than ${max}.`,
  fileUploadTooMany: (max) =>
    max === 1
      ? "Only one file can be added."
      : `Only ${max} files can be added.`,
  graphRoleDescription: "network diagram",
  graphInstructions:
    "Arrow keys move to the nearest node, Page Up and Page Down step through all of them, Enter opens the selected one, Escape clears the selection. Plus and minus zoom, 0 fits the view.",
  graphEmpty: "Graph — empty.",
  graphLabel: (summary) => `Graph of ${summary}`,
  graphNodes: (count) => (count === 1 ? "1 node" : `${count} nodes`),
  graphLinks: (count) => (count === 1 ? "1 link" : `${count} links`),
  graphUnlinked: (count) => `Unlinked · ${count}`,
  graphControls: "Graph controls",
  graphFit: "Fit",
  graphFitLabel: "Fit graph to view",
  graphZoomIn: "Zoom in",
  graphZoomOut: "Zoom out",
  graphList: "List",
  graphListLabel: "Show nodes as a list",
  graphOpen: "Open",
  graphSelectionCleared: "Selection cleared.",
  transcriptShowAll: (count) => `Show all ${count} turns`,
  transcriptNoMatch: (query) => `No turns match “${query}”.`,
  transcriptEmpty: "No transcript.",
  liveTranscriptLabel: "Live transcript history",
  liveTranscriptJump: "Live transcript",
  liveTranscriptJumpToLatest: (label) => `${label} · Jump to latest`,
  liveTranscriptPartial: "Listening…",
  liveTranscriptOlder: "Show earlier transcript",
  markdownToolbar: (key) => MARKDOWN_TOOLBAR_LABELS_EN[key],
  markdownEditorFormatting: "Formatting",
  markdownEditorView: "Editor view",
  markdownEditorWrite: "Write",
  markdownEditorPreview: "Preview",
  markdownEditorEmpty: "Nothing to preview",
  markdownEditorSection: "New section",
  markdownTaskDone: "Completed task",
  dataTableFilter: "Filter…",
  dataTableColumns: "Columns",
  dataTableSelectAll: "Select all",
  dataTableSelectRow: (row) =>
    typeof row === "number" ? `Select row ${row}` : `Select ${row}`,
  dataTableSelected: (count, total) => `${count} of ${total} row(s) selected.`,
  dataTableEmpty: "No results.",
  carousel: "carousel",
  carouselSlide: "slide",
  carouselSlidePosition: (index, count) => `${index} of ${count}`,
  carouselPrevious: "Previous slide",
  carouselNext: "Next slide",
  carouselDots: "Choose slide",
  carouselGoTo: (index) => `Go to slide ${index}`,
  carouselStop: "Stop automatic slide show",
  carouselStart: "Start automatic slide show",
};
