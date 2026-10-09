import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneSelectComponent } from "@surface-one/angular/select";
import { SoneSwitchComponent } from "@surface-one/angular/switch";
import { SONE_FIELD_PARTS } from "./field.directive";

const meta: Meta = {
  title: "Components/Forms/Field",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        ReactiveFormsModule,
        ...SONE_FIELD_PARTS,
        SoneSelectComponent,
        SoneSwitchComponent,
        SoneButtonDirective,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "spartan/ui **Input · Textarea · Native Select · Checkbox · Radio Group · Switch · Label · " +
          "Field**. The native controls are styled globally (`input/forms.css`), so every `<input>`, " +
          "`<select>` and `<textarea>` is already the design-system control; `<sone-select>` and " +
          "`<sone-switch>` wrap them for Angular forms.\n\n" +
          "A form is laid out with the Field parts: `fieldset[soneFieldSet]` › `legend[soneFieldLegend]` › " +
          "`[soneFieldGroup]` › `[soneField]` › `label[soneFieldLabel]` + control + " +
          "`[soneFieldDescription]` + `[soneFieldError]`. `[soneField]` adds every description and error " +
          "to the control's `aria-describedby`, and `invalid` sets `aria-invalid` on it.\n\n" +
          "Sizes follow shadcn: Input and Textarea have ONE size (`--control-h-md`, Nova h-8); Native " +
          "Select and Switch have `default` and `sm`.\n\n" +
          "The core is shadcn **Nova** (Minimalist): transparent wells on `border-input`, no hover " +
          "change, `border-ring` + ring-3 on focus, a destructive ring on invalid controls even at rest, " +
          "a greyed disabled well. Use the toolbar **Skin** × **Theme** switches for Studio (Vega + " +
          "Nuxt UI Sky soft fills) and Paper (Maia: pill wells, rounded-xl textarea without resize)." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [input](https://www.spartan.ng/components/input), [textarea](https://www.spartan.ng/components/textarea), [native-select](https://www.spartan.ng/components/native-select), [checkbox](https://www.spartan.ng/components/checkbox), [radio-group](https://www.spartan.ng/components/radio-group), [switch](https://www.spartan.ng/components/switch), [label](https://www.spartan.ng/components/label), [field](https://www.spartan.ng/components/field)\n" +
          "- shadcn/ui — [input](https://ui.shadcn.com/docs/components/input), [textarea](https://ui.shadcn.com/docs/components/textarea), [native-select](https://ui.shadcn.com/docs/components/native-select), [checkbox](https://ui.shadcn.com/docs/components/checkbox), [radio-group](https://ui.shadcn.com/docs/components/radio-group), [switch](https://ui.shadcn.com/docs/components/switch), [label](https://ui.shadcn.com/docs/components/label), [field](https://ui.shadcn.com/docs/components/field)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const NativeControls: Story = {
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: var(--space-4); max-width: 52rem">
        <input type="text" aria-label="Rest" value="Weekly sync" />
        <input type="text" aria-label="Placeholder" placeholder="Meeting title" />
        <input type="text" aria-label="Disabled" value="Disabled" disabled />
        <input type="text" aria-label="Invalid" value="not a url" aria-invalid="true" />
        <input type="text" aria-label="Read-only" value="Read-only" readonly />
        <input type="password" aria-label="Password" value="sk-ant-0000" />
        <input type="search" aria-label="Search" placeholder="Search" />
        <input type="number" aria-label="Number" value="42" />
        <input type="date" aria-label="Date" value="2026-09-27" />
        <input type="time" aria-label="Time" value="09:30" />
        <select aria-label="Native select"><option>Whisper medium</option><option>Whisper large-v3</option></select>
        <select aria-label="Native select, sm" data-size="sm"><option>Size sm</option></select>
        <select aria-label="Invalid select" aria-invalid="true"><option>Invalid</option></select>
        <select aria-label="Disabled select" disabled><option>Disabled</option></select>
        <textarea aria-label="Textarea" placeholder="Type your message here." style="grid-column: 1 / -1"></textarea>
        <textarea aria-label="Invalid textarea" aria-invalid="true" style="grid-column: 1 / -1">Too short</textarea>
        <textarea aria-label="Disabled textarea" disabled style="grid-column: 1 / -1">Disabled</textarea>
      </div>`,
  }),
};

export const CheckboxAndRadio: Story = {
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(2, max-content); gap: var(--space-3) var(--space-7)">
        <div style="display: grid; gap: var(--space-3)">
          <label soneLabel><input type="checkbox" /> Unchecked</label>
          <label soneLabel><input type="checkbox" checked /> Checked</label>
          <label soneLabel><input type="checkbox" [indeterminate]="true" /> Indeterminate</label>
          <label soneLabel><input type="checkbox" aria-invalid="true" /> Invalid</label>
          <label soneLabel><input type="checkbox" aria-invalid="true" checked /> Checked, invalid</label>
          <label soneLabel><input type="checkbox" disabled /> Disabled</label>
          <label soneLabel><input type="checkbox" checked disabled /> Checked, disabled</label>
        </div>
        <div role="radiogroup" aria-label="Transcription quality" style="display: grid; gap: var(--space-3)">
          <label soneLabel><input type="radio" name="q" value="fast" /> Fast</label>
          <label soneLabel><input type="radio" name="q" value="bal" checked /> Balanced</label>
          <label soneLabel><input type="radio" name="q" value="acc" aria-invalid="true" /> Invalid</label>
          <label soneLabel><input type="radio" name="q2" disabled /> Disabled</label>
          <label soneLabel><input type="radio" name="q2" checked disabled /> Checked, disabled</label>
        </div>
      </div>`,
  }),
};

export const SwitchStates: Story = {
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(2, max-content); gap: var(--space-3) var(--space-7)">
        @for (size of ['default', 'sm']; track size) {
          <div style="display: grid; gap: var(--space-3)">
            <label soneLabel><input type="checkbox" class="switch" [attr.data-size]="size" /> Off ({{ size }})</label>
            <label soneLabel><input type="checkbox" class="switch" [attr.data-size]="size" checked /> On</label>
            <label soneLabel><input type="checkbox" class="switch" [attr.data-size]="size" aria-invalid="true" /> Invalid</label>
            <label soneLabel><input type="checkbox" class="switch" [attr.data-size]="size" aria-invalid="true" checked /> On, invalid</label>
            <label soneLabel><input type="checkbox" class="switch" [attr.data-size]="size" disabled /> Disabled</label>
            <label soneLabel><input type="checkbox" class="switch" [attr.data-size]="size" checked disabled /> On, disabled</label>
          </div>
        }
      </div>`,
  }),
};

export const FieldVertical: Story = {
  render: () => ({
    props: {
      url: new FormControl("localhost:11434"),
      key: new FormControl(""),
    },
    template: `
      <div soneFieldGroup style="max-width: 24rem">
        <div soneField>
          <label soneFieldLabel for="st-key">API key</label>
          <input id="st-key" type="password" placeholder="sk-ant-…" [formControl]="key" />
          <p soneFieldDescription>Stored in the macOS Keychain, never in the vault.</p>
        </div>
        <div soneField invalid>
          <label soneFieldLabel for="st-url">Ollama URL</label>
          <input id="st-url" type="url" [formControl]="url" />
          <p soneFieldDescription>A loopback address keeps generation on this Mac.</p>
          <p soneFieldError>Include the scheme — http://localhost:11434.</p>
        </div>
        <div soneField disabled>
          <label soneFieldLabel for="st-model">Model</label>
          <sone-select selectId="st-model" [disabled]="true" value="llama">
            <option value="llama">llama3.1:8b</option>
          </sone-select>
          <p soneFieldDescription>Connect Ollama to pick a model.</p>
        </div>
        <div soneField>
          <label soneFieldLabel for="st-notes">Instructions</label>
          <textarea id="st-notes" placeholder="Summarise decisions first."></textarea>
        </div>
      </div>`,
  }),
};

export const FieldHorizontal: Story = {
  render: () => ({
    props: { live: new FormControl(true), sys: new FormControl(false) },
    template: `
      <div soneFieldGroup variant="choices" style="max-width: 28rem">
        <div soneField orientation="horizontal">
          <div soneFieldContent>
            <label soneFieldLabel for="st-live">Live captions</label>
            <p soneFieldDescription>Transcribe while the meeting is running.</p>
          </div>
          <sone-switch inputId="st-live" [formControl]="live" />
        </div>
        <div soneField orientation="horizontal">
          <div soneFieldContent>
            <label soneFieldLabel for="st-sys">Record system audio</label>
            <p soneFieldDescription>Needs the Screen Recording permission.</p>
          </div>
          <sone-switch inputId="st-sys" size="sm" [formControl]="sys" />
        </div>
        <div soneField orientation="horizontal">
          <input id="st-terms" type="checkbox" />
          <label soneFieldLabel for="st-terms">Summarize after every meeting</label>
        </div>
      </div>`,
  }),
};

export const FieldSet: Story = {
  render: () => ({
    template: `
      <form style="max-width: 34rem" (submit)="$event.preventDefault()">
        <fieldset soneFieldSet>
          <legend soneFieldLegend>Transcription</legend>
          <p soneFieldDescription>Runs on this Mac with whisper.cpp.</p>
          <div soneFieldGroup>
            <div soneField orientation="responsive">
              <div soneFieldContent>
                <label soneFieldLabel for="st-lang">Language</label>
                <p soneFieldDescription>Detect, or pin one for accuracy.</p>
              </div>
              <select id="st-lang"><option>Detect automatically</option><option>English</option><option>Polski</option></select>
            </div>
            <div soneFieldSeparator><span soneFieldSeparatorContent>Speakers</span></div>
            <fieldset soneFieldSet>
              <legend soneFieldLegend variant="label">Label speakers as</legend>
              <div soneFieldGroup variant="choices" role="radiogroup">
                <div soneField orientation="horizontal">
                  <input id="st-me" type="radio" name="spk" checked />
                  <label soneFieldLabel for="st-me">Me / Others</label>
                </div>
                <div soneField orientation="horizontal">
                  <input id="st-names" type="radio" name="spk" />
                  <label soneFieldLabel for="st-names">Voiceprint names</label>
                </div>
              </div>
            </fieldset>
            <div soneField orientation="horizontal">
              <button soneBtn type="submit">Save</button>
              <button soneBtn variant="outline" type="button">Cancel</button>
            </div>
          </div>
        </fieldset>
      </form>`,
  }),
};
