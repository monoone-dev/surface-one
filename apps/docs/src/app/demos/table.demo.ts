import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SONE_MENU_PARTS } from "@surface-one/angular/menu";
import { SoneRowMenuComponent } from "@surface-one/angular/row-menu";
import {
  SoneTableColumnComponent,
  SoneTableComponent,
} from "@surface-one/angular/table";

interface Note {
  id: string;
  title: string;
  folder: string;
  modified: string;
}

const TEMPLATE = `<sone-table
  [rows]="notes()"
  [trackBy]="byId"
  [isSelected]="isSelected"
  caption="Notes modified in the last 30 days."
  emptyText="No notes left. Every row went to the trash."
>
  <sone-table-column key="title" header="Title">
    <ng-template let-row>{{ row.title }}</ng-template>
  </sone-table-column>
  <sone-table-column key="folder" header="Folder" width="140px">
    <ng-template let-row><span soneBadge variant="outline">{{ row.folder }}</span></ng-template>
  </sone-table-column>
  <sone-table-column key="modified" header="Last modified" width="140px" [alignEnd]="true">
    <ng-template let-row>{{ row.modified }}</ng-template>
  </sone-table-column>
  <sone-table-column key="actions" header="Actions" width="48px" [hideHeader]="true">
    <ng-template let-row>
      <sone-row-menu [label]="'Actions for ' + row.title">
        <button soneMenuItem type="button" role="menuitem" (click)="selectedId.set(row.id)">Select</button>
        <button soneMenuItem variant="destructive" type="button" role="menuitem" (click)="remove(row.id)">
          Move to trash
        </button>
      </sone-row-menu>
    </ng-template>
  </sone-table-column>
</sone-table>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-table-demo",
  imports: [
    SoneTableComponent,
    SoneTableColumnComponent,
    SoneBadgeDirective,
    SoneRowMenuComponent,
    ...SONE_MENU_PARTS,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class TableDemo {
  readonly notes = signal<Note[]>([
    {
      id: "n1",
      title: "Q4 planning — decisions and owners",
      folder: "Product",
      modified: "Sep 24",
    },
    {
      id: "n2",
      title: "Hiring loop debrief",
      folder: "People",
      modified: "Sep 22",
    },
    {
      id: "n3",
      title: "Research synthesis: onboarding interviews",
      folder: "Research",
      modified: "Sep 19",
    },
    {
      id: "n4",
      title: "Vendor call — licensing terms",
      folder: "Legal",
      modified: "Sep 12",
    },
  ]);
  readonly selectedId = signal<string | null>("n1");

  readonly byId = (note: Note): string => note.id;
  readonly isSelected = (note: Note): boolean => note.id === this.selectedId();

  remove(id: string): void {
    this.notes.update((rows) => rows.filter((row) => row.id !== id));
  }
}
