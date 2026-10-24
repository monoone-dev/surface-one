import { useState } from "react";
import {
  SoneCombobox,
  SoneField,
  SoneFieldLabel,
  type SoneComboboxItems,
  type SoneComboboxValue,
} from "@surface-one/react";

const frameworks: SoneComboboxItems = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt.js" },
  { value: "remix", label: "Remix", disabled: true },
  { value: "astro", label: "Astro" },
];
const cities: SoneComboboxItems = [
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

export default function ComboboxDemo() {
  const [framework, setFramework] = useState<SoneComboboxValue>("nuxt");
  const [picked, setPicked] = useState<SoneComboboxValue>(["lisbon", "tokyo"]);
  return (
    <div className="demo-row" style={{ alignItems: "flex-start", flexWrap: "wrap", minHeight: "20rem" }}>
      <SoneField style={{ width: "16rem" }}>
        <SoneFieldLabel htmlFor="demo-framework">Framework</SoneFieldLabel>
        <SoneCombobox inputId="demo-framework" options={frameworks} value={framework} onValueChange={setFramework} placeholder="Select a framework" clearable />
      </SoneField>
      <SoneField style={{ width: "20rem" }}>
        <SoneFieldLabel htmlFor="demo-cities">Cities</SoneFieldLabel>
        <SoneCombobox inputId="demo-cities" options={cities} value={picked} onValueChange={setPicked} multiple placeholder="Add a city" />
      </SoneField>
    </div>
  );
}
