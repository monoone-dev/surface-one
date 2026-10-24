import {
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
  addFiles,
  createImagePreview,
  dragHasFiles,
  fileRejectionMessage,
  imagePickerRatio,
  isImagePickerFile,
  mirrorFilesToInput,
  type FileRejection,
  type ImagePickerValue,
} from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { useModel } from "../../utils/model";
import { splitAttrs } from "../../utils/part";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";

export type { ImagePickerValue } from "@surface-one/core";

/**
 * `<sone-image-picker>` — the Vue twin: a tappable image field over a native
 * `<input type="file" accept="image/*">` (a click, Enter / Space or a drop pick an
 * image), then the preview with change and remove buttons. `v-model` is the picked
 * `File` or the URL of a stored image; a `File` is mirrored into the input for a native
 * form post and its preview's object URL is revoked as soon as it goes. A file `accept`
 * or `maxSize` turns away is announced and emitted as `rejected`. Class and style go to
 * the host, other attributes to the input.
 */
export const SoneImagePicker = defineComponent({
  name: "SoneImagePicker",
  inheritAttrs: false,
  props: {
    /** The picked `File`, or the URL of a stored image — `v-model`. */
    modelValue: {
      type: null as unknown as PropType<ImagePickerValue>,
      default: null,
    },
    /** The native `accept` list. */
    accept: { type: String, default: "image/*" },
    /** The largest file, in bytes. */
    maxSize: { type: Number as PropType<number | null>, default: null },
    disabled: { type: Boolean, default: false },
    /** A failed check: `aria-invalid` and the destructive border. */
    invalid: { type: Boolean, default: false },
    /** The input's id (a field label points at it); generated when left out. */
    inputId: { type: String as PropType<string | null>, default: null },
    name: { type: String as PropType<string | null>, default: null },
    /** Width over height: a number (`1`) or a CSS ratio (`"4 / 3"`). */
    aspectRatio: {
      type: [Number, String] as PropType<number | string>,
      default: "16 / 9",
    },
    /** The preview's alternative text (empty: decorative). */
    alt: { type: String, default: "" },
    /** Shown in the empty field; it names the input (default: the message). */
    label: { type: String as PropType<string | null>, default: null },
    changeLabel: { type: String as PropType<string | null>, default: null },
    removeLabel: { type: String as PropType<string | null>, default: null },
    /** Shown when the image fails to load (default: the message). */
    errorLabel: { type: String as PropType<string | null>, default: null },
    /** The locale the size limit is written in. */
    locale: { type: String, default: "en" },
  },
  emits: {
    "update:modelValue": (_value: ImagePickerValue) => true,
    rejected: (_rejected: FileRejection<File>[]) => true,
  },
  setup(props, { attrs, emit, expose }) {
    const messages = useSoneMessages();
    const value = useModel(
      () => props.modelValue,
      (v) => emit("update:modelValue", v),
    );
    // useId, not a module counter: the server and the client must agree on the ids.
    const uid = `sone-image-picker-${useId()}`;
    const id = computed(() => props.inputId ?? uid);
    const input = ref<HTMLInputElement | null>(null);
    const host = ref<HTMLElement | null>(null);
    const dragging = ref(false);
    const alert = ref<string | null>(null);
    const broken = ref<string | null>(null);
    const preview = createImagePreview();
    const mounted = ref(false);
    let depth = 0;

    const src = computed(() => {
      const v = value.value;
      if (!mounted.value) return typeof v === "string" && v ? v : null;
      return preview.src(v);
    });
    const mirror = (v: ImagePickerValue): void =>
      mirrorFilesToInput(input.value, isImagePickerFile(v) ? [v] : []);

    onMounted(() => {
      mounted.value = true;
      mirror(value.value);
    });
    watch(value, (v) => {
      if (mounted.value) mirror(v);
    });
    onBeforeUnmount(preview.clear);

    const focus = (slot: "image-picker-input" | "image-picker-change") =>
      void nextTick(() =>
        host.value
          ?.querySelector<HTMLElement>(`[data-slot="${slot}"]`)
          ?.focus(),
      );

    const pick = (files: File[]): void => {
      if (!files.length) {
        // A cancelled picker clears the native input: put the value back.
        mirror(value.value);
        return;
      }
      const rules = { accept: props.accept, maxSize: props.maxSize };
      const result = addFiles([], files.slice(0, 1), rules);
      if (result.rejected.length) {
        alert.value = fileRejectionMessage(
          result.rejected[0]!,
          rules,
          messages.value,
          props.locale,
        );
        emit("rejected", result.rejected);
        mirror(value.value);
        return;
      }
      alert.value = null;
      const wasEmpty = !src.value;
      value.set(result.value[0] ?? null);
      if (wasEmpty) focus("image-picker-change");
    };

    const browse = (): void => {
      if (!props.disabled) input.value?.click();
    };
    const remove = (): void => {
      if (props.disabled) return;
      value.set(null);
      alert.value = null;
      focus("image-picker-input");
    };
    expose({ browse, remove });

    return () => {
      const { host: hostAttrs, control } = splitAttrs(attrs);
      const source = src.value;
      const m = messages.value;
      const icon = () =>
        h(
          "span",
          { class: "image-picker-icon", "aria-hidden": "true" },
          h(SoneIcon, { icon: "image" }),
        );
      const action = (
        slot: string,
        label: string,
        glyph: "edit" | "close",
        onClick: () => void,
      ) =>
        h(
          SoneButton,
          {
            variant: "secondary",
            size: "icon-sm",
            type: "button",
            "data-slot": slot,
            disabled: props.disabled,
            "aria-label": label,
            onClick,
          },
          () => h(SoneIcon, { icon: glyph }),
        );
      return h(
        "sone-image-picker",
        {
          ...hostAttrs,
          ref: host,
          "data-slot": "image-picker",
          "data-empty": source ? undefined : "",
          "data-disabled": props.disabled ? "" : undefined,
          "data-invalid": props.invalid ? "" : undefined,
        },
        [
          h(
            "div",
            {
              class: "image-picker-box",
              "data-slot": "image-picker-box",
              style: { "aspect-ratio": imagePickerRatio(props.aspectRatio) },
              "data-dragging": dragging.value ? "" : undefined,
              onDragenter: (e: DragEvent) => {
                if (props.disabled || !dragHasFiles(e)) return;
                e.preventDefault();
                depth++;
                dragging.value = true;
              },
              onDragover: (e: DragEvent) => {
                if (!dragHasFiles(e)) return;
                e.preventDefault();
                if (e.dataTransfer)
                  e.dataTransfer.dropEffect = props.disabled ? "none" : "copy";
              },
              onDragleave: () => {
                depth = Math.max(0, depth - 1);
                if (!depth) dragging.value = false;
              },
              onDrop: (e: DragEvent) => {
                depth = 0;
                dragging.value = false;
                e.preventDefault();
                if (props.disabled) return;
                pick(Array.from(e.dataTransfer?.files ?? []));
              },
            },
            [
              h("input", {
                ...control,
                ref: input,
                type: "file",
                class: "image-picker-input",
                "data-slot": "image-picker-input",
                id: id.value,
                name: props.name ?? undefined,
                accept: props.accept,
                disabled: props.disabled,
                hidden: !!source,
                "aria-invalid": props.invalid ? "true" : undefined,
                onChange: (e: Event) =>
                  pick(Array.from((e.target as HTMLInputElement).files ?? [])),
              }),
              ...(source
                ? [
                    broken.value !== source
                      ? h("img", {
                          class: "image-picker-image",
                          "data-slot": "image-picker-image",
                          src: source,
                          alt: props.alt,
                          onError: () => (broken.value = source),
                        })
                      : h(
                          "span",
                          {
                            class: "image-picker-placeholder",
                            "data-slot": "image-picker-error",
                          },
                          [
                            icon(),
                            h("span", props.errorLabel ?? m.imagePickerError),
                          ],
                        ),
                    h("div", { class: "image-picker-actions" }, [
                      action(
                        "image-picker-change",
                        props.changeLabel ?? m.imagePickerChange,
                        "edit",
                        browse,
                      ),
                      action(
                        "image-picker-remove",
                        props.removeLabel ?? m.imagePickerRemove,
                        "close",
                        remove,
                      ),
                    ]),
                  ]
                : [
                    h("span", { class: "image-picker-placeholder" }, [
                      icon(),
                      h(
                        "label",
                        { class: "image-picker-label", for: id.value },
                        props.label ?? m.imagePickerLabel,
                      ),
                    ]),
                  ]),
            ],
          ),
          alert.value
            ? h(
                "p",
                {
                  class: "image-picker-alert",
                  "data-slot": "image-picker-alert",
                  role: "alert",
                },
                alert.value,
              )
            : null,
        ],
      );
    };
  },
});
