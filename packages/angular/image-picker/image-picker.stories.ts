import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneImagePickerComponent } from "./image-picker.component";

const PHOTO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90"><rect width="160" height="90" fill="#94a3b8"/><circle cx="120" cy="28" r="12" fill="#f8fafc"/><path d="M0 90 50 40l40 40 20-20 50 30z" fill="#475569"/></svg>',
  );

const meta: Meta = {
  title: "Components/Forms/Image picker",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneImagePickerComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-image-picker>` — a tappable image field, the web twin of the React Native " +
          '`SoneImagePicker`: a dashed placeholder over a native `<input type="file" accept="image/*">` ' +
          "(click, Enter / Space or drop an image), then the preview with change and remove buttons. " +
          "`[(value)]` is the picked `File` or the URL of a stored image (also `ngModel` / `formControl`); " +
          "a `File` is mirrored into the input for a native form post and its object URL is revoked when it " +
          "goes. `accept` and `maxSize` are the file upload's checks; a rejected file is announced and " +
          "emitted as `(rejected)`. `aspectRatio` sizes the box.\n\n**Reference**\n" +
          "- Nuxt UI — [FileUpload](https://ui.nuxt.com/docs/components/file-upload)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Empty: Story = {
  render: () => ({
    props: { value: null },
    template: `<div style="max-width: 20rem"><sone-image-picker [(value)]="value" /></div>`,
  }),
};

export const WithImage: Story = {
  render: () => ({
    props: { value: PHOTO },
    template: `<div style="max-width: 20rem"><sone-image-picker [(value)]="value" alt="Mountains at dusk" /></div>`,
  }),
};

export const Square: Story = {
  render: () => ({
    props: { value: null },
    template: `<div style="max-width: 10rem"><sone-image-picker [(value)]="value" aspectRatio="1" label="Add photo" [maxSize]="2000000" /></div>`,
  }),
};
