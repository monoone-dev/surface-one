import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SONE_AVATAR_PARTS } from "@surface-one/angular/avatar";
import { SoneAvatarGroupComponent } from "@surface-one/angular/avatar-group";

const TEMPLATE = `<div class="demo-stack">
  <sone-avatar-group ariaLabel="Project members" [people]="people" [max]="3" />
  <sone-avatar-group ariaLabel="Reviewers" size="sm">
    <sone-avatar role="img" aria-label="Ada Lovelace">
      <span soneAvatarFallback aria-hidden="true">AL</span>
    </sone-avatar>
    <sone-avatar role="img" aria-label="Grace Hopper">
      <span soneAvatarFallback aria-hidden="true">GH</span>
    </sone-avatar>
  </sone-avatar-group>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-avatar-group-demo",
  imports: [SoneAvatarGroupComponent, ...SONE_AVATAR_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class AvatarGroupDemo {
  readonly people = [
    { name: "Ada Lovelace" },
    { name: "Grace Hopper" },
    { name: "Alan Turing" },
    { name: "Katherine Johnson" },
    { name: "Margaret Hamilton" },
  ];
}
