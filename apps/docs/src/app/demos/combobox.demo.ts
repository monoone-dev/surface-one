import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  SoneComboboxComponent,
  type SoneComboboxItems,
  type SoneComboboxValue,
} from "@surface-one/angular/combobox";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";

const TEMPLATE = `<div class="demo-row" style="align-items: flex-start; flex-wrap: wrap; min-height: 20rem">
  <div soneField style="width: 16rem">
    <label soneFieldLabel for="demo-framework">Framework</label>
    <sone-combobox inputId="demo-framework" [options]="frameworks" [(value)]="framework" placeholder="Select a framework" clearable />
  </div>
  <div soneField style="width: 20rem">
    <label soneFieldLabel for="demo-cities">Cities</label>
    <sone-combobox inputId="demo-cities" [options]="cities" [(value)]="picked" multiple placeholder="Add a city" />
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-combobox-demo",
  imports: [SoneComboboxComponent, ...SONE_FIELD_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class ComboboxDemo {
  readonly frameworks: SoneComboboxItems = [
    { value: "next", label: "Next.js" },
    { value: "sveltekit", label: "SvelteKit" },
    { value: "nuxt", label: "Nuxt.js" },
    { value: "remix", label: "Remix", disabled: true },
    { value: "astro", label: "Astro" },
  ];
  readonly cities: SoneComboboxItems = [
    {
      label: "Europe",
      options: [
        { value: "warsaw", label: "Warsaw" },
        { value: "lisbon", label: "Lisbon" },
        { value: "krakow", label: "Kraków" },
      ],
    },
    {
      label: "Asia",
      options: [
        { value: "tokyo", label: "Tokyo" },
        { value: "seoul", label: "Seoul" },
      ],
    },
  ];
  readonly framework = signal<SoneComboboxValue>("nuxt");
  readonly picked = signal<SoneComboboxValue>(["lisbon", "tokyo"]);
}
