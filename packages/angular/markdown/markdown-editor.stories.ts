import { signal } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  SONE_MARKDOWN_EDITOR_PARTS,
  type MarkdownEditorAppearance,
  type MarkdownEditorMode,
  type MarkdownEditorToolbar,
  SoneMarkdownEditorComponent,
} from "./markdown-editor.component";

const NOTE = `## Decisions

- [x] Ship the redaction firewall first
- [ ] Review the OPAQUE login flow

Run \`scripts/ci.sh\` before opening the PR. See [the checklist](https://example.com).

> Anything that leaves the machine has to be loud.`;

interface EditorArgs {
  mode: MarkdownEditorMode;
  toolbar: MarkdownEditorToolbar;
  appearance: MarkdownEditorAppearance;
  tabs: boolean;
  minRows: number;
  placeholder: string;
  invalid: boolean;
  readonly: boolean;
}

const meta: Meta<EditorArgs> = {
  title: "Components/Forms/Markdown Editor",
  component: SoneMarkdownEditorComponent,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        ReactiveFormsModule,
        SoneButtonDirective,
        ...SONE_MARKDOWN_EDITOR_PARTS,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-markdown-editor>` — THE markdown editor. A ControlValueAccessor (`formControl`, " +
          "`formControlName`) and also `[(value)]`; `[(mode)]` = `edit` | `preview` | `split`. An " +
          "auto-growing textarea (hidden mirror — typing never jumps), a DS toolbar (`full` | `minimal` | " +
          "`document` | `none`; `stickyToolbar` pins it while the page scrolls), ⌘/Ctrl+B · I · K · ⇧X · " +
          "⇧9 (task list), Enter continues lists and task lists, and edits stay on the native undo " +
          'stack. `appearance="bare"` is the document surface (no frame, prose metrics). Hosts can ' +
          "project `<ng-template soneMarkdownPreview let-source>` for their own renderer, " +
          "`[soneMarkdownEditorTools]` for extra tools and `[soneMarkdownEditorFooter]` for menus, and " +
          "drive it through `focus()` / `insertText()` / `replaceRange()` / `wrapSelection()` / " +
          "`getSelection()` / `setSelection()` / `textarea()`. `editorKeydown` fires BEFORE the " +
          "built-ins — `preventDefault()` there and the editor stands aside; `toolbarCommand` does the same " +
          "for a toolbar press." +
          "\n\n**Reference**\n" +
          "- shadcn.io — [https://www.shadcn.io/ui/markdown](https://www.shadcn.io/ui/markdown) (the preview)\n" +
          "- shadcn/ui typography — [https://ui.shadcn.com/docs/components/typography](https://ui.shadcn.com/docs/components/typography)\n" +
          "- built from spartan [tabs](https://spartan.ng/components/tabs), [button](https://spartan.ng/components/button), " +
          "[textarea](https://spartan.ng/components/textarea), [input group](https://spartan.ng/components/input-group), " +
          "[separator](https://spartan.ng/components/separator), [tooltip](https://spartan.ng/components/tooltip)",
      },
    },
  },
  argTypes: {
    mode: { control: "inline-radio", options: ["edit", "preview", "split"] },
    toolbar: {
      control: "inline-radio",
      options: ["full", "minimal", "document", "none"],
    },
    appearance: { control: "inline-radio", options: ["field", "bare"] },
    tabs: { control: "boolean" },
    minRows: { control: { type: "number", min: 1, max: 20 } },
    placeholder: { control: "text" },
    invalid: { control: "boolean" },
    readonly: { control: "boolean" },
  },
  args: {
    mode: "edit",
    toolbar: "full",
    appearance: "field",
    tabs: true,
    minRows: 5,
    placeholder: "Write in markdown…",
    invalid: false,
    readonly: false,
  },
  render: (args) => ({
    props: { ...args, control: new FormControl(NOTE) },
    template: `<div style="max-width: 680px">
      <sone-markdown-editor
        [formControl]="control"
        ariaLabel="Meeting note"
        [mode]="mode"
        [toolbar]="toolbar"
        [appearance]="appearance"
        [tabs]="tabs"
        [minRows]="minRows"
        [placeholder]="placeholder"
        [invalid]="invalid"
        [readonly]="readonly"
      />
    </div>`,
  }),
};
export default meta;
type Story = StoryObj<EditorArgs>;

export const Filled: Story = {};

export const Empty: Story = {
  render: (args) => ({
    props: { ...args, control: new FormControl("") },
    template: `<div style="max-width: 680px">
      <sone-markdown-editor [formControl]="control" ariaLabel="Description" [placeholder]="placeholder" [minRows]="3" />
    </div>`,
  }),
};

export const Preview: Story = { args: { mode: "preview" } };

export const Split: Story = {
  args: { mode: "split" },
  render: (args) => ({
    props: { ...args, control: new FormControl(NOTE) },
    template: `<div style="max-width: 960px">
      <sone-markdown-editor [formControl]="control" ariaLabel="Meeting note" mode="split" [minRows]="minRows" />
    </div>`,
  }),
};

export const MinimalToolbar: Story = {
  args: { toolbar: "minimal", minRows: 3 },
};

export const NoToolbar: Story = { args: { toolbar: "none", minRows: 3 } };

export const Disabled: Story = {
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl({ value: NOTE, disabled: true }),
    },
    template: `<div style="max-width: 680px">
      <sone-markdown-editor [formControl]="control" ariaLabel="Meeting note" />
    </div>`,
  }),
};

export const Invalid: Story = { args: { invalid: true } };

export const ReadOnly: Story = { args: { readonly: true } };

export const WithFormControl: Story = {
  render: (args) => {
    const control = new FormControl(
      "Type here, or select text and press **⌘B**.",
    );
    return {
      props: { ...args, control },
      template: `<div style="max-width: 680px; display: grid; gap: var(--space-3)">
        <sone-markdown-editor [formControl]="control" ariaLabel="Task description" [minRows]="3" />
        <pre style="margin: 0; color: var(--text-secondary); font: var(--font-size-xs)/1.5 var(--font-mono);
                    white-space: pre-wrap">{{ control.value }}</pre>
        <div style="display: flex; gap: var(--space-2)">
          <button soneBtn type="button" variant="outline" size="sm" (click)="control.disable()">Disable</button>
          <button soneBtn type="button" variant="outline" size="sm" (click)="control.enable()">Enable</button>
          <button soneBtn type="button" variant="outline" size="sm" (click)="control.setValue('')">Clear</button>
        </div>
      </div>`,
    };
  },
};

export const BareDocument: Story = {
  render: (args) => {
    const value = signal(NOTE);
    const mode = signal<MarkdownEditorMode>("preview");
    return {
      props: { ...args, value, mode },
      template: `<div style="max-width: 680px; font-family: var(--font-reading)">
        <p style="color: var(--text-secondary); font-size: var(--font-size-sm)">
          Click the text to edit · click outside (or Esc) to preview · mode: {{ mode() }}
        </p>
        <div (click)="mode.set('edit')" (keydown.escape)="mode.set('preview')" tabindex="-1">
          <sone-markdown-editor
            appearance="bare"
            toolbar="none"
            [tabs]="false"
            [value]="value()"
            (valueChange)="value.set($event)"
            [mode]="mode()"
            (modeChange)="mode.set($event)"
            (editorBlur)="mode.set('preview')"
            ariaLabel="Note markdown"
            textareaClass="body-area"
            [minRows]="6"
          />
        </div>
      </div>`,
    };
  },
};

export const HostSlots: Story = {
  render: (args) => ({
    props: { ...args, control: new FormControl(NOTE) },
    template: `<div style="max-width: 680px">
      <sone-markdown-editor #ed="soneMarkdownEditor" [formControl]="control" ariaLabel="Note" toolbar="minimal">
        <div soneMarkdownEditorTools>
          <button soneBtn type="button" variant="ghost" size="sm" (mousedown)="$event.preventDefault()"
                  (click)="ed.insertText('[[Weekly sync]]')">Insert link</button>
        </div>
        <ng-template soneMarkdownPreview let-source>
          <p style="margin: 0 0 var(--space-2); color: var(--text-secondary); font-size: var(--font-size-xs)">
            Host renderer — {{ source.length }} characters
          </p>
          <pre style="margin: 0; white-space: pre-wrap; font: var(--font-size-sm)/1.5 var(--font-mono)">{{ source }}</pre>
        </ng-template>
      </sone-markdown-editor>
    </div>`,
  }),
};

export const DocumentToolbar: Story = {
  render: (args) => {
    const value = signal(
      NOTE +
        "\n\n" +
        Array.from(
          { length: 12 },
          (_, i) => `Paragraph ${i + 1} — scroll to see the toolbar stay put.`,
        ).join("\n\n"),
    );
    return {
      props: { ...args, value },
      template: `<div style="max-width: 720px; height: 420px; overflow-y: auto; padding: 0 var(--space-5) var(--space-5);
                      border: 1px solid var(--border-subtle); border-radius: var(--radius-lg)">
        <sone-markdown-editor
          appearance="bare"
          toolbar="document"
          stickyToolbar
          [tabs]="false"
          [value]="value()"
          (valueChange)="value.set($event)"
          ariaLabel="Note body"
          [minRows]="8"
        >
          <div soneMarkdownEditorTools>
            <button soneBtn type="button" variant="ghost" size="sm" (mousedown)="$event.preventDefault()">Ask Ivy</button>
          </div>
        </sone-markdown-editor>
      </div>`,
    };
  },
};

export const TaskList: Story = {
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl("Buy milk\nCall Anna\nBook the room"),
    },
    template: `<div style="max-width: 680px; display: grid; gap: var(--space-2)">
      <p style="margin: 0; color: var(--text-secondary); font-size: var(--font-size-sm)">
        Select the three lines, then press <b>Task list</b> (or ⌘⇧9). Enter at the end of an item adds the next one.
      </p>
      <sone-markdown-editor [formControl]="control" ariaLabel="Checklist" toolbar="document" [minRows]="5" />
    </div>`,
  }),
};
