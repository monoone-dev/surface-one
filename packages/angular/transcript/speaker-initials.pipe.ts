import { Pipe, type PipeTransform } from "@angular/core";
import { speakerInitials } from "./transcript.types";

@Pipe({ name: "speakerInitials" })
export class SoneSpeakerInitialsPipe implements PipeTransform {
  transform(label: string | null | undefined): string {
    return speakerInitials(label);
  }
}
