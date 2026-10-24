import {
  computed,
  defineComponent,
  h,
  onMounted,
  ref,
  type PropType,
} from "vue";

import { renderBlocks, type MarkdownLabels } from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";

export type SoneMarkdownSize = "default" | "sm";

/**
 * `<sone-markdown>` — read-only markdown, rendered block by block and sanitized with
 * DOMPurify (`marked` and `dompurify` are optional peer dependencies). Untrusted input is
 * fine: raw HTML is escaped, links open in a new tab, images render only from inline
 * `data:` URLs. Without a DOM there is no sanitizer, so the server renders the empty host
 * and the browser fills it in once mounted.
 */
export const SoneMarkdown = defineComponent({
  name: "SoneMarkdown",
  props: {
    /** The markdown to show. */
    source: { type: String as PropType<string | null>, default: "" },
    /** `sm` for denser surfaces such as side panels. */
    size: { type: String as PropType<SoneMarkdownSize>, default: "default" },
    /** Single newlines become line breaks (GitHub comments style). */
    breaks: { type: Boolean, default: true },
  },
  setup(props) {
    const messages = useSoneMessages();
    const mounted = ref(false);
    onMounted(() => {
      mounted.value = true;
    });
    const labels = computed<MarkdownLabels>(() => ({
      image: messages.value.markdownImage,
      imageBlocked: messages.value.markdownImageBlocked,
      task: messages.value.markdownTask,
    }));
    // A fresh cache whenever the labels change: the cached HTML has them baked in.
    const cache = computed(() => {
      void labels.value;
      return new Map<string, string>();
    });
    const blocks = computed(() =>
      mounted.value
        ? renderBlocks(
            props.source ?? "",
            { breaks: props.breaks, labels: labels.value },
            cache.value,
          )
        : [],
    );
    return () =>
      h(
        "sone-markdown",
        { class: "markdown", "data-slot": "markdown", "data-size": props.size },
        blocks.value.map((block) =>
          h("div", {
            key: block.key,
            class: "markdown-block",
            innerHTML: block.html,
          }),
        ),
      );
  },
});
