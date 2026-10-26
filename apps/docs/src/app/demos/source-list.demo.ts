import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SONE_ITEM_PARTS } from "@surface-one/angular/item";
import { SoneMarkComponent } from "@surface-one/angular/mark";
import {
  SoneSourceListComponent,
  SoneSourceListItemDirective,
  SoneSourceListTriggerComponent,
} from "@surface-one/angular/source-list";

interface Source {
  id: string;
  title: string;
  date: string;
}

const TEMPLATE = `<div class="demo-stack" style="max-width: 32rem">
  <sone-source-list variant="chip" label="Sources" [items]="sources" [trackBy]="byId" [limit]="3">
    <ng-template soneSourceListItem [soneSourceListItemOf]="sources" let-s>
      <span soneItem variant="outline" size="xs">{{ s.title }} · {{ s.date }}</span>
    </ng-template>
  </sone-source-list>

  <sone-source-list variant="row" size="sm" label="Sources" showCount [items]="sources" [trackBy]="byId" [limit]="3">
    <ng-template soneSourceListItem [soneSourceListItemOf]="sources" let-s>
      <div soneItem variant="muted" size="xs">
        <div soneItemContent>
          <span soneItemTitle>{{ s.title }}</span>
          <span soneItemDescription>{{ s.date }}</span>
        </div>
      </div>
    </ng-template>
  </sone-source-list>

  <div>
    <button soneSourceListTrigger [count]="sources.length" [attr.aria-expanded]="open()"
      [attr.aria-controls]="open() ? 'answer-sources' : null" (click)="open.set(!open())">
      <sone-mark icon="meetings" tone="lagoon" size="sm" />
      <sone-mark icon="notes" tone="iris" size="sm" />
      <sone-mark icon="tasks" tone="amber" size="sm" />
    </button>
  </div>
  @if (open()) {
    <sone-source-list id="answer-sources" variant="row" size="sm" ariaLabel="Sources" [items]="sources" [trackBy]="byId">
      <ng-template soneSourceListItem [soneSourceListItemOf]="sources" let-s>
        <span soneItem variant="muted" size="xs">{{ s.title }} · {{ s.date }}</span>
      </ng-template>
    </sone-source-list>
  }
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-source-list-demo",
  imports: [
    SoneSourceListComponent,
    SoneSourceListItemDirective,
    SoneSourceListTriggerComponent,
    SoneMarkComponent,
    ...SONE_ITEM_PARTS,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class SourceListDemo {
  readonly open = signal(false);
  readonly sources: Source[] = [
    { id: "s1", title: "Harbour Lane kickoff", date: "Mar 3" },
    { id: "s2", title: "Pricing review", date: "Mar 5" },
    { id: "s3", title: "Team retro", date: "Mar 9" },
    { id: "s4", title: "Onboarding notes", date: "Mar 12" },
    { id: "s5", title: "Vendor call", date: "Mar 14" },
  ];

  readonly byId = (source: Source): string => source.id;
}
