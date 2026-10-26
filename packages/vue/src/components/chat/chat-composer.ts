import {
  defineComponent,
  h,
  inject,
  provide,
  type InjectionKey,
  type PropType,
} from "vue";

import { useSoneMessages } from "../../composables/messages";
import { definePart } from "../../utils/part";
import { flatten } from "../../utils/vnodes";
import { SoneButton } from "../button/button";
import { SoneInputGroup, SoneInputGroupAddon } from "../input/input-group";
import { SoneSpinner } from "../spinner/spinner";
import { SoneChatAttachment } from "./chat-attachment";

export type ChatComposerLayout = "inline" | "block";

const CHAT_COMPOSER: InjectionKey<() => void> = Symbol("SONE_CHAT_COMPOSER");

/** `[soneChatComposerTools]` — buttons and selects at the start of a `block` composer's footer. */
export const SoneChatComposerTools = definePart({
  name: "SoneChatComposerTools",
  tag: "div",
  slot: "chat-composer-tool",
});

/**
 * `<sone-chat-composer-submit>` — the send button: an arrow, or a spinner while
 * `pending` ("Sending").
 */
export const SoneChatComposerSubmit = defineComponent({
  name: "SoneChatComposerSubmit",
  props: {
    pending: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  setup(props) {
    const messages = useSoneMessages();
    return () =>
      h(
        "sone-chat-composer-submit",
        { "data-slot": "chat-composer-submit" },
        h(
          SoneButton,
          {
            size: "icon-sm",
            type: "submit",
            disabled: props.disabled,
            "aria-label": props.pending
              ? messages.value.chatSending
              : messages.value.chatSend,
          },
          () =>
            props.pending
              ? h(SoneSpinner, { size: 16, label: null })
              : h(
                  "svg",
                  {
                    "data-slot": "chat-send-arrow",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    "aria-hidden": "true",
                  },
                  h("path", {
                    d: "M4 12L20 4l-4 16-4-7-8-1z",
                    fill: "currentColor",
                  }),
                ),
        ),
      );
  },
});

/**
 * `<sone-chat-composer>` — the message box: a form input group around a
 * `SoneChatComposerInput`, with the `SoneChatComposerSubmit` at its end (`inline`) or in a
 * footer under it beside the `SoneChatComposerTools` (`block`). `submitted` fires on
 * Enter or the send button.
 */
export const SoneChatComposer = defineComponent({
  name: "SoneChatComposer",
  props: {
    layout: { type: String as PropType<ChatComposerLayout>, default: "inline" },
  },
  emits: {
    submitted: () => true,
  },
  setup(props, { slots, emit }) {
    provide(CHAT_COMPOSER, () => emit("submitted"));
    const onSubmit = (event: Event): void => {
      event.preventDefault();
      emit("submitted");
    };
    return () => {
      const nodes = flatten(slots.default?.());
      const submit = nodes.filter((n) => n.type === SoneChatComposerSubmit);
      const tools = nodes.filter((n) => n.type === SoneChatComposerTools);
      const attachments = nodes.filter((n) => n.type === SoneChatAttachment);
      const field = nodes.filter(
        (n) =>
          n.type !== SoneChatComposerSubmit &&
          n.type !== SoneChatComposerTools &&
          n.type !== SoneChatAttachment,
      );
      return h(
        "sone-chat-composer",
        { "data-slot": "chat-composer", "data-layout": props.layout },
        h(SoneInputGroup, { as: "form", onSubmit }, () => [
          h("div", { "data-slot": "chat-composer-attachments" }, attachments),
          ...field,
          props.layout === "block"
            ? h(
                SoneInputGroupAddon,
                { align: "block-end", "data-chat-composer-footer": "" },
                () => [
                  h("div", { "data-slot": "chat-composer-tools" }, tools),
                  ...submit,
                ],
              )
            : h(
                SoneInputGroupAddon,
                { as: "span", align: "inline-end" },
                () => submit,
              ),
        ]),
      );
    };
  },
});

/**
 * The composer's `<textarea>` (`textarea[soneChatComposerInput]`, `v-model`-able):
 * Enter sends, Shift+Enter breaks the line. `draftInput` reports every edit.
 */
export const SoneChatComposerInput = defineComponent({
  name: "SoneChatComposerInput",
  props: {
    modelValue: { type: String, default: undefined },
  },
  emits: {
    "update:modelValue": (value: string) => typeof value === "string",
    draftInput: (value: string) => typeof value === "string",
  },
  setup(props, { emit }) {
    const submit = inject(CHAT_COMPOSER, null);
    const onInput = (event: Event): void => {
      const value = (event.target as HTMLTextAreaElement).value;
      emit("update:modelValue", value);
      emit("draftInput", value);
    };
    const onKeydown = (event: KeyboardEvent): void => {
      if (event.key !== "Enter" || event.shiftKey) return;
      event.preventDefault();
      if (submit) submit();
      else (event.target as HTMLTextAreaElement).form?.requestSubmit();
    };
    return () =>
      h("textarea", {
        "data-slot": "input-group-control",
        ...(props.modelValue !== undefined && { value: props.modelValue }),
        onInput,
        onKeydown,
      });
  },
});
