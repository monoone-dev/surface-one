import {
  computed,
  defineComponent,
  h,
  ref,
  useId,
  watchEffect,
  type PropType,
} from "vue";

import { useSoneMessages } from "../../composables/messages";
import { SoneBadge } from "../badge/badge";
import { SoneButton } from "../button/button";
import {
  SoneField,
  SoneFieldDescription,
  SoneFieldError,
} from "../input/field";
import { SoneInputGroup, SoneInputGroupAddon } from "../input/input-group";

export type SecretFieldState = "unknown" | "set" | "unset";

/**
 * `<sone-secret-field>` — a write-only secret (an API key, a token): a status badge
 * (`hasKey`: `true` set, `false` not set, `null` unknown and hidden), a password field
 * and a Save button that emits `save` with the typed value, plus a Clear button
 * (`clearable`, while a key is set) that emits `clear`. The field empties once the save
 * settles — when `busy` is off again with no `error`. Never log or store the value
 * outside secure storage.
 */
export const SoneSecretField = defineComponent({
  name: "SoneSecretField",
  props: {
    hasKey: {
      type: Boolean as PropType<boolean | null>,
      default: null,
    },
    busy: { type: Boolean, default: false },
    error: { type: String as PropType<string | null>, default: null },
    /** The status label and the field's default name (default: the "Status" message). */
    label: { type: String as PropType<string | null>, default: null },
    placeholder: { type: String, default: "" },
    ariaLabel: { type: String as PropType<string | null>, default: null },
    help: { type: String as PropType<string | null>, default: null },
    /** Default: the "Key set ✓" message. */
    setLabel: { type: String as PropType<string | null>, default: null },
    /** Default: the "Not set" message. */
    unsetLabel: { type: String as PropType<string | null>, default: null },
    /** Default: the "Save key" message. */
    saveLabel: { type: String as PropType<string | null>, default: null },
    autocomplete: { type: String, default: "off" },
    clearable: { type: Boolean, default: false },
  },
  emits: {
    /** The typed secret; the owner must not log or store it outside secure storage. */
    save: (_value: string) => true,
    clear: () => true,
  },
  setup(props, { emit }) {
    const messages = useSoneMessages();
    const inputId = `sone-secret-field-${useId()}`;
    const draft = ref("");
    const pending = ref(false);
    const canSave = computed(() => !props.busy && draft.value.trim() !== "");
    const state = computed<SecretFieldState>(() =>
      props.hasKey === null ? "unknown" : props.hasKey ? "set" : "unset",
    );

    // State-based, not edge-based, as in the Angular twin: a save that settles at once
    // flips `busy` on and off before anything reads it.
    watchEffect(() => {
      if (!pending.value || props.busy) return;
      pending.value = false;
      if (!props.error) draft.value = "";
    });

    const submit = (): void => {
      if (!canSave.value) return;
      pending.value = true;
      emit("save", draft.value);
    };

    return () => {
      const m = messages.value;
      const label = props.label ?? m.secretStatus;
      return h(
        "sone-secret-field",
        { "data-slot": "secret-field", "data-state": state.value },
        h(SoneField, { invalid: !!props.error }, () => [
          props.hasKey !== null
            ? h(
                "div",
                { class: "status", "data-slot": "secret-field-status" },
                [
                  h("span", { class: "text-secondary" }, label),
                  props.hasKey
                    ? h(SoneBadge, { variant: "success" }, () => [
                        h("span", { class: "badge-dot" }),
                        props.setLabel ?? m.secretSet,
                      ])
                    : h(SoneBadge, { variant: "outline" }, () => [
                        h("span", { class: "badge-dot" }),
                        props.unsetLabel ?? m.secretUnset,
                      ]),
                ],
              )
            : null,
          h(SoneInputGroup, { disabled: props.busy }, () => [
            h("input", {
              "data-slot": "input-group-control",
              type: "password",
              id: inputId,
              value: draft.value,
              placeholder: props.placeholder,
              disabled: props.busy,
              "aria-label": props.ariaLabel ?? label,
              autocomplete: props.autocomplete,
              spellcheck: "false",
              onInput: (e: Event) =>
                (draft.value = (e.target as HTMLInputElement).value),
            }),
            h(SoneInputGroupAddon, { as: "span", align: "inline-end" }, () => [
              h(
                SoneButton,
                {
                  variant: "ghost",
                  size: "xs",
                  type: "button",
                  disabled: !canSave.value,
                  onClick: submit,
                },
                () =>
                  props.busy
                    ? m.secretSaving
                    : (props.saveLabel ?? m.secretSave),
              ),
              props.clearable && props.hasKey
                ? h(
                    SoneButton,
                    {
                      variant: "ghost",
                      size: "xs",
                      type: "button",
                      disabled: props.busy,
                      onClick: () => emit("clear"),
                    },
                    () => m.secretClear,
                  )
                : null,
            ]),
          ]),
          props.help ? h(SoneFieldDescription, null, () => props.help) : null,
          props.error ? h(SoneFieldError, null, () => props.error) : null,
        ]),
      );
    };
  },
});
