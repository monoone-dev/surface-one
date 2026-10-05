import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SONE_ITEM_PARTS } from "@surface-one/angular/item";
import {
  SoneSourceListComponent,
  SoneSourceListItemDirective,
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
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-source-list-demo",
  imports: [
    SoneSourceListComponent,
    SoneSourceListItemDirective,
    ...SONE_ITEM_PARTS,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class SourceListDemo {
  readonly sources: Source[] = [
    { id: "s1", title: "Harbour Lane kickoff", date: "Mar 3" },
    { id: "s2", title: "Pricing review", date: "Mar 5" },
    { id: "s3", title: "Team retro", date: "Mar 9" },
    { id: "s4", title: "Onboarding notes", date: "Mar 12" },
    { id: "s5", title: "Vendor call", date: "Mar 14" },
  ];

  readonly byId = (source: Source): string => source.id;
}
