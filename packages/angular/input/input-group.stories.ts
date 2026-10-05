import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneKbdComponent } from "@surface-one/angular/kbd";
import { SONE_FIELD_PARTS } from "./field.directive";
import { SONE_INPUT_GROUP_PARTS } from "./input-group.directive";

const SEARCH_ICON = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"
  stroke-linecap="round" aria-hidden="true"><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5 14 14" /></svg>`;
const CLEAR_ICON = `<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor"
  stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg>`;

const meta: Meta = {
  title: "Components/Forms/Input Group",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        ReactiveFormsModule,
        ...SONE_INPUT_GROUP_PARTS,
        ...SONE_FIELD_PARTS,
        SoneButtonDirective,
        SoneKbdComponent,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "spartan/ui **Input Group** — `[soneInputGroup]` is the bordered field (`--control-h-md`: Nova h-8); " +
          "`[soneInputGroupAddon]` (`align` inline-start | inline-end | block-start | block-end) holds " +
          "an icon, `[soneInputGroupText]` or a `soneBtn` (ghost, `xs` / `icon-xs`); the control is " +
          "`input[soneInputGroupInput]` or " +
          "`textarea[soneInputGroupTextarea]` and drops its own chrome. The group rings while its " +
          "CONTROL is `:focus-visible` (a focused addon button rings itself), and takes the invalid / disabled look from itself or from the control." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [input-group](https://www.spartan.ng/components/input-group)\n" +
          "- shadcn/ui — [input-group](https://ui.shadcn.com/docs/components/input-group)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Search: Story = {
  render: () => ({
    props: { q: new FormControl("roadmap") },
    template: `
      <div style="display: grid; gap: var(--space-4); max-width: 26rem">
        <div soneInputGroup>
          <span soneInputGroupAddon>${SEARCH_ICON}</span>
          <input soneInputGroupInput type="search" placeholder="Search meetings, transcripts & notes…"
            aria-label="Search meetings" [formControl]="q" />
          @if (q.value) {
            <span soneInputGroupAddon align="inline-end">
              <button soneBtn variant="ghost" size="icon-xs" type="button" aria-label="Clear search"
                (click)="q.setValue('')">${CLEAR_ICON}</button>
            </span>
          }
        </div>
        <div soneInputGroup>
          <span soneInputGroupAddon>${SEARCH_ICON}</span>
          <input soneInputGroupInput type="search" placeholder="Search settings" aria-label="Search settings" />
          <span soneInputGroupAddon align="inline-end"><sone-kbd>⌘K</sone-kbd></span>
        </div>
      </div>`,
  }),
};

export const Addons: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: var(--space-4); max-width: 26rem">
        <div soneInputGroup>
          <span soneInputGroupAddon><span soneInputGroupText>https://</span></span>
          <input soneInputGroupInput type="text" aria-label="Server" placeholder="relay.example.com" />
          <span soneInputGroupAddon align="inline-end"><span soneInputGroupText>.index-one</span></span>
        </div>
        <div soneInputGroup>
          <input soneInputGroupInput type="number" aria-label="Storage limit" value="20" />
          <span soneInputGroupAddon align="inline-end"><span soneInputGroupText>GB</span></span>
        </div>
        <div soneInputGroup>
          <input soneInputGroupInput type="text" aria-label="Share link" value="index-one://share/7f3a…" readonly />
          <span soneInputGroupAddon align="inline-end">
            <button soneBtn variant="ghost" size="xs" type="button">Copy</button>
          </span>
        </div>
        <div soneInputGroup>
          <span soneInputGroupAddon align="block-start"><span soneInputGroupText>Ask your notes</span></span>
          <textarea soneInputGroupTextarea aria-label="Ask" placeholder="What did we decide about pricing?"></textarea>
          <span soneInputGroupAddon align="block-end">
            <span soneInputGroupText>On-device</span>
            <button soneBtn size="xs" type="button" style="margin-left: auto">Ask</button>
          </span>
        </div>
      </div>`,
  }),
};

export const States: Story = {
  render: () => ({
    template: `
      <div soneFieldGroup style="max-width: 26rem">
        <div soneField invalid>
          <label soneFieldLabel for="ig-url">Relay URL</label>
          <div soneInputGroup>
            <span soneInputGroupAddon><span soneInputGroupText>https://</span></span>
            <input soneInputGroupInput id="ig-url" type="text" value="not a host" />
          </div>
          <p soneFieldError>That is not a host name.</p>
        </div>
        <div soneField disabled>
          <label soneFieldLabel for="ig-dis">Search (disabled)</label>
          <div soneInputGroup>
            <span soneInputGroupAddon>${SEARCH_ICON}</span>
            <input soneInputGroupInput id="ig-dis" type="search" placeholder="Search" disabled />
          </div>
        </div>
        <div soneField>
          <label soneFieldLabel for="ig-ginv">Invalid on the group</label>
          <div soneInputGroup invalid>
            <input soneInputGroupInput id="ig-ginv" type="text" value="relay" />
            <span soneInputGroupAddon align="inline-end"><span soneInputGroupText>.index-one</span></span>
          </div>
        </div>
        <div soneField disabled>
          <label soneFieldLabel for="ig-gdis">Disabled on the group</label>
          <div soneInputGroup disabled>
            <span soneInputGroupAddon>${SEARCH_ICON}</span>
            <input soneInputGroupInput id="ig-gdis" type="search" placeholder="Search" disabled />
          </div>
        </div>
      </div>`,
  }),
};
