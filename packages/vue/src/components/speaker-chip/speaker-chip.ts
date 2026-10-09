import { computed, defineComponent, h, type PropType } from "vue";

import { useSoneMessages } from "../../composables/messages";
import {
  speakerInitials,
  speakerNumber,
  speakerTone,
} from "../../utils/format";
import { SoneAvatar, SoneAvatarFallback } from "../avatar";

export type SpeakerChipSize = "sm" | "default";

/**
 * `<sone-speaker-chip>` — initials in a tone-coloured avatar plus the speaker's
 * name, from one key: `me` → Me, `others` → Others, `others-N` → Speaker N+1,
 * `speaker-N` → Speaker N (names from the messages); an unknown key shows as it is.
 */
export const SoneSpeakerChip = defineComponent({
  name: "SoneSpeakerChip",
  props: {
    speaker: { type: String as PropType<string | null>, default: null },
    label: { type: String as PropType<string | null>, default: null },
    size: { type: String as PropType<SpeakerChipSize>, default: "default" },
  },
  setup(props) {
    const messages = useSoneMessages();
    const name = computed(() => {
      const override = props.label?.trim();
      if (override) return override;
      const key = props.speaker;
      if (key === "me") return messages.value.speakerMe;
      if (key === "others") return messages.value.speakerOthers;
      const n = speakerNumber(key);
      return n === null
        ? (key ?? "").trim()
        : messages.value.speakerNumbered(n);
    });
    const tone = computed(() => speakerTone(props.speaker));
    return () =>
      h(
        "sone-speaker-chip",
        {
          "data-slot": "speaker-chip",
          "data-tone": tone.value ?? undefined,
          "data-size": props.size,
        },
        name.value
          ? [
              h(
                SoneAvatar,
                {
                  class: "speaker-chip-avatar",
                  "aria-hidden": "true",
                  size: "sm",
                  "data-tone": tone.value ?? undefined,
                },
                () =>
                  h(SoneAvatarFallback, null, () =>
                    speakerInitials(name.value),
                  ),
              ),
              h(
                "span",
                {
                  class: "speaker-chip-label",
                  "data-slot": "speaker-chip-label",
                },
                name.value,
              ),
            ]
          : [],
      );
  },
});
