import type { Meta, StoryContext, StoryObj } from "@storybook/angular";

import accents from "../../../../tokens/src/tokens/accents.css?raw";
import layout from "../../../../tokens/src/tokens/layout.css?raw";
import scale from "../../../../tokens/src/tokens/scale.css?raw";
import typography from "../../../../tokens/src/tokens/typography.css?raw";
import minimalistDark from "../../../../tokens/src/themes/minimalist.dark.theme.scss?raw";
import minimalistLight from "../../../../tokens/src/themes/minimalist.light.theme.scss?raw";
import materialDark from "../../../../tokens/src/themes/material.dark.theme.scss?raw";
import materialLight from "../../../../tokens/src/themes/material.light.theme.scss?raw";
import surfaceDark from "../../../../tokens/src/themes/surface.dark.theme.scss?raw";
import surfaceLight from "../../../../tokens/src/themes/surface.light.theme.scss?raw";
import neumorphism from "../../../../tokens/src/themes/neumorphism.theme.scss?raw";
import paperDark from "../../../../tokens/src/themes/paper.dark.theme.scss?raw";
import paperLight from "../../../../tokens/src/themes/paper.light.theme.scss?raw";
import studioDark from "../../../../tokens/src/themes/studio.dark.theme.scss?raw";
import studioLight from "../../../../tokens/src/themes/studio.light.theme.scss?raw";
import { TokenTableComponent } from "../token-table/token-table.component";

const meta: Meta<TokenTableComponent> = {
  title: "Design tokens/Catalog",
  component: TokenTableComponent,
  tags: ["!dev", "!autodocs"],
  parameters: { controls: { disable: true }, layout: "padded" },
};
export default meta;
type Story = StoryObj<TokenTableComponent>;

function catalogue(source: string): Story {
  return {
    render: (_args, context: StoryContext) => ({
      props: { source, revision: JSON.stringify(context.globals) },
      template: `<app-token-table [source]="source" [revision]="revision" />`,
    }),
  };
}

export const Typography = catalogue(typography);
export const Layout = catalogue(layout);
export const Scale = catalogue(scale);
export const Accents = catalogue(accents);
export const MinimalistLight = catalogue(minimalistLight);
export const MinimalistDark = catalogue(minimalistDark);
export const StudioLight = catalogue(studioLight);
export const StudioDark = catalogue(studioDark);
export const PaperLight = catalogue(paperLight);
export const PaperDark = catalogue(paperDark);
export const Neumorphism = catalogue(neumorphism);
export const MaterialLight = catalogue(materialLight);
export const MaterialDark = catalogue(materialDark);
export const SurfaceLight = catalogue(surfaceLight);
export const SurfaceDark = catalogue(surfaceDark);
