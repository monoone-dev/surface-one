import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SoneFileUploadComponent } from "./file-upload.component";

const meta: Meta<SoneFileUploadComponent> = {
  title: "Components/Forms/File Upload",
  component: SoneFileUploadComponent,
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [...SONE_FIELD_PARTS] })],
  parameters: {
    docs: {
      description: {
        component:
          '`<sone-file-upload>` — a dropzone around the native `<input type="file">`, which lies over the ' +
          "whole zone: a click anywhere, Enter / Space on the focused input or a drop add files. They are " +
          "checked against `accept`, `maxSize` (bytes) and `maxFiles` (with `multiple`; without it a new " +
          "file replaces the current one) and what is turned away is named in an alert and emitted by " +
          "`(rejected)`. The list shows each file's name, size, an image thumbnail (`preview`, object URLs " +
          "revoked on removal and destroy) and a remove button named after the file. `[(value)]` is a " +
          "`File[]` (also `ngModel` / `formControl`), mirrored into the input so a native form posts it; " +
          "`disabled`, `invalid`, `label`, `description`. Inside `[soneField]` the field describes the input." +
          "\n\n**Reference**\n" +
          "- Nuxt UI — [FileUpload](https://ui.nuxt.com/docs/components/file-upload)\n" +
          "- shadcn/ui — [input (file)](https://ui.shadcn.com/docs/components/input)",
      },
    },
  },
  args: {
    multiple: true,
    accept: "image/*,.pdf",
    maxSize: 2_000_000,
    maxFiles: 4,
    description: "PNG, JPG or PDF, up to 2 MB each",
    disabled: false,
    invalid: false,
  },
};
export default meta;
type Story = StoryObj<SoneFileUploadComponent>;

export const Default: Story = {};

export const Single: Story = {
  args: {
    multiple: false,
    accept: "image/*",
    description: "One image, up to 2 MB",
  },
};

export const InAField: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div soneField [invalid]="invalid" style="max-width: 28rem">
        <label soneFieldLabel for="story-attachments">Attachments</label>
        <sone-file-upload inputId="story-attachments" [multiple]="multiple" [accept]="accept"
          [maxSize]="maxSize" [maxFiles]="maxFiles" [description]="description" [invalid]="invalid" />
        <p soneFieldDescription>Attached to the meeting notes.</p>
      </div>`,
  }),
};

export const Disabled: Story = {
  args: { disabled: true },
};
