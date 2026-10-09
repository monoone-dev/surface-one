import { Pipe, PipeTransform } from "@angular/core";
import { clockTime, durationLabel } from "@surface-one/angular/format";

/** `{{ start | clock }}` → `4:05`; `{{ start | clock: end }}` → `4:05–6:10`. */
@Pipe({ name: "clock" })
export class SoneClockPipe implements PipeTransform {
  transform(seconds: number | null | undefined, until?: number | null): string {
    return until === undefined
      ? clockTime(seconds)
      : `${clockTime(seconds)}–${clockTime(until)}`;
  }
}

/** `{{ meeting.durationS | duration }}` → `12m 5s`, `1h 2m`, `45s` — see `durationLabel`. */
@Pipe({ name: "duration" })
export class SoneDurationPipe implements PipeTransform {
  transform(seconds: number | null | undefined): string {
    return durationLabel(seconds);
  }
}
