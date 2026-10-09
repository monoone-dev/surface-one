import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { SoneClockPipe, clockTime } from "@surface-one/angular/core";
import { plural } from "@surface-one/angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneButtonGroupDirective } from "@surface-one/angular/button";

@Component({
  selector: "sone-audio-player",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneClockPipe, SoneButtonDirective, SoneButtonGroupDirective],
  host: {
    "data-slot": "audio-player",
    "[attr.data-state]": 'playing() ? "playing" : "paused"',
  },
  templateUrl: "./audio-player.component.html",
  styleUrl: "./audio-player.component.scss",
})
export class SoneAudioPlayerComponent {
  readonly src = input<string | null>(null);
  readonly skipSeconds = input(15);
  readonly keyStepSeconds = input(5);
  readonly rates = input<readonly number[]>([1, 1.25, 1.5, 2]);

  readonly timeUpdate = output<number>();
  readonly durationChange = output<number>();
  readonly playingChange = output<boolean>();
  readonly userSeek = output<number>();
  readonly playbackEnd = output<void>();

  private readonly audio = viewChild<ElementRef<HTMLAudioElement>>("audio");

  readonly currentTime = signal(0);
  readonly duration = signal(0);
  readonly playing = signal(false);
  readonly rate = signal<number | null>(null);

  protected readonly activeRate = computed(
    () => this.rate() ?? this.rates()[0] ?? 1,
  );
  protected readonly rateLabel = computed(() => String(this.activeRate()));

  protected readonly progressPct = computed(() => {
    const dur = this.duration();
    return dur > 0 ? Math.min(100, (this.currentTime() / dur) * 100) : 0;
  });
  protected readonly valueMax = computed(() => Math.round(this.duration()));
  protected readonly valueNow = computed(() => Math.round(this.currentTime()));
  protected readonly valueText = computed(
    () =>
      $localize`${clockTime(this.currentTime())}:position: of ${clockTime(this.duration())}:duration:`,
  );
  protected readonly playLabel = computed(() =>
    this.playing() ? $localize`Pause` : $localize`Play`,
  );
  protected readonly backLabel = computed(() =>
    plural(
      this.skipSeconds(),
      $localize`{seconds, plural, other {Back # seconds}}`,
    ),
  );
  protected readonly forwardLabel = computed(() =>
    plural(
      this.skipSeconds(),
      $localize`{seconds, plural, other {Forward # seconds}}`,
    ),
  );

  private get el(): HTMLAudioElement | null {
    return this.audio()?.nativeElement ?? null;
  }

  togglePlay(): void {
    const el = this.el;
    if (!el) {
      return;
    }
    if (el.paused) {
      void el.play();
    } else {
      el.pause();
    }
  }

  pause(): void {
    this.el?.pause();
  }

  /**
   * Moves the playhead to `seconds` and (by default) starts playing; pass
   * `{ play: false }` to only move it. `false` when nothing is loaded.
   */
  seekTo(seconds: number, opts: { play?: boolean } = {}): boolean {
    const el = this.el;
    if (!el) {
      return false;
    }
    el.currentTime = seconds;
    this.setTime(seconds);
    if (opts.play ?? true) {
      void el.play();
    }
    return true;
  }

  stopAndUnload(): void {
    const el = this.el;
    if (!el) {
      return;
    }
    el.pause();
    el.removeAttribute("src");
    el.load();
    this.setPlaying(false);
    this.setTime(0);
  }

  protected skip(delta: number): void {
    const el = this.el;
    const dur = this.duration();
    if (!el || dur <= 0) {
      return;
    }
    this.userMove(el, Math.min(dur, Math.max(0, el.currentTime + delta)));
  }

  protected cycleRate(): void {
    const steps = this.rates();
    if (steps.length === 0) {
      return;
    }
    const i = steps.indexOf(this.activeRate());
    const next = steps[(i + 1) % steps.length];
    this.rate.set(next);
    const el = this.el;
    if (el) {
      el.playbackRate = next;
    }
  }

  protected onLoaded(): void {
    const el = this.el;
    if (!el) {
      return;
    }
    if (Number.isFinite(el.duration)) {
      this.duration.set(el.duration);
      this.durationChange.emit(el.duration);
    }
    el.playbackRate = this.activeRate();
  }

  protected onTimeUpdate(): void {
    const el = this.el;
    if (el) {
      this.setTime(el.currentTime);
    }
  }

  protected onEnded(): void {
    this.setPlaying(false);
    this.playbackEnd.emit();
    this.setTime(this.duration());
  }

  protected setPlaying(playing: boolean): void {
    this.playing.set(playing);
    this.playingChange.emit(playing);
  }

  protected seekFromEvent(event: MouseEvent): void {
    const el = this.el;
    const dur = this.duration();
    if (!el || dur <= 0) {
      return;
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const ratio = Math.min(
      1,
      Math.max(0, (event.clientX - rect.left) / rect.width),
    );
    this.userMove(el, ratio * dur);
  }

  protected onTrackKey(event: KeyboardEvent): void {
    const el = this.el;
    const dur = this.duration();
    if (!el || dur <= 0) {
      return;
    }
    const step = this.keyStepSeconds();
    let next: number;
    switch (event.key) {
      case "ArrowLeft":
        next = Math.max(0, el.currentTime - step);
        break;
      case "ArrowRight":
        next = Math.min(dur, el.currentTime + step);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = dur;
        break;
      case " ":
      case "Enter":
        event.preventDefault();
        this.togglePlay();
        return;
      default:
        return;
    }
    event.preventDefault();
    this.userMove(el, next);
  }

  private userMove(el: HTMLAudioElement, seconds: number): void {
    this.userSeek.emit(seconds);
    el.currentTime = seconds;
    this.setTime(seconds);
  }

  private setTime(seconds: number): void {
    this.currentTime.set(seconds);
    this.timeUpdate.emit(seconds);
  }
}
