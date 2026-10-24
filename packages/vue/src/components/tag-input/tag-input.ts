import { computed, defineComponent, h, ref, useId, type PropType } from "vue";

import {
  addTags,
  hiddenTagCount,
  splitTagDraft,
  tagDraftAfter,
  visibleTags,
  type SoneTagRejection,
} from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { useModel } from "../../utils/model";
import { SoneBadge, SoneBadgeRemove, type BadgeVariant } from "../badge/badge";
import { SoneIcon } from "../icon/icon";

export type { SoneTagRejection, TagRejectReason } from "@surface-one/core";

/**
 * `<sone-tag-input>` — tags as removable chips, `v-model` (a `string[]`). Enter or a
 * comma adds the typed tag (a pasted "a, b, c" adds three), Backspace in the empty field
 * removes the last one. Duplicates are refused case-insensitively; refused text stays in
 * the field and `rejected` says why. The exposed `focus()` focuses the field.
 */
export const SoneTagInput = defineComponent({
  name: "SoneTagInput",
  props: {
    modelValue: {
      type: Array as PropType<readonly string[]>,
      default: () => [],
    },
    placeholder: { type: String, default: "" },
    /** The text field's accessible name (default: the "Add tag" message; `null` for none). */
    ariaLabel: { type: String as PropType<string | null>, default: undefined },
    inputId: { type: String as PropType<string | null>, default: null },
    /** At most this many tags; further ones are rejected with reason `max`. */
    max: { type: Number as PropType<number | null>, default: null },
    /** Show this many chips and a "+N more" toggle for the rest. */
    maxVisible: { type: Number as PropType<number | null>, default: null },
    /** Offered while typing (a native `<datalist>`). */
    suggestions: {
      type: Array as PropType<readonly string[]>,
      default: () => [],
    },
    /** Return `false` to refuse a tag (reason `invalid`). */
    validate: {
      type: Function as PropType<((tag: string) => boolean) | null>,
      default: null,
    },
    /** The chips' badge variant. */
    variant: { type: String as PropType<BadgeVariant>, default: "secondary" },
    disabled: { type: Boolean, default: false },
    invalid: { type: Boolean, default: false },
  },
  emits: {
    "update:modelValue": (_value: string[]) => true,
    added: (_tag: string) => true,
    removed: (_tag: string) => true,
    rejected: (_rejection: SoneTagRejection) => true,
    blur: (_event: FocusEvent) => true,
  },
  setup(props, { emit, expose }) {
    const messages = useSoneMessages();
    const value = useModel<readonly string[]>(
      () => props.modelValue,
      (v) => emit("update:modelValue", [...v]),
    );
    const listId = `sone-tag-input-list-${useId()}`;
    const draft = ref("");
    const expanded = ref(false);
    const focused = ref(false);
    const announcement = ref("");
    const field = ref<HTMLInputElement | null>(null);
    const focus = (): void => field.value?.focus();
    expose({ focus });

    const hiddenCount = computed(() =>
      hiddenTagCount(value.value.length, props.maxVisible),
    );
    const shown = computed(() =>
      visibleTags(value.value, props.maxVisible, expanded.value),
    );

    const setDraft = (text: string): void => {
      draft.value = text;
      if (field.value && field.value.value !== text) field.value.value = text;
    };

    /** Adds the parts it accepts and returns the ones it refuses (left in the field). */
    const addAll = (parts: readonly string[]): SoneTagRejection[] => {
      const { next, accepted, rejected } = addTags(value.value, parts, {
        max: props.max,
        validate: props.validate,
      });
      for (const r of rejected) emit("rejected", r);
      if (accepted.length) {
        value.set(next);
        for (const tag of accepted) emit("added", tag);
        announcement.value = messages.value.tagsAdded(accepted.join(", "));
      }
      return rejected;
    };

    const commit = (): void => {
      if (!draft.value.trim()) return;
      setDraft(tagDraftAfter(addAll(draft.value.split(","))));
    };

    const remove = (tag: string, refocus = true): void => {
      if (props.disabled) return;
      const next = value.value.filter((t) => t !== tag);
      if (next.length === value.value.length) return;
      value.set(next);
      emit("removed", tag);
      announcement.value = messages.value.tagRemoved(tag);
      if (refocus) focus();
    };

    const onInput = (e: Event): void => {
      const text = (e.target as HTMLInputElement).value;
      const split = splitTagDraft(text);
      if (!split) {
        draft.value = text;
        return;
      }
      setDraft(tagDraftAfter(addAll(split.parts), split.rest));
    };

    const onKeydown = (e: KeyboardEvent): void => {
      if (e.isComposing) return;
      if (e.key === "Enter" || e.key === ",") {
        if (e.key === "," || draft.value.trim()) e.preventDefault();
        commit();
      } else if (
        e.key === "Backspace" &&
        draft.value === "" &&
        value.value.length > 0
      ) {
        e.preventDefault();
        remove(value.value[value.value.length - 1]!, false);
      }
    };

    const focusFromFrame = (e: MouseEvent): void => {
      const target = e.target as Element | null;
      if (target?.closest("button, a, input, select, textarea")) return;
      if (!props.disabled) focus();
    };

    return () => {
      const m = messages.value;
      const ariaLabel =
        props.ariaLabel === undefined ? m.tagAdd : props.ariaLabel;
      const hidden = hiddenCount.value;
      return h(
        "sone-tag-input",
        {
          "data-slot": "tag-input",
          "data-invalid": props.invalid ? "true" : undefined,
          "data-disabled": props.disabled ? "true" : undefined,
          "data-focused": focused.value ? "" : undefined,
          onClick: focusFromFrame,
        },
        [
          value.value.length > 0
            ? h(
                "ul",
                {
                  class: "tag-input-list",
                  "data-slot": "tag-input-list",
                  "aria-label": m.tagList,
                },
                [
                  ...shown.value.map((tag) =>
                    h(
                      SoneBadge,
                      {
                        key: tag,
                        as: "li",
                        class: "tag-input-tag",
                        variant: props.variant,
                      },
                      () => [
                        h("span", { class: "badge-label" }, tag),
                        props.disabled
                          ? null
                          : h(
                              SoneBadgeRemove,
                              {
                                "aria-label": m.tagRemove(tag),
                                onClick: () => remove(tag),
                              },
                              () => h(SoneIcon, { icon: "close" }),
                            ),
                      ],
                    ),
                  ),
                  hidden > 0
                    ? h("li", { key: "__more", class: "tag-input-more" }, [
                        h(
                          SoneBadge,
                          {
                            as: "button",
                            variant: "outline",
                            type: "button",
                            "data-slot": "tag-input-more",
                            "aria-expanded": expanded.value ? "true" : "false",
                            onClick: () => (expanded.value = !expanded.value),
                          },
                          () =>
                            expanded.value ? m.tagShowLess : m.tagMore(hidden),
                        ),
                      ])
                    : null,
                ],
              )
            : null,
          h("input", {
            ref: field,
            type: "text",
            class: "tag-input-field",
            "data-slot": "tag-input-input",
            autocomplete: "off",
            autocapitalize: "off",
            spellcheck: "false",
            enterkeyhint: "enter",
            value: draft.value,
            placeholder: props.placeholder,
            disabled: props.disabled,
            id: props.inputId ?? undefined,
            list: props.suggestions.length ? listId : undefined,
            "aria-label": ariaLabel ?? undefined,
            "aria-invalid": props.invalid ? "true" : undefined,
            onInput,
            onKeydown,
            onFocus: () => (focused.value = true),
            onBlur: (e: FocusEvent) => {
              focused.value = false;
              emit("blur", e);
            },
          }),
          props.suggestions.length
            ? h(
                "datalist",
                { id: listId },
                props.suggestions.map((s) => h("option", { key: s, value: s })),
              )
            : null,
          h(
            "span",
            { class: "sr-only", "aria-live": "polite", "aria-atomic": "true" },
            announcement.value,
          ),
        ],
      );
    };
  },
});
