import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import {
  SoneLogoComponent,
  type LogoBrand,
  type LogoKind,
  type LogoSize,
} from "./logo.component";

interface LogoArgs {
  size: LogoSize;
  brand: LogoBrand;
  kind: LogoKind;
  label: string;
}

const meta: Meta<LogoArgs> = {
  title: "Components/Brand/Logo",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneLogoComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-logo>` — the SurfaceOne, IndexOne and Ivy marks, light or dark by theme. `brand`: `surface-one` (default) | `index-one` | `ivy`; " +
          "`kind`: `tile` (app icon) | `mark` (no tile, for buttons). Sizes: `xs` 16, `sm` 24, `default` 40, `lg` 72. " +
          "Decorative unless a `label` is given. Serve the SVGs from `@surface-one/tokens/brand` and point " +
          "`provideSoneLogoAssets()` at them (default `assets/brand/`).",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["xs", "sm", "default", "lg"] },
    brand: {
      control: "inline-radio",
      options: ["surface-one", "index-one", "ivy"],
    },
    kind: { control: "inline-radio", options: ["tile", "mark"] },
  },
  args: { size: "default", brand: "surface-one", kind: "tile", label: "" },
  render: (args) => ({
    props: args,
    template: `<sone-logo [size]="size" [brand]="brand" [kind]="kind" [label]="label" />`,
  }),
};
export default meta;

export const Default: StoryObj<LogoArgs> = {};
export const Large: StoryObj<LogoArgs> = {
  args: { size: "lg", label: "SurfaceOne" },
};
export const SurfaceOneMark: StoryObj<LogoArgs> = {
  args: { kind: "mark", size: "lg" },
};
export const IndexOne: StoryObj<LogoArgs> = {
  args: { brand: "index-one", size: "lg", label: "IndexOne" },
};
export const IvyTile: StoryObj<LogoArgs> = {
  args: { brand: "ivy", size: "lg", label: "Ivy" },
};
export const IvyMark: StoryObj<LogoArgs> = {
  args: { brand: "ivy", kind: "mark", size: "xs" },
};
