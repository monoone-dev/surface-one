"use client";

import {
  createElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type DragEvent,
  type ReactElement,
} from "react";

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
import { useControllable } from "@surface-one/core/react/controllable";

import { useSoneMessages } from "../../context/messages";
import { mergeRefs } from "../../utils/refs";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";

export type { ImagePickerValue } from "@surface-one/core";

export interface SoneImagePickerProps extends Omit<
  ComponentPropsWithRef<"input">,
  "value" | "defaultValue" | "type" | "accept" | "multiple" | "children"
> {
  /** The picked `File` or the URL of a stored image (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: ImagePickerValue;
  readonly defaultValue?: ImagePickerValue;
  /** A pick, or `null` once the image is removed. */
  readonly onValueChange?: (value: ImagePickerValue) => void;
  /** A file `accept` or `maxSize` turned away. */
  readonly onRejected?: (rejected: FileRejection<File>[]) => void;
  /** The native `accept` list. */
  readonly accept?: string;
  /** The largest file, in bytes. */
  readonly maxSize?: number | null;
  /** A failed check: `aria-invalid` and the destructive border. */
  readonly invalid?: boolean;
  /** The input's id (a field label points at it); generated when left out. */
  readonly inputId?: string | null;
  /** Width over height: a number (`1`) or a CSS ratio (`"4 / 3"`). */
  readonly aspectRatio?: number | string;
  /** The preview's alternative text (empty: decorative). */
  readonly alt?: string;
  /** Shown in the empty field; it names the input (default: the message). */
  readonly label?: string | null;
  readonly changeLabel?: string | null;
  readonly removeLabel?: string | null;
  /** Shown when the image fails to load (default: the message). */
  readonly errorLabel?: string | null;
  /** The locale the size limit is written in. */
  readonly locale?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
}

/**
 * `<sone-image-picker>` — the React twin: a tappable image field over a native
 * `<input type="file" accept="image/*">` (a click, Enter / Space or a drop pick an
 * image), then the preview with change and remove buttons. `value` / `defaultValue` /
 * `onValueChange` hold the picked `File` or the URL of a stored image; a `File` is
 * mirrored into the input for a native form post and its preview's object URL is
 * revoked as soon as it goes. `className` / `style` style the host; every other prop
 * (`ref` too) goes to the input.
 */
export function SoneImagePicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  onRejected,
  accept = "image/*",
  maxSize = null,
  disabled = false,
  invalid = false,
  inputId,
  name,
  aspectRatio = "16 / 9",
  alt = "",
  label,
  changeLabel,
  removeLabel,
  errorLabel,
  locale = "en",
  className,
  style,
  onChange,
  ref,
  id: idProp,
  ...control
}: SoneImagePickerProps): ReactElement {
  const messages = useSoneMessages();
  const [value, setValue] = useControllable<ImagePickerValue>(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const uid = `sone-image-picker-${useId()}`;
  const id = inputId ?? idProp ?? uid;
  const input = useRef<HTMLInputElement | null>(null);
  const inputRef = useMemo(() => mergeRefs(input, ref), [ref]);
  const host = useRef<HTMLElement | null>(null);
  const depth = useRef(0);
  const focusNext = useRef<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);
  const [broken, setBroken] = useState<string | null>(null);
  const [preview] = useState(createImagePreview);
  const [fileSrc, setFileSrc] = useState<string | null>(null);

  // The object URL is made (and the last one revoked) in an effect, never while rendering.
  useEffect(() => {
    setFileSrc(isImagePickerFile(value) ? preview.src(value) : null);
    if (!isImagePickerFile(value)) preview.clear();
    mirrorFilesToInput(input.current, isImagePickerFile(value) ? [value] : []);
  }, [value, preview]);
  useEffect(() => preview.clear, [preview]);
  useEffect(() => {
    const slot = focusNext.current;
    if (!slot) return;
    // The preview's object URL arrives a render later: wait for the button to be there.
    const target = host.current?.querySelector<HTMLElement>(
      `[data-slot="${slot}"]:not([hidden])`,
    );
    if (!target) return;
    focusNext.current = null;
    target.focus();
  });

  const src =
    typeof value === "string" && value
      ? value
      : isImagePickerFile(value)
        ? fileSrc
        : null;

  const pick = (files: File[]): void => {
    if (!files.length) {
      // A cancelled picker clears the native input: put the value back.
      mirrorFilesToInput(
        input.current,
        isImagePickerFile(value) ? [value] : [],
      );
      return;
    }
    const rules = { accept, maxSize };
    const result = addFiles([], files.slice(0, 1), rules);
    if (result.rejected.length) {
      setAlert(
        fileRejectionMessage(result.rejected[0]!, rules, messages, locale),
      );
      onRejected?.(result.rejected);
      mirrorFilesToInput(
        input.current,
        isImagePickerFile(value) ? [value] : [],
      );
      return;
    }
    setAlert(null);
    if (!src) focusNext.current = "image-picker-change";
    setValue(result.value[0] ?? null);
  };

  const browse = (): void => {
    if (!disabled) input.current?.click();
  };
  const remove = (): void => {
    if (disabled) return;
    focusNext.current = "image-picker-input";
    setAlert(null);
    setValue(null);
  };

  const icon = (
    <span className="image-picker-icon" aria-hidden="true">
      <SoneIcon icon="image" />
    </span>
  );
  return createElement(
    "sone-image-picker",
    {
      ref: host,
      className,
      style,
      "data-slot": "image-picker",
      "data-empty": src ? undefined : "",
      "data-disabled": disabled ? "" : undefined,
      "data-invalid": invalid ? "" : undefined,
    },
    <div
      className="image-picker-box"
      data-slot="image-picker-box"
      style={{ aspectRatio: imagePickerRatio(aspectRatio) ?? undefined }}
      data-dragging={dragging ? "" : undefined}
      onDragEnter={(e: DragEvent) => {
        if (disabled || !dragHasFiles(e)) return;
        e.preventDefault();
        depth.current++;
        setDragging(true);
      }}
      onDragOver={(e: DragEvent) => {
        if (!dragHasFiles(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = disabled ? "none" : "copy";
      }}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1);
        if (!depth.current) setDragging(false);
      }}
      onDrop={(e: DragEvent) => {
        depth.current = 0;
        setDragging(false);
        e.preventDefault();
        if (disabled) return;
        pick(Array.from(e.dataTransfer?.files ?? []));
      }}
    >
      <input
        {...control}
        ref={inputRef}
        type="file"
        className="image-picker-input"
        data-slot="image-picker-input"
        id={id}
        name={name ?? undefined}
        accept={accept}
        disabled={disabled}
        hidden={!!src}
        aria-invalid={invalid ? "true" : control["aria-invalid"]}
        onChange={(e) => {
          onChange?.(e);
          pick(Array.from(e.target.files ?? []));
        }}
      />
      {src ? (
        <>
          {broken !== src ? (
            <img
              className="image-picker-image"
              data-slot="image-picker-image"
              src={src}
              alt={alt}
              onError={() => setBroken(src)}
            />
          ) : (
            <span
              className="image-picker-placeholder"
              data-slot="image-picker-error"
            >
              {icon}
              <span>{errorLabel ?? messages.imagePickerError}</span>
            </span>
          )}
          <div className="image-picker-actions">
            <SoneButton
              variant="secondary"
              size="icon-sm"
              type="button"
              data-slot="image-picker-change"
              disabled={disabled}
              aria-label={changeLabel ?? messages.imagePickerChange}
              onClick={browse}
            >
              <SoneIcon icon="edit" />
            </SoneButton>
            <SoneButton
              variant="secondary"
              size="icon-sm"
              type="button"
              data-slot="image-picker-remove"
              disabled={disabled}
              aria-label={removeLabel ?? messages.imagePickerRemove}
              onClick={remove}
            >
              <SoneIcon icon="close" />
            </SoneButton>
          </div>
        </>
      ) : (
        <span className="image-picker-placeholder">
          {icon}
          <label className="image-picker-label" htmlFor={id}>
            {label ?? messages.imagePickerLabel}
          </label>
        </span>
      )}
    </div>,
    alert ? (
      <p
        className="image-picker-alert"
        data-slot="image-picker-alert"
        role="alert"
      >
        {alert}
      </p>
    ) : null,
  );
}
