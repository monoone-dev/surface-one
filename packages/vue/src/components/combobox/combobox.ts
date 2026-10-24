import {
  Teleport,
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useId,
  watch,
  type PropType,
} from "vue";

import {
  comboboxActiveOption,
  comboboxLabelIds,
  comboboxNavigate,
  comboboxOptionId,
  comboboxOptions,
  comboboxSelectedOptions,
  comboboxToggle,
  createComboboxPopup,
  filterComboboxItems,
  isComboboxSelected,
  listNavigationIndex,
  soneCommandFilter,
  type SoneCommandFilter,
  type SoneComboboxItems,
  type SoneComboboxOption,
  type SoneComboboxValue,
} from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { useModel } from "../../utils/model";
import { flag } from "../../utils/part";
import { SoneIcon } from "../icon";

export type {
  SoneComboboxGroup,
  SoneComboboxItems,
  SoneComboboxOption,
  SoneComboboxValue,
} from "@surface-one/core";

/**
 * `<sone-combobox>` — a text field that filters a listbox of options as you type
 * (shadcn/ui Combobox, the WAI-ARIA combobox pattern): Up / Down, Home / End, PageUp /
 * PageDown move the highlight (`aria-activedescendant`), Enter picks, Escape closes.
 * `options` holds `{ value, label, disabled, keywords }` or labelled groups; `v-model`
 * is one value or, with `multiple`, a list shown as chips; `v-model:search`,
 * `v-model:open`.
 */
export const SoneCombobox = defineComponent({
  name: "SoneCombobox",
  props: {
    /** The options: `{ value, label, disabled?, keywords? }`, or `{ label, options }` groups. */
    options: {
      type: Array as PropType<SoneComboboxItems>,
      default: () => [],
    },
    /** Pick several options, shown as chips; the value is then a list. */
    multiple: { type: Boolean, default: false },
    /** The picked value (`null` while none), or a list with `multiple` — `v-model`. */
    modelValue: {
      type: [String, Array] as PropType<SoneComboboxValue>,
      default: null,
    },
    /** The typed text — `v-model:search`; it clears when the popup closes. */
    search: { type: String, default: "" },
    /** The popup is open — `v-model:open`. */
    open: { type: Boolean, default: false },
    /** Filter the options by the search. Turn off when they come filtered from a server. */
    shouldFilter: { type: Boolean, default: true },
    /** A custom match function (default `soneCommandFilter`). */
    filter: {
      type: Function as PropType<SoneCommandFilter>,
      default: soneCommandFilter,
    },
    placeholder: { type: String, default: "" },
    /** Shown in the popup when no option matches (default: the messages' `comboboxEmpty`). */
    emptyText: { type: String, default: undefined },
    /** A clear button while something is picked. */
    clearable: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    invalid: { type: Boolean, default: false },
    /** The input's `id`, for a `<label for>`. */
    inputId: { type: String as PropType<string | null>, default: null },
    name: { type: String as PropType<string | null>, default: null },
    /** Names the input when no `<label>` does. */
    ariaLabel: { type: String as PropType<string | null>, default: null },
    /** Extra ids for the input's `aria-describedby`. */
    ariaDescribedby: { type: String as PropType<string | null>, default: null },
    clearLabel: { type: String, default: undefined },
  },
  emits: {
    "update:modelValue": (_value: SoneComboboxValue) => true,
    "update:search": (_search: string) => true,
    "update:open": (_open: boolean) => true,
  },
  setup(props, { emit, expose }) {
    const messages = useSoneMessages();
    const value = useModel<SoneComboboxValue>(
      () => props.modelValue,
      (v) => emit("update:modelValue", v),
    );
    const search = useModel<string>(
      () => props.search,
      (v) => emit("update:search", v),
    );
    const open = useModel<boolean>(
      () => props.open,
      (v) => emit("update:open", v),
    );
    const listId = `sone-combobox-list-${useId()}`;
    const control = ref<HTMLElement | null>(null);
    const input = ref<HTMLInputElement | null>(null);
    const positioner = ref<HTMLElement | null>(null);
    const editing = ref(false);
    const active = ref<string | null>(null);
    const listLabelledBy = ref<string | null>(null);

    const setOpen = (next: boolean): void => {
      if (next !== open.value) open.set(next);
    };
    const popup = createComboboxPopup({
      anchor: () => control.value,
      positioner: () => positioner.value,
      close: () => setOpen(false),
    });

    onMounted(() => {
      listLabelledBy.value = comboboxLabelIds(input.value, listId);
      if (open.value) popup.attached();
      watch(
        open,
        (isOpen) => {
          if (isOpen) {
            popup.attached();
            return;
          }
          popup.detached();
          // Closed: the field shows the picked label again.
          editing.value = false;
          active.value = null;
          if (search.value) search.set("");
        },
        { flush: "post" },
      );
    });
    onBeforeUnmount(popup.detached);

    const all = computed(() => comboboxOptions(props.options));
    const sections = computed(() =>
      filterComboboxItems(
        props.options,
        editing.value && props.shouldFilter ? search.value : "",
        props.filter,
      ),
    );
    const visible = computed(() => sections.value.flatMap((s) => s.options));
    // The list grew or shrank: re-place the popup (it may sit above the field).
    watch(sections, () => open.value && popup.attached(), { flush: "post" });
    const activeOption = computed(() =>
      comboboxActiveOption(visible.value, active.value, value.value),
    );
    const selected = computed(() =>
      comboboxSelectedOptions(props.options, value.value),
    );
    const optionId = (option: SoneComboboxOption): string =>
      comboboxOptionId(
        listId,
        all.value.findIndex((o) => o.value === option.value),
      );

    const commit = (next: SoneComboboxValue): void => value.set(next);
    const choose = (option: SoneComboboxOption): void => {
      if (option.disabled || props.disabled) return;
      commit(comboboxToggle(value.value, option.value, props.multiple));
      active.value = option.value;
      if (props.multiple) {
        if (search.value) search.set("");
        editing.value = false;
      } else setOpen(false);
    };
    const remove = (v: string): void => {
      if (props.disabled) return;
      const current = value.value;
      commit(
        Array.isArray(current)
          ? current.filter((x) => x !== v)
          : current === v
            ? null
            : current,
      );
    };
    const clear = (): void => {
      commit(props.multiple ? [] : null);
      if (search.value) search.set("");
      editing.value = false;
      input.value?.focus();
    };
    const reveal = (): void => void nextTick(popup.revealActive);

    const onKeydown = (event: KeyboardEvent): void => {
      if (event.isComposing || props.disabled) return;
      const isOpen = open.value;
      switch (event.key) {
        case "ArrowDown":
        case "ArrowUp":
          if (!isOpen) {
            event.preventDefault();
            if (!event.altKey && event.key === "ArrowUp") {
              const enabled = visible.value.filter((o) => !o.disabled);
              active.value = enabled[enabled.length - 1]?.value ?? null;
            }
            setOpen(true);
            return;
          }
          break;
        case "Enter": {
          const option = activeOption.value;
          if (!isOpen || !option) return;
          event.preventDefault();
          choose(option);
          return;
        }
        case "Escape":
          if (!isOpen) return;
          // Before an enclosing dialog's own Escape handler: close the innermost layer first.
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          return;
        case "Backspace": {
          const picked = selected.value;
          if (props.multiple && !search.value && picked.length) {
            event.preventDefault();
            remove(picked[picked.length - 1]!.value);
          }
          return;
        }
      }
      if (!isOpen) return;
      const next = comboboxNavigate(
        event.key,
        activeOption.value?.value ?? null,
        visible.value,
        (key, current, count) =>
          listNavigationIndex(key, current, count, { wrap: true }),
      );
      if (next === null) return;
      event.preventDefault();
      active.value = next;
      reveal();
    };

    expose({ clear });

    const iconButton = (
      cls: string,
      icon: "close" | "chevron-down",
      attrs: Record<string, unknown>,
    ) =>
      h(
        "button",
        {
          type: "button",
          class: cls,
          "data-slot": cls,
          tabindex: -1,
          ...attrs,
        },
        h(SoneIcon, { icon }),
      );

    const renderItem = (option: SoneComboboxOption) => {
      const isSelected = isComboboxSelected(value.value, option.value);
      return h(
        "div",
        {
          key: option.value,
          class: "combobox-item",
          "data-slot": "combobox-item",
          role: "option",
          id: optionId(option),
          "aria-selected": isSelected ? "true" : "false",
          "aria-disabled": option.disabled ? "true" : undefined,
          "data-highlighted": flag(activeOption.value?.value === option.value),
          onClick: () => choose(option),
          onPointermove: () => {
            if (!option.disabled) active.value = option.value;
          },
        },
        [
          h("span", { class: "combobox-item-label" }, option.label),
          isSelected
            ? h(
                "span",
                { class: "combobox-item-indicator", "aria-hidden": "true" },
                h(SoneIcon, { icon: "check" }),
              )
            : null,
        ],
      );
    };

    const renderPopup = () => {
      const list = sections.value;
      const has = list.length > 0;
      return h(
        Teleport,
        { to: "body" },
        h(
          "div",
          {
            ref: positioner,
            class: "overlay-positioner",
            "data-slot": "overlay-positioner",
          },
          h(
            "div",
            {
              class: "combobox-content",
              "data-slot": "combobox-content",
              id: listId,
              role: has ? "listbox" : undefined,
              "aria-multiselectable":
                has && props.multiple ? "true" : undefined,
              "aria-labelledby": has
                ? (listLabelledBy.value ?? undefined)
                : undefined,
              "aria-label":
                has && !listLabelledBy.value
                  ? props.ariaLabel || props.placeholder || undefined
                  : undefined,
              onMousedown: (e: MouseEvent) => e.preventDefault(),
            },
            has
              ? list.map((section, i) =>
                  h(
                    "div",
                    {
                      key: section.label ?? `-${i}`,
                      class: "combobox-group",
                      "data-slot": "combobox-group",
                      role: section.label ? "group" : "none",
                      "aria-labelledby": section.label
                        ? `${listId}-group-${i}`
                        : undefined,
                    },
                    [
                      section.label
                        ? h(
                            "div",
                            {
                              class: "combobox-label",
                              "data-slot": "combobox-label",
                              id: `${listId}-group-${i}`,
                            },
                            section.label,
                          )
                        : null,
                      ...section.options.map(renderItem),
                    ],
                  ),
                )
              : h(
                  "div",
                  {
                    class: "combobox-empty",
                    "data-slot": "combobox-empty",
                    role: "status",
                  },
                  props.emptyText ?? messages.value.comboboxEmpty,
                ),
          ),
        ),
      );
    };

    return () => {
      const isOpen = open.value;
      const picked = selected.value;
      const hasValue = picked.length > 0;
      const text =
        editing.value || props.multiple
          ? search.value
          : (picked[0]?.label ?? "");
      const activeId =
        isOpen && activeOption.value ? optionId(activeOption.value) : undefined;
      return h(
        "sone-combobox",
        {
          class: "combobox",
          "data-slot": "combobox",
          "data-multiple": flag(props.multiple),
          "data-disabled": flag(props.disabled),
          "data-invalid": flag(props.invalid),
        },
        [
          h(
            "div",
            {
              ref: control,
              class: "combobox-control",
              "data-slot": "combobox-control",
              onMousedown: (event: MouseEvent) => {
                if (event.target === input.value) return;
                event.preventDefault();
                if (!props.disabled) input.value?.focus();
              },
            },
            [
              ...(props.multiple
                ? picked.map((option) =>
                    h(
                      "span",
                      {
                        key: option.value,
                        class: "combobox-chip",
                        "data-slot": "combobox-chip",
                      },
                      [
                        h(
                          "span",
                          { class: "combobox-chip-label" },
                          option.label,
                        ),
                        props.disabled
                          ? null
                          : iconButton("combobox-chip-remove", "close", {
                              "aria-label": messages.value.tagRemove(
                                option.label,
                              ),
                              onClick: () => remove(option.value),
                            }),
                      ],
                    ),
                  )
                : []),
              h("input", {
                ref: input,
                type: "text",
                class: "combobox-input",
                "data-slot": "combobox-input",
                role: "combobox",
                autocomplete: "off",
                autocorrect: "off",
                spellcheck: "false",
                "aria-autocomplete": "list",
                "aria-haspopup": "listbox",
                "aria-expanded": isOpen ? "true" : "false",
                "aria-controls": isOpen ? listId : undefined,
                "data-state": isOpen ? "open" : "closed",
                value: text,
                placeholder:
                  props.multiple && hasValue ? "" : props.placeholder,
                disabled: props.disabled,
                id: props.inputId ?? undefined,
                name: props.name ?? undefined,
                "aria-label": props.ariaLabel ?? undefined,
                "aria-invalid": props.invalid ? "true" : undefined,
                "aria-describedby": props.ariaDescribedby ?? undefined,
                "aria-activedescendant": activeId,
                onInput: (event: Event) => {
                  search.set((event.target as HTMLInputElement).value);
                  editing.value = true;
                  active.value = null;
                  setOpen(true);
                },
                onClick: () => setOpen(true),
                onKeydown,
                onBlur: () => setOpen(false),
              }),
              props.clearable && hasValue && !props.disabled
                ? iconButton("combobox-clear", "close", {
                    "aria-label":
                      props.clearLabel ?? messages.value.comboboxClear,
                    onClick: clear,
                  })
                : null,
              iconButton("combobox-trigger", "chevron-down", {
                "aria-hidden": "true",
                disabled: props.disabled,
                onClick: () => {
                  if (props.disabled) return;
                  input.value?.focus();
                  setOpen(!open.value);
                },
              }),
            ],
          ),
          isOpen ? renderPopup() : null,
        ],
      );
    };
  },
});
