import {
  Comment,
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  useId,
  watch,
  type ComputedRef,
  type InjectionKey,
  type PropType,
  type Ref,
  type VNode,
} from "vue";

import {
  commandItemMatches,
  listNavigationIndex,
  soneCommandFilter,
  type SoneCommandFilter,
} from "@surface-one/core";

import { useModel } from "../../utils/model";
import { asProp, flag, renderAs, toElement } from "../../utils/part";
import { vnodeText } from "../../utils/vnodes";

export { soneCommandFilter, type SoneCommandFilter } from "@surface-one/core";

/** One option, as the command sees it. */
interface CommandItemRecord {
  readonly id: () => string;
  readonly value: () => string;
  readonly keywords: () => readonly string[];
  readonly disabled: () => boolean;
  readonly element: () => HTMLElement | null;
  choose(): void;
}

interface CommandContext {
  readonly search: Ref<string>;
  setSearch(value: string): void;
  setActive(value: string | null): void;
  matches(value: string, keywords: readonly string[]): boolean;
  /** The highlighted option (`null` until the options have mounted). */
  readonly activeItem: ComputedRef<CommandItemRecord | null>;
  /** Some option matches (assumed until the options have mounted, as on the server). */
  readonly hasVisible: ComputedRef<boolean>;
  readonly listId: Ref<string | null>;
  register(item: CommandItemRecord): () => void;
}

interface CommandGroupContext {
  register(item: CommandItemRecord): () => void;
}

const COMMAND: InjectionKey<CommandContext> = Symbol("SoneCommand");
const COMMAND_GROUP: InjectionKey<CommandGroupContext> =
  Symbol("SoneCommandGroup");

function useCommand(part: string): CommandContext {
  const command = inject(COMMAND, null);
  if (!command) throw new Error(`${part} must sit inside a <SoneCommand>.`);
  return command;
}

/** Document order; options that have not mounted yet go last. */
function byDocumentOrder(a: CommandItemRecord, b: CommandItemRecord): number {
  const ea = a.element();
  const eb = b.element();
  if (!ea || !eb) return ea ? -1 : eb ? 1 : 0;
  return ea.compareDocumentPosition(eb) & Node.DOCUMENT_POSITION_FOLLOWING
    ? -1
    : 1;
}

/**
 * `<sone-command>` — a filterable command list (shadcn/ui Command): a combobox
 * input (`SoneCommandInput`) over a listbox (`SoneCommandList`). The input keeps
 * focus; the highlighted option is announced through `aria-activedescendant`.
 * Arrow keys, Home / End and PageUp / PageDown move the highlight, Enter selects it.
 *
 * Filtering is built in (case- and accent-insensitive, item `value` + `keywords`);
 * set `shouldFilter` to `false` when the list already comes filtered from a server.
 * `v-model:search` and `v-model:active` (the highlighted value); the exposed
 * `handleKeydown(event)` forwards keys from an input that lives elsewhere.
 */
export const SoneCommand = defineComponent({
  name: "SoneCommand",
  props: {
    /** The search text — `v-model:search`; `SoneCommandInput` writes it. */
    search: { type: String, default: "" },
    /** Filter the items by `search`. Turn off for server-side search. */
    shouldFilter: { type: Boolean, default: true },
    /** A custom match function (default `soneCommandFilter`). */
    filter: {
      type: Function as PropType<SoneCommandFilter>,
      default: soneCommandFilter,
    },
    /** Arrow keys wrap from the last option to the first. */
    loop: { type: Boolean, default: false },
    /** The highlighted option's value — `v-model:active`. */
    active: { type: String as PropType<string | null>, default: null },
  },
  emits: {
    "update:search": (_value: string) => true,
    "update:active": (_value: string | null) => true,
  },
  setup(props, { emit, slots, expose }) {
    const search = useModel(
      () => props.search,
      (v) => emit("update:search", v),
    );
    const active = useModel(
      () => props.active,
      (v) => emit("update:active", v),
    );
    const items = shallowRef<readonly CommandItemRecord[]>([]);
    const listId = ref<string | null>(null);
    const mounted = ref(false);
    onMounted(() => (mounted.value = true));

    const matches = (value: string, keywords: readonly string[]): boolean =>
      commandItemMatches(
        value,
        keywords,
        search.value,
        props.shouldFilter,
        props.filter,
      );

    /** The options that match the search, in document order. */
    const visibleItems = computed(() =>
      items.value
        .filter((item) => matches(item.value(), item.keywords()))
        .sort(byDocumentOrder),
    );
    const enabledItems = computed(() =>
      visibleItems.value.filter((item) => !item.disabled()),
    );
    const activeItem = computed(() => {
      if (!mounted.value) return null;
      const enabled = enabledItems.value;
      return (
        enabled.find((item) => item.value() === active.value) ??
        enabled[0] ??
        null
      );
    });
    const hasVisible = computed(
      () => !mounted.value || visibleItems.value.length > 0,
    );

    provide(COMMAND, {
      search,
      setSearch: (value) => search.set(value),
      setActive: (value) => active.set(value),
      matches,
      activeItem,
      hasVisible,
      listId,
      register(item) {
        items.value = [...items.value, item];
        return () => {
          items.value = items.value.filter((i) => i !== item);
        };
      },
    });

    /** The command's keyboard handling; call it to forward keys from an input elsewhere. */
    const handleKeydown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented || event.isComposing) return;
      if (event.key === "Enter") {
        const item = activeItem.value;
        if (item) {
          event.preventDefault();
          item.choose();
        }
        return;
      }
      const enabled = enabledItems.value;
      const current = activeItem.value ? enabled.indexOf(activeItem.value) : -1;
      const next = listNavigationIndex(event.key, current, enabled.length, {
        wrap: props.loop,
      });
      if (next === null) return;
      event.preventDefault();
      const item = enabled[next]!;
      active.set(item.value());
      item.element()?.scrollIntoView?.({ block: "nearest" });
    };
    expose({ handleKeydown });

    return () =>
      h(
        "sone-command",
        { class: "command", "data-slot": "command", onKeydown: handleKeydown },
        slots.default?.(),
      );
  },
});

/** `SoneCommandInput` — the combobox that searches the command list and keeps focus. */
export const SoneCommandInput = defineComponent({
  name: "SoneCommandInput",
  setup() {
    const command = useCommand("SoneCommandInput");
    const onInput = (event: Event): void => {
      command.setSearch((event.target as HTMLInputElement).value);
      // A new search starts from the first match.
      command.setActive(null);
    };
    return () =>
      h("input", {
        class: "command-input",
        "data-slot": "command-input",
        role: "combobox",
        type: "text",
        autocomplete: "off",
        autocorrect: "off",
        spellcheck: "false",
        "aria-autocomplete": "list",
        "aria-expanded": command.hasVisible.value ? "true" : "false",
        "aria-controls": command.listId.value ?? undefined,
        "aria-activedescendant": command.activeItem.value?.id() ?? undefined,
        value: command.search.value,
        onInput,
      });
  },
});

/** `SoneCommandList` — the listbox; it scrolls when the options overflow. */
export const SoneCommandList = defineComponent({
  name: "SoneCommandList",
  props: {
    ...asProp,
    id: { type: String as PropType<string | null>, default: null },
  },
  setup(props, { slots }) {
    const command = useCommand("SoneCommandList");
    const fallback = `sone-command-list-${useId()}`;
    const id = computed(() => props.id ?? fallback);
    watch(id, (value) => (command.listId.value = value), { immediate: true });
    onBeforeUnmount(() => {
      if (command.listId.value === id.value) command.listId.value = null;
    });
    return () =>
      renderAs(
        props.as ?? "div",
        {
          class: "command-list",
          "data-slot": "command-list",
          // An empty listbox is invalid ARIA: with no option to show, the list is a
          // plain container for the `SoneCommandEmpty` message and the combobox collapses.
          role: command.hasVisible.value ? "listbox" : undefined,
          id: id.value,
        },
        slots,
      );
  },
});

/** `SoneCommandGroup` — a labelled group of options; it hides when none of them match. */
export const SoneCommandGroup = defineComponent({
  name: "SoneCommandGroup",
  props: {
    ...asProp,
    heading: { type: String as PropType<string | null>, default: null },
  },
  setup(props, { slots }) {
    const command = useCommand("SoneCommandGroup");
    const headingId = `sone-command-group-${useId()}`;
    const items = shallowRef<readonly CommandItemRecord[]>([]);
    const mounted = ref(false);
    onMounted(() => (mounted.value = true));
    provide(COMMAND_GROUP, {
      register(item) {
        items.value = [...items.value, item];
        return () => {
          items.value = items.value.filter((i) => i !== item);
        };
      },
    });
    const hasVisible = computed(
      () =>
        !mounted.value ||
        items.value.some((item) =>
          command.matches(item.value(), item.keywords()),
        ),
    );
    return () =>
      renderAs(
        props.as ?? "div",
        {
          class: "command-group",
          "data-slot": "command-group",
          role: "group",
          "aria-labelledby": props.heading ? headingId : undefined,
          hidden: hasVisible.value ? undefined : "",
        },
        {
          default: () => [
            props.heading
              ? h(
                  "div",
                  {
                    class: "command-group-heading",
                    "data-slot": "command-group-heading",
                    id: headingId,
                    "aria-hidden": "true",
                  },
                  props.heading,
                )
              : h(Comment),
            ...(slots.default?.() ?? []),
          ],
        },
      );
  },
});

/**
 * `SoneCommandItem` — one option. `value` is what the search matches (default: the
 * text content) and what `select` emits; `keywords` match too.
 */
export const SoneCommandItem = defineComponent({
  name: "SoneCommandItem",
  props: {
    ...asProp,
    value: { type: String as PropType<string | null>, default: null },
    keywords: {
      type: Array as PropType<readonly string[]>,
      default: () => [],
    },
    disabled: { type: Boolean, default: false },
    id: { type: String as PropType<string | null>, default: null },
  },
  emits: {
    /** Chosen with a click or Enter; emits the item's value. */
    select: (_value: string) => true,
  },
  setup(props, { slots, emit }) {
    const command = useCommand("SoneCommandItem");
    const group = inject(COMMAND_GROUP, null);
    const fallbackId = `sone-command-item-${useId()}`;
    const el = ref<unknown>(null);
    // The slot's text, read while rendering (on the server too): the default value.
    const text = ref("");
    const itemValue = (): string =>
      props.value ?? (toElement(el.value)?.textContent?.trim() || text.value);
    const record: CommandItemRecord = {
      id: () => props.id ?? fallbackId,
      value: itemValue,
      keywords: () => props.keywords,
      disabled: () => props.disabled,
      element: () => toElement(el.value),
      choose,
    };
    function choose(): void {
      if (props.disabled) return;
      command.setActive(itemValue());
      emit("select", itemValue());
    }
    const leave = command.register(record);
    const leaveGroup = group?.register(record);
    onBeforeUnmount(() => {
      leave();
      leaveGroup?.();
    });

    return () => {
      const children: VNode[] | undefined = slots.default?.();
      const own = vnodeText(children).trim();
      if (own !== text.value) text.value = own;
      const value = props.value ?? own;
      const visible = command.matches(value, props.keywords);
      const isActive = command.activeItem.value === record;
      return renderAs(
        props.as ?? "div",
        {
          ref: el,
          class: "menu-item command-item",
          "data-slot": "command-item",
          role: "option",
          id: record.id(),
          "aria-selected": isActive ? "true" : "false",
          "aria-disabled": props.disabled ? "true" : undefined,
          "data-selected": flag(isActive),
          "data-disabled": flag(props.disabled),
          hidden: visible ? undefined : "",
          onClick: choose,
          onPointermove: () => {
            if (!props.disabled && !isActive) command.setActive(itemValue());
          },
          onMousedown: (e: MouseEvent) => e.preventDefault(),
        },
        { default: () => children ?? [] },
      );
    };
  },
});

/** `SoneCommandEmpty` — shown only when no option matches. */
export const SoneCommandEmpty = defineComponent({
  name: "SoneCommandEmpty",
  props: asProp,
  setup(props, { slots }) {
    const command = useCommand("SoneCommandEmpty");
    return () =>
      renderAs(
        props.as ?? "div",
        {
          class: "command-empty",
          "data-slot": "command-empty",
          role: "presentation",
          hidden: command.hasVisible.value ? "" : undefined,
        },
        slots,
      );
  },
});

/** `SoneCommandSeparator` — a divider between groups; hidden while searching. */
export const SoneCommandSeparator = defineComponent({
  name: "SoneCommandSeparator",
  props: asProp,
  setup(props, { slots }) {
    const command = useCommand("SoneCommandSeparator");
    return () =>
      renderAs(
        props.as ?? "div",
        {
          class: "command-separator",
          "data-slot": "command-separator",
          role: "presentation",
          "aria-hidden": "true",
          hidden: command.search.value.trim() ? "" : undefined,
        },
        slots,
      );
  },
});
