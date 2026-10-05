import { Directive } from "@angular/core";

@Directive({
  selector: "[soneSkeleton], sone-skeleton",
  host: { class: "skeleton", "data-slot": "skeleton", "aria-hidden": "true" },
})
export class SoneSkeletonDirective {}
