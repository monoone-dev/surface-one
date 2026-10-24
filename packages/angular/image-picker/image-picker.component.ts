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
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneValueAccessor, soneId } from "@surface-one/angular/core";
import {
  addFiles,
  formatFileSize,
  type FileRejection,
} from "@surface-one/angular/file-upload";
import { SoneIconComponent } from "@surface-one/angular/icon";

import {
  createImagePreview,
  imagePickerRatio,
  isImagePickerFile,
  type ImagePickerValue,
} from "./image-picker-value";

const optionalNumber = (v: unknown): number | null =>
  v === null || v === undefined || v === "" ? null : numberAttribute(v, 0);

/**
 * `<sone-image-picker>` — a tappable image field (the web twin of the React Native
 * `SoneImagePicker`): a dashed placeholder over a native `<input type="file"
 * accept="image/*">` (a click, Enter / Space or a drop pick an image), then the preview
 * with change and remove buttons. `[(value)]` is the picked `File` or the URL of an image
 * that is already stored (also `ngModel` / `formControl`); a `File` is mirrored into the
 * input, so a native form posts it, and its preview's object URL is revoked as soon as it
 * goes. A file `accept` or `maxSize` turns away is announced and emitted as `(rejected)`.
 */
@Component({
  selector: "sone-image-picker",
  imports: [SoneButtonDirective, SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./image-picker.component.html",
  styleUrl: "./image-picker.component.scss",
  host: {
    "data-slot": "image-picker",
    "[attr.data-empty]": "src() ? null : ''",
    "[attr.data-disabled]": "isDisabled() ? '' : null",
    "[attr.data-invalid]": "invalid() ? '' : null",
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SoneImagePickerComponent),
      multi: true,
    },
  ],
})
export class SoneImagePickerComponent extends SoneValueAccessor<ImagePickerValue> {
  /** The picked `File`, or the URL of a stored image — `[(value)]`. */
  readonly value = model<ImagePickerValue>(null);
  /** The native `accept` list. */
  readonly accept = input("image/*");
  /** The largest file, in bytes. */
  readonly maxSize = input<number | null, unknown>(null, {
    transform: optionalNumber,
  });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** A failed check: `aria-invalid` and the destructive border. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** The input's id (a `soneFieldLabel for` points at it); generated when left out. */
  readonly inputId = input<string | null>(null);
  readonly name = input<string | null>(null);
  /** Width over height: a number (`1`) or a CSS ratio (`"4 / 3"`). */
  readonly aspectRatio = input<number | string>("16 / 9");
  /** The preview's alternative text (empty: decorative). */
  readonly alt = input("");
  /** Shown in the empty field; it names the input. */
  readonly label = input($localize`:An empty image picker:Add image`);
  /** The name of the button that replaces the image. */
  readonly changeLabel = input(
    $localize`:Replaces a picked image:Change image`,
  );
  /** The name of the button that removes the image. */
  readonly removeLabel = input($localize`:Removes a picked image:Remove image`);
  /** Shown when the image fails to load. */
  readonly errorLabel = input(
    $localize`:A picked image that does not load:Image unavailable`,
  );
  /** The locale the size limit is written in. */
  readonly locale = input("en");

  /** A file `accept` or `maxSize` turned away. */
  readonly rejected = output<FileRejection<File>[]>();

  protected readonly id = computed(() => this.inputId() ?? this.generatedId);
  private readonly generatedId = soneId("sone-image-picker");
  protected readonly ratio = computed(() =>
    imagePickerRatio(this.aspectRatio()),
  );
  protected readonly dragging = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly broken = signal<string | null>(null);
  private readonly input =
    viewChild.required<ElementRef<HTMLInputElement>>("input");
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly injector = inject(Injector);
  private readonly host =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly preview = createImagePreview();
  private dragDepth = 0;

  /** The preview's `src`: the URL, or the picked file's object URL. */
  protected readonly src = computed(() => {
    const value = this.value();
    if (!this.browser) return typeof value === "string" && value ? value : null;
    return this.preview.src(value);
  });

  constructor() {
    super();
    // Mirror a picked file into the native input, so a plain form post carries it.
    effect(() => {
      const value = this.value();
      if (this.browser) this.mirror(value);
    });
    inject(DestroyRef).onDestroy(() => this.preview.clear());
  }

  protected disabledByComponent(): boolean {
    return this.disabled();
  }

  writeValue(v: unknown): void {
    this.value.set(
      isImagePickerFile(v as ImagePickerValue) || typeof v === "string"
        ? (v as ImagePickerValue)
        : null,
    );
  }

  /** Opens the system file picker. */
  browse(): void {
    if (!this.isDisabled()) this.input().nativeElement.click();
  }

  /** Removes the image; focus moves to the (now empty) field. */
  remove(): void {
    if (this.isDisabled()) return;
    this.commit(null);
    this.message.set(null);
    this.focusAfterRender("input");
  }

  protected onChange$(event: Event): void {
    this.pick(Array.from((event.target as HTMLInputElement).files ?? []));
  }

  protected onDragEnter(event: DragEvent): void {
    if (this.isDisabled() || !this.hasFiles(event)) return;
    event.preventDefault();
    this.dragDepth++;
    this.dragging.set(true);
  }

  protected onDragOver(event: DragEvent): void {
    if (!this.hasFiles(event)) return;
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
    this.pick(Array.from(event.dataTransfer?.files ?? []));
  }

  protected onBlur(): void {
    this.onTouched();
  }

  private pick(files: File[]): void {
    if (!files.length) {
      // A cancelled picker clears the native input: put the value back.
      this.mirror(this.value());
      return;
    }
    const { value, rejected } = addFiles([], files.slice(0, 1), {
      accept: this.accept(),
      maxSize: this.maxSize(),
    });
    if (rejected.length) {
      this.message.set(this.rejection(rejected[0]!));
      this.rejected.emit(rejected);
      this.mirror(this.value());
      return;
    }
    this.message.set(null);
    const wasEmpty = !this.src();
    this.commit(value[0] ?? null);
    if (wasEmpty) this.focusAfterRender("change");
  }

  private commit(value: ImagePickerValue): void {
    this.value.set(value);
    this.onChange(value);
  }

  private focusAfterRender(target: "input" | "change"): void {
    afterNextRender(
      () => {
        const el =
          target === "input"
            ? this.input().nativeElement
            : this.host.querySelector<HTMLElement>(
                '[data-slot="image-picker-change"]',
              );
        el?.focus();
      },
      { injector: this.injector },
    );
  }

  private hasFiles(event: DragEvent): boolean {
    return Array.from(event.dataTransfer?.types ?? []).includes("Files");
  }

  private mirror(value: ImagePickerValue): void {
    const el = this.input().nativeElement;
    try {
      const transfer = new DataTransfer();
      if (isImagePickerFile(value)) transfer.items.add(value);
      el.files = transfer.files;
    } catch {
      // No DataTransfer constructor (an old browser, a test DOM): the model still holds it.
      if (!isImagePickerFile(value)) el.value = "";
    }
  }

  private rejection(r: FileRejection<File>): string {
    const name = r.file.name;
    if (r.reason === "size") {
      const max = formatFileSize(this.maxSize() ?? 0, this.locale());
      return $localize`:A file upload rejected a file too large:${name}:name: is larger than ${max}:max:.`;
    }
    return $localize`:A file upload rejected a file type:${name}:name: is not an accepted file type.`;
  }
}
