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
  createFilePreviews,
  dragHasFiles,
  fileRejectionMessage,
  formatFileSize,
  isImageFile,
  mirrorFilesToInput,
  type FileRejection,
} from "@surface-one/core";

import { useControllable } from "@surface-one/core/react/controllable";
import { useSoneMessages } from "../../context/messages";
import { mergeRefs } from "../../utils/refs";
import { SoneIcon } from "../icon/icon";

const UPLOAD_ICON = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 15V3M7 8l5-5 5 5M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  </svg>
);

export interface SoneFileUploadProps extends Omit<
  ComponentPropsWithRef<"input">,
  "value" | "defaultValue" | "type" | "accept" | "multiple" | "children"
> {
  /** The files (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: File[];
  readonly defaultValue?: File[];
  readonly onValueChange?: (files: File[]) => void;
  /** Files that were turned away by the last pick or drop. */
  readonly onRejected?: (rejected: FileRejection<File>[]) => void;
  /** The native `accept` list: `image/*`, `.pdf,.docx`, `application/json`. */
  readonly accept?: string | null;
  /** More than one file; without it a new file replaces the current one. */
  readonly multiple?: boolean;
  /** The largest file, in bytes. */
  readonly maxSize?: number | null;
  /** The most files (with `multiple`). */
  readonly maxFiles?: number | null;
  /** Show image files as thumbnails in the list. */
  readonly preview?: boolean;
  /** A failed check: `aria-invalid` and the destructive dropzone border. */
  readonly invalid?: boolean;
  /** The input's id (a field label points at it); generated when left out. */
  readonly inputId?: string | null;
  /** The dropzone's text, which also names the input (default: the message). */
  readonly label?: string | null;
  /** A quieter line under it: the accepted types and the size limit. */
  readonly description?: string | null;
  /** The file list's accessible name (default: the message). */
  readonly listLabel?: string | null;
  readonly removeLabel?: ((name: string) => string) | null;
  /** What the alert says about a file that was turned away. */
  readonly rejectionLabel?: ((rejection: FileRejection<File>) => string) | null;
  /** The locale file sizes are written in. */
  readonly locale?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
}

const NO_FILES: File[] = [];

/**
 * `<sone-file-upload>` — the React twin: a dropzone around the native
 * `<input type="file">` (Nuxt UI FileUpload). A click, Enter / Space or a drop add
 * files, checked against `accept`, `maxSize` and `maxFiles` (an alert names what was
 * turned away, `onRejected` lists it); the list shows each file with its size, an
 * image preview and a remove button. `value` / `defaultValue` / `onValueChange` hold a
 * `File[]`, mirrored into the input so a native form posts it. `className` / `style`
 * style the host; every other prop (`ref` too) goes to the input.
 */
export function SoneFileUpload({
  value: valueProp,
  defaultValue = NO_FILES,
  onValueChange,
  onRejected,
  accept = null,
  multiple = false,
  maxSize = null,
  maxFiles = null,
  preview = true,
  disabled = false,
  invalid = false,
  inputId,
  name,
  label,
  description,
  listLabel,
  removeLabel,
  rejectionLabel,
  locale = "en",
  className,
  style,
  onChange,
  ref,
  id: idProp,
  ...control
}: SoneFileUploadProps): ReactElement {
  const messages = useSoneMessages();
  const [files, setFiles] = useControllable(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const uid = `sone-file-upload-${useId()}`;
  const id = inputId ?? idProp ?? uid;
  const descriptionId = `${uid}-description`;
  const input = useRef<HTMLInputElement | null>(null);
  const inputRef = useMemo(() => mergeRefs(input, ref), [ref]);
  const host = useRef<HTMLElement | null>(null);
  const depth = useRef(0);
  const focusAfterRemove = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [previews] = useState(createFilePreviews);
  const rules = { accept, maxSize, maxFiles, multiple };

  useEffect(() => {
    previews.keep(files);
    mirrorFilesToInput(input.current, files);
  }, [files, previews]);
  useEffect(() => previews.clear, [previews]);
  useEffect(() => {
    const index = focusAfterRemove.current;
    if (index === null) return;
    focusAfterRemove.current = null;
    const buttons = host.current?.querySelectorAll<HTMLButtonElement>(
      '[data-slot="file-upload-remove"]',
    );
    const target =
      buttons?.[Math.min(index, buttons.length - 1)] ?? input.current;
    target?.focus();
  });

  const add = (picked: File[]): void => {
    if (!picked.length) {
      // A cancelled picker clears the native input: put the value back.
      mirrorFilesToInput(input.current, files);
      return;
    }
    const result = addFiles(files, picked, rules);
    setAlerts(
      result.rejected.map((r) =>
        rejectionLabel
          ? rejectionLabel(r)
          : fileRejectionMessage(r, rules, messages, locale),
      ),
    );
    if (result.rejected.length) onRejected?.(result.rejected);
    setFiles(result.value);
    mirrorFilesToInput(input.current, result.value);
  };

  const remove = (index: number): void => {
    if (disabled) return;
    focusAfterRemove.current = index;
    setFiles(files.filter((_, i) => i !== index));
    setAlerts([]);
  };

  const removeName = removeLabel ?? messages.fileUploadRemove;
  return createElement(
    "sone-file-upload",
    {
      ref: host,
      className,
      style,
      "data-slot": "file-upload",
      "data-disabled": disabled ? "" : undefined,
      "data-invalid": invalid ? "" : undefined,
    },
    <div
      className="file-upload-dropzone"
      data-slot="file-upload-dropzone"
      data-dragging={dragging ? "" : undefined}
      onDragEnter={(e: DragEvent) => {
        if (disabled || !dragHasFiles(e)) return;
        e.preventDefault();
        depth.current++;
        setDragging(true);
      }}
      onDragOver={(e: DragEvent) => {
        if (!dragHasFiles(e)) return;
        // Always take the drop, so a disabled zone never lets the browser open the file.
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
        add(Array.from(e.dataTransfer?.files ?? []));
      }}
    >
      <input
        {...control}
        ref={inputRef}
        type="file"
        className="file-upload-input"
        data-slot="file-upload-input"
        id={id}
        name={name ?? undefined}
        accept={accept ?? undefined}
        multiple={multiple}
        disabled={disabled}
        aria-invalid={invalid ? "true" : control["aria-invalid"]}
        aria-describedby={
          description ? descriptionId : control["aria-describedby"]
        }
        onChange={(e) => {
          onChange?.(e);
          add(Array.from(e.target.files ?? []));
        }}
      />
      <span className="file-upload-icon" aria-hidden="true">
        {UPLOAD_ICON}
      </span>
      <label className="file-upload-label" htmlFor={id}>
        {label ?? messages.fileUploadLabel}
      </label>
      {description ? (
        <span className="file-upload-description" id={descriptionId}>
          {description}
        </span>
      ) : null}
    </div>,
    alerts.length ? (
      <div
        className="file-upload-errors"
        data-slot="file-upload-errors"
        role="alert"
      >
        {alerts.map((m, i) => (
          <p key={i}>{m}</p>
        ))}
      </div>
    ) : null,
    files.length ? (
      <ul
        className="file-upload-list"
        data-slot="file-upload-list"
        aria-label={listLabel ?? messages.fileUploadList}
      >
        {files.map((file, i) => {
          const url = preview && isImageFile(file) ? previews.get(file) : null;
          return (
            <li
              key={`${file.name}-${file.size}-${file.lastModified}-${i}`}
              className="file-upload-item"
              data-slot="file-upload-item"
            >
              {url ? (
                <img className="file-upload-preview" src={url} alt="" />
              ) : (
                <span className="file-upload-file" aria-hidden="true">
                  <SoneIcon icon="document" />
                </span>
              )}
              <span className="file-upload-meta">
                <span className="file-upload-name">{file.name}</span>
                <span className="file-upload-size">
                  {formatFileSize(file.size, locale)}
                </span>
              </span>
              <button
                type="button"
                className="file-upload-remove"
                data-slot="file-upload-remove"
                disabled={disabled}
                aria-label={removeName(file.name)}
                onClick={() => remove(i)}
              >
                <SoneIcon icon="close" />
              </button>
            </li>
          );
        })}
      </ul>
    ) : null,
  );
}
