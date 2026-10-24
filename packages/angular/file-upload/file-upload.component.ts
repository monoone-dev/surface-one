import { isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  PLATFORM_ID,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { SoneValueAccessor, soneId } from "@surface-one/angular/core";
import { SoneIconComponent } from "@surface-one/angular/icon";

import {
  addFiles,
  formatFileSize,
  isImageFile,
  type FileRejection,
} from "./file-upload-rules";

const optionalNumber = (v: unknown): number | null =>
  v === null || v === undefined || v === "" ? null : numberAttribute(v, 0);

/** One row of the file list. */
interface FileRow {
  readonly file: File;
  readonly size: string;
  readonly preview: string | null;
}

/**
 * `<sone-file-upload>` — a dropzone around the native `<input type="file">` (Nuxt UI
 * FileUpload): click, Enter / Space or a drop add files, checked against `accept`,
 * `maxSize` and `maxFiles` (a polite alert names what was turned away), listed with
 * their size, an image preview and a remove button. `[(value)]` is a `File[]` (also
 * `ngModel` / `formControl`), mirrored into the input so a native form submits it too.
 * Inside a `[soneField]` the field names and describes the input.
 */
@Component({
  selector: "sone-file-upload",
  imports: [SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./file-upload.component.html",
  styleUrl: "./file-upload.component.scss",
  host: {
    "data-slot": "file-upload",
    "[attr.data-disabled]": "isDisabled() ? '' : null",
    "[attr.data-invalid]": "invalid() ? '' : null",
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SoneFileUploadComponent),
      multi: true,
    },
  ],
})
export class SoneFileUploadComponent extends SoneValueAccessor<File[]> {
  /** The files — `[(value)]`. */
  readonly value = model<File[]>([]);
  /** The native `accept` list: `image/*`, `.pdf,.docx`, `application/json`. */
  readonly accept = input<string | null>(null);
  /** More than one file; without it a new file replaces the current one. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** The largest file, in bytes. */
  readonly maxSize = input<number | null, unknown>(null, {
    transform: optionalNumber,
  });
  /** The most files (with `multiple`). */
  readonly maxFiles = input<number | null, unknown>(null, {
    transform: optionalNumber,
  });
  /** Show image files as thumbnails in the list. */
  readonly preview = input(true, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** A failed check: `aria-invalid` and the destructive dropzone border. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** The input's id (a `soneFieldLabel for` points at it); generated when left out. */
  readonly inputId = input<string | null>(null);
  readonly name = input<string | null>(null);
  /** The dropzone's text, which also names the input. */
  readonly label = input($localize`Drop files here or click to browse`);
  /** A quieter line under it: the accepted types and the size limit. */
  readonly description = input<string | null>(null);
  /** The file list's accessible name. */
  readonly listLabel = input(
    $localize`:A file upload's list of files:Selected files`,
  );
  readonly removeLabel = input<(name: string) => string>(
    (name) => $localize`:Remove a file from an upload:Remove ${name}:name:`,
  );
  /** What the alert says about a file that was turned away. */
  readonly rejectionLabel = input<(rejection: FileRejection<File>) => string>(
    (r) => this.defaultRejection(r),
  );
  /** The locale file sizes are written in. */
  readonly locale = input("en");

  /** Files that were turned away by the last pick or drop. */
  readonly rejected = output<FileRejection<File>[]>();

  protected readonly id = computed(() => this.inputId() ?? this.generatedId);
  private readonly generatedId = soneId("sone-file-upload");
  protected readonly descriptionId = `${this.generatedId}-description`;
  protected readonly dragging = signal(false);
  protected readonly messages = signal<string[]>([]);
  private readonly input =
    viewChild.required<ElementRef<HTMLInputElement>>("input");
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly injector = inject(Injector);
  private readonly host =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly previews = new Map<File, string>();
  private dragDepth = 0;

  protected readonly rows = computed<FileRow[]>(() =>
    this.value().map((file) => ({
      file,
      size: formatFileSize(file.size, this.locale()),
      preview: this.previewOf(file),
    })),
  );

  constructor() {
    super();
    // Mirror the value into the native input, so a plain form post carries the files.
    effect(() => {
      const files = this.value();
      if (!this.browser) return;
      this.mirror(files);
      this.revokeExcept(files);
    });
    inject(DestroyRef).onDestroy(() => this.revokeExcept([]));
  }

  protected disabledByComponent(): boolean {
    return this.disabled();
  }

  writeValue(v: unknown): void {
    this.value.set(Array.isArray(v) ? (v as File[]) : []);
  }

  /** Opens the system file picker. */
  browse(): void {
    if (!this.isDisabled()) this.input().nativeElement.click();
  }

  /** Removes the file at `index` (focus moves to the next remove button, else the input). */
  remove(index: number): void {
    if (this.isDisabled()) return;
    const next = this.value().filter((_, i) => i !== index);
    this.commit(next);
    this.messages.set([]);
    afterNextRender(
      () => {
        const buttons = this.host.querySelectorAll<HTMLButtonElement>(
          '[data-slot="file-upload-remove"]',
        );
        const target =
          buttons[Math.min(index, buttons.length - 1)] ??
          this.input().nativeElement;
        target.focus();
      },
      { injector: this.injector },
    );
  }

  protected onChange$(event: Event): void {
    const el = event.target as HTMLInputElement;
    // The input now holds only the picked files: compare against the model, not it.
    this.add(Array.from(el.files ?? []));
  }

  protected onDragEnter(event: DragEvent): void {
    if (this.isDisabled() || !this.hasFiles(event)) return;
    event.preventDefault();
    this.dragDepth++;
    this.dragging.set(true);
  }

  protected onDragOver(event: DragEvent): void {
    if (!this.hasFiles(event)) return;
    // Always take the drop, so a disabled zone never lets the browser open the file.
    event.preventDefault();
    if (event.dataTransfer)
      event.dataTransfer.dropEffect = this.isDisabled() ? "none" : "copy";
  }

  protected onDragLeave(): void {
    this.dragDepth = Math.max(0, this.dragDepth - 1);
    if (!this.dragDepth) this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    this.dragDepth = 0;
    this.dragging.set(false);
    event.preventDefault();
    if (this.isDisabled()) return;
    this.add(Array.from(event.dataTransfer?.files ?? []));
  }

  protected onBlur(): void {
    this.onTouched();
  }

  protected describedBy(): string | null {
    return this.description() ? this.descriptionId : null;
  }

  private add(files: File[]): void {
    if (!files.length) {
      // A cancelled picker clears the native input: put the value back.
      this.mirror(this.value());
      return;
    }
    const { value, rejected } = addFiles(this.value(), files, {
      accept: this.accept(),
      maxSize: this.maxSize(),
      maxFiles: this.maxFiles(),
      multiple: this.multiple(),
    });
    this.messages.set(rejected.map((r) => this.rejectionLabel()(r)));
    if (rejected.length) this.rejected.emit(rejected);
    this.commit(value);
    this.mirror(value);
  }

  private commit(files: File[]): void {
    this.value.set(files);
    this.onChange(files);
  }

  private hasFiles(event: DragEvent): boolean {
    return Array.from(event.dataTransfer?.types ?? []).includes("Files");
  }

  private mirror(files: readonly File[]): void {
    const el = this.input().nativeElement;
    try {
      const transfer = new DataTransfer();
      for (const file of files) transfer.items.add(file);
      el.files = transfer.files;
    } catch {
      // No DataTransfer constructor (an old browser, a test DOM): the model still holds them.
      if (!files.length) el.value = "";
    }
  }

  private previewOf(file: File): string | null {
    if (!this.preview() || !this.browser || !isImageFile(file)) return null;
    let url = this.previews.get(file);
    if (!url && typeof URL.createObjectURL === "function") {
      url = URL.createObjectURL(file);
      this.previews.set(file, url);
    }
    return url ?? null;
  }

  private revokeExcept(files: readonly File[]): void {
    for (const [file, url] of this.previews) {
      if (files.includes(file)) continue;
      URL.revokeObjectURL(url);
      this.previews.delete(file);
    }
  }

  private defaultRejection(r: FileRejection<File>): string {
    const name = r.file.name;
    if (r.reason === "type") {
      return $localize`:A file upload rejected a file type:${name}:name: is not an accepted file type.`;
    }
    if (r.reason === "size") {
      const max = formatFileSize(this.maxSize() ?? 0, this.locale());
      return $localize`:A file upload rejected a file too large:${name}:name: is larger than ${max}:max:.`;
    }
    const most = this.multiple() ? (this.maxFiles() ?? 1) : 1;
    return most === 1
      ? $localize`:A file upload takes one file:Only one file can be added.`
      : $localize`:A file upload takes at most N files:Only ${most}:count: files can be added.`;
  }
}
