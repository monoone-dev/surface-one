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
  createFilePreviews,
  dragHasFiles,
  fileRejectionMessage,
  formatFileSize,
  isImageFile,
  mirrorFilesToInput,
  type FileRejection,
} from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { useModel } from "../../utils/model";
import { splitAttrs } from "../../utils/part";
import { SoneIcon } from "../icon/icon";

const UPLOAD_ICON = () =>
  h(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    h("path", {
      d: "M12 15V3M7 8l5-5 5 5M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
    }),
  );

/**
 * `<sone-file-upload>` — the Vue twin: a dropzone around the native
 * `<input type="file">` (Nuxt UI FileUpload). A click, Enter / Space or a drop add
 * files, checked against `accept`, `maxSize` and `maxFiles` (an alert names what was
 * turned away, `@rejected` lists it); the list shows each file with its size, an image
 * preview and a remove button. `v-model` is a `File[]`, mirrored into the input so a
 * native form posts it. Class and style go to the host, other attributes to the input.
 */
export const SoneFileUpload = defineComponent({
  name: "SoneFileUpload",
  inheritAttrs: false,
  props: {
    /** The files — `v-model`. */
    modelValue: { type: Array as PropType<File[]>, default: () => [] },
    /** The native `accept` list: `image/*`, `.pdf,.docx`, `application/json`. */
    accept: { type: String as PropType<string | null>, default: null },
    /** More than one file; without it a new file replaces the current one. */
    multiple: { type: Boolean, default: false },
    /** The largest file, in bytes. */
    maxSize: { type: Number as PropType<number | null>, default: null },
    /** The most files (with `multiple`). */
    maxFiles: { type: Number as PropType<number | null>, default: null },
    /** Show image files as thumbnails in the list. */
    preview: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    /** A failed check: `aria-invalid` and the destructive dropzone border. */
    invalid: { type: Boolean, default: false },
    /** The input's id (a field label points at it); generated when left out. */
    inputId: { type: String as PropType<string | null>, default: null },
    name: { type: String as PropType<string | null>, default: null },
    /** The dropzone's text, which also names the input (default: the message). */
    label: { type: String as PropType<string | null>, default: null },
    /** A quieter line under it: the accepted types and the size limit. */
    description: { type: String as PropType<string | null>, default: null },
    /** The file list's accessible name (default: the message). */
    listLabel: { type: String as PropType<string | null>, default: null },
    removeLabel: {
      type: Function as PropType<((name: string) => string) | null>,
      default: null,
    },
    /** What the alert says about a file that was turned away. */
    rejectionLabel: {
      type: Function as PropType<
        ((rejection: FileRejection<File>) => string) | null
      >,
      default: null,
    },
    /** The locale file sizes are written in. */
    locale: { type: String, default: "en" },
  },
  emits: {
    "update:modelValue": (_files: File[]) => true,
    rejected: (_rejected: FileRejection<File>[]) => true,
  },
  setup(props, { attrs, emit, expose }) {
    const messages = useSoneMessages();
    const value = useModel(
      () => props.modelValue,
      (v) => emit("update:modelValue", v),
    );
    const uid = `sone-file-upload-${useId()}`;
    const id = computed(() => props.inputId ?? uid);
    const descriptionId = `${uid}-description`;
    const input = ref<HTMLInputElement | null>(null);
    const host = ref<HTMLElement | null>(null);
    const dragging = ref(false);
    const alerts = ref<string[]>([]);
    const previews = createFilePreviews();
    let depth = 0;
    let mounted = false;

    const rules = () => ({
      accept: props.accept,
      maxSize: props.maxSize,
      maxFiles: props.maxFiles,
      multiple: props.multiple,
    });

    onMounted(() => {
      mounted = true;
      mirrorFilesToInput(input.value, value.value);
    });
    watch(value, (files) => {
      previews.keep(files);
      if (mounted) mirrorFilesToInput(input.value, files);
    });
    onBeforeUnmount(previews.clear);

    const add = (files: File[]): void => {
      if (!files.length) {
        // A cancelled picker clears the native input: put the value back.
        mirrorFilesToInput(input.value, value.value);
        return;
      }
      const result = addFiles(value.value, files, rules());
      alerts.value = result.rejected.map((r) =>
        props.rejectionLabel
          ? props.rejectionLabel(r)
          : fileRejectionMessage(r, rules(), messages.value, props.locale),
      );
      if (result.rejected.length) emit("rejected", result.rejected);
      value.set(result.value);
      mirrorFilesToInput(input.value, result.value);
    };

    const remove = (index: number): void => {
      if (props.disabled) return;
      value.set(value.value.filter((_, i) => i !== index));
      alerts.value = [];
      void nextTick(() => {
        const buttons = host.value?.querySelectorAll<HTMLButtonElement>(
          '[data-slot="file-upload-remove"]',
        );
        const target =
          buttons?.[Math.min(index, buttons.length - 1)] ?? input.value;
        target?.focus();
      });
    };

    expose({
      /** Opens the system file picker. */
      browse: () => {
        if (!props.disabled) input.value?.click();
      },
      remove,
    });

    return () => {
      const { host: hostAttrs, control } = splitAttrs(attrs);
      const remove$ = props.removeLabel ?? messages.value.fileUploadRemove;
      const files = value.value;
      return h(
        "sone-file-upload",
        {
          ...hostAttrs,
          ref: host,
          "data-slot": "file-upload",
          "data-disabled": props.disabled ? "" : undefined,
          "data-invalid": props.invalid ? "" : undefined,
        },
        [
          h(
            "div",
            {
              class: "file-upload-dropzone",
              "data-slot": "file-upload-dropzone",
              "data-dragging": dragging.value ? "" : undefined,
              onDragenter: (e: DragEvent) => {
                if (props.disabled || !dragHasFiles(e)) return;
                e.preventDefault();
                depth++;
                dragging.value = true;
              },
              onDragover: (e: DragEvent) => {
                if (!dragHasFiles(e)) return;
                // Always take the drop, so a disabled zone never lets the browser open the file.
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
                add(Array.from(e.dataTransfer?.files ?? []));
              },
            },
            [
              h("input", {
                ...control,
                ref: input,
                type: "file",
                class: "file-upload-input",
                "data-slot": "file-upload-input",
                id: id.value,
                name: props.name ?? undefined,
                accept: props.accept ?? undefined,
                multiple: props.multiple,
                disabled: props.disabled,
                "aria-invalid": props.invalid ? "true" : undefined,
                "aria-describedby": props.description
                  ? descriptionId
                  : undefined,
                onChange: (e: Event) =>
                  add(Array.from((e.target as HTMLInputElement).files ?? [])),
              }),
              h(
                "span",
                { class: "file-upload-icon", "aria-hidden": "true" },
                UPLOAD_ICON(),
              ),
              h(
                "label",
                { class: "file-upload-label", for: id.value },
                props.label ?? messages.value.fileUploadLabel,
              ),
              props.description
                ? h(
                    "span",
                    { class: "file-upload-description", id: descriptionId },
                    props.description,
                  )
                : null,
            ],
          ),
          alerts.value.length
            ? h(
                "div",
                {
                  class: "file-upload-errors",
                  "data-slot": "file-upload-errors",
                  role: "alert",
                },
                alerts.value.map((m) => h("p", m)),
              )
            : null,
          files.length
            ? h(
                "ul",
                {
                  class: "file-upload-list",
                  "data-slot": "file-upload-list",
                  "aria-label":
                    props.listLabel ?? messages.value.fileUploadList,
                },
                files.map((file, i) => {
                  const url =
                    props.preview && isImageFile(file)
                      ? previews.get(file)
                      : null;
                  return h(
                    "li",
                    {
                      class: "file-upload-item",
                      "data-slot": "file-upload-item",
                    },
                    [
                      url
                        ? h("img", {
                            class: "file-upload-preview",
                            src: url,
                            alt: "",
                          })
                        : h(
                            "span",
                            {
                              class: "file-upload-file",
                              "aria-hidden": "true",
                            },
                            h(SoneIcon, { icon: "document" }),
                          ),
                      h("span", { class: "file-upload-meta" }, [
                        h("span", { class: "file-upload-name" }, file.name),
                        h(
                          "span",
                          { class: "file-upload-size" },
                          formatFileSize(file.size, props.locale),
                        ),
                      ]),
                      h(
                        "button",
                        {
                          type: "button",
                          class: "file-upload-remove",
                          "data-slot": "file-upload-remove",
                          disabled: props.disabled,
                          "aria-label": remove$(file.name),
                          onClick: () => remove(i),
                        },
                        h(SoneIcon, { icon: "close" }),
                      ),
                    ],
                  );
                }),
              )
            : null,
        ],
      );
    };
  },
});
