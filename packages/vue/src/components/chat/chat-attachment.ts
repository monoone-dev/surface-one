import { defineComponent, h, type PropType } from "vue";

import { useSoneMessages } from "../../composables/messages";
import { SoneIcon } from "../icon/icon";

/**
 * `<sone-chat-attachment>` — a linked or uploaded item in the composer: a grey card with a mark
 * (the default slot), the `title` and its `url`, and — when `removable` — a small round remove
 * button (“Remove {title}”) that emits `remove`. Put it inside `SoneChatComposer`.
 */
export const SoneChatAttachment = defineComponent({
  name: "SoneChatAttachment",
  props: {
    /** What it is: a page title, a file name. */
    title: { type: String, default: "" },
    /** Where it is (or its size), under the title. */
    url: { type: String as PropType<string | null>, default: null },
    /** Shows the remove button. */
    removable: { type: Boolean, default: false },
  },
  emits: {
    /** The remove button was pressed. */
    remove: () => true,
  },
  setup(props, { slots, emit }) {
    const messages = useSoneMessages();
    return () =>
      h("sone-chat-attachment", { "data-slot": "chat-attachment" }, [
        h("span", { "data-slot": "chat-attachment-mark" }, slots.default?.()),
        h("span", { "data-slot": "chat-attachment-text" }, [
          h("span", { "data-slot": "chat-attachment-title" }, props.title),
          props.url
            ? h("span", { "data-slot": "chat-attachment-url" }, props.url)
            : null,
        ]),
        props.removable
          ? h(
              "button",
              {
                type: "button",
                "data-slot": "chat-attachment-remove",
                "aria-label": messages.value.chatAttachmentRemove(props.title),
                onClick: () => emit("remove"),
              },
              h(SoneIcon, { icon: "close" }),
            )
          : null,
      ]);
  },
});
