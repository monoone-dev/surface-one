import { defineComponent, h } from "vue";

/** `<sone-kbd>` — a keyboard key. */
export const SoneKbd = defineComponent({
  name: "SoneKbd",
  setup(_, { slots }) {
    return () =>
      h("sone-kbd", { "data-slot": "kbd" }, h("kbd", slots.default?.()));
  },
});

/** `<sone-kbd-group>` — keys pressed together (`⌘` `K`). */
export const SoneKbdGroup = defineComponent({
  name: "SoneKbdGroup",
  setup(_, { slots }) {
    return () =>
      h(
        "sone-kbd-group",
        { "data-slot": "kbd-group" },
        h("kbd", slots.default?.()),
      );
  },
});
